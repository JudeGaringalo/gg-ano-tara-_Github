export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import * as mammoth from "mammoth";
import * as xlsx from "xlsx";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DOCUMENT_FORMATS = ["pdf", "docx", "xlsx", "xls", "txt"];
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const LONG_DOCUMENT_WORD_LIMIT = 500;

// Use the cheaper/faster text model for extracted document text.
// Keep the vision model only for camera/image uploads because llama-3.1-8b-instant cannot read images.
const GROQ_TEXT_MODEL = "llama-3.1-8b-instant";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

type ImageMode =
  | "study_document_image"
  | "study_mixed_image"
  | "non_study_image"
  | "unclear_image";

type ImageAnalysisResult = {
  accepted?: boolean;
  imageMode?: ImageMode;
  rejectionReason?: string;
  readableWordCount?: number;
  extractedText?: string;
  script?: string;
};

function normalizeFileType(fileType: string) {
  return fileType.toLowerCase().replace(".", "").trim();
}

function isImageFormat(format: string) {
  return IMAGE_FORMATS.includes(format) || format.startsWith("image/");
}

function isDocumentFormat(format: string) {
  return DOCUMENT_FORMATS.includes(format) || format.includes("pdf");
}

function countWords(text: string) {
  const words = text.trim().match(/\b[\w'’-]+\b/g);
  return words ? words.length : 0;
}

function cleanJsonResponse(rawResponse: string) {
  const cleaned = rawResponse
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function parseImageAnalysis(rawResponse: string): ImageAnalysisResult {
  try {
    const cleanedResponse = cleanJsonResponse(rawResponse);
    const parsed = JSON.parse(cleanedResponse);

    return {
      accepted: Boolean(parsed.accepted),
      imageMode: parsed.imageMode || "unclear_image",
      rejectionReason: parsed.rejectionReason || "",
      readableWordCount:
        typeof parsed.readableWordCount === "number"
          ? parsed.readableWordCount
          : countWords(String(parsed.extractedText || "")),
      extractedText: parsed.extractedText || "",
      script: parsed.script || "",
    };
  } catch {
    return {
      accepted: false,
      imageMode: "unclear_image",
      rejectionReason:
        "This image could not be confidently identified as study material.",
      script: "",
    };
  }
}

export async function POST(req: Request) {
  try {
    const {
      filePath,
      fileType,
      checkOnly = false,
      validateOnly = false,
      skipLongDocumentCheck = false,
    } = await req.json();

    if (!filePath || !fileType) {
      return NextResponse.json(
        { error: "Missing file path or type" },
        { status: 400 }
      );
    }

    const format = normalizeFileType(fileType);

    if (!isDocumentFormat(format) && !isImageFormat(format)) {
      return NextResponse.json(
        {
          error: `Unsupported file format: ${format}. Supported formats are PDF, DOCX, XLSX, XLS, TXT, JPG, JPEG, PNG, and WEBP.`,
        },
        { status: 400 }
      );
    }

    /**
     * IMAGE PROCESSING
     *
     * Images are accepted ONLY if they appear to be study material.
     * Non-study photos such as pets, selfies, food, landscapes, rooms,
     * products, or random objects are rejected.
     */
    if (isImageFormat(format)) {
      console.log("Creating signed image URL...");

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage.from("documents").createSignedUrl(filePath, 600);

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error("SUPABASE SIGNED URL ERROR:", signedUrlError);

        return NextResponse.json(
          {
            error:
              signedUrlError?.message ||
              "Failed to create signed URL for image.",
            filePath,
          },
          { status: 500 }
        );
      }

      console.log("Validating image study relevance...");

      const imageValidationPrompt = `
You are an OCR-based study image validator and study assistant.

The user uploaded or captured an image. Your job is to inspect the image and estimate how many READABLE WORDS are visible.

The app rule is now based on readable text count:

ACCEPT:
- Accept the image if it has 3 or more readable words.
- If it has more than 10 readable words, treat it as valid study/document material and create a useful spoken summary when summarization is requested.

REJECT:
- Reject the image if it has fewer than 3 readable words.
- Reject blank, blurry, decorative, random, or non-document images when fewer than 3 readable words can be detected.

IMPORTANT:
- Do not reject only because the image is not obviously a school document.
- If the image contains readable text, notes, slides, textbook content, worksheets, diagrams with labels, screenshots with text, forms, labels, or document-like content, count the readable words.
- Be practical. The goal is to allow photographed notes/documents/screenshots through when enough readable text exists.
- If validateOnly is true or checkOnly is true, do not summarize. Only validate.

Return ONLY valid JSON in this exact format:
{
  "accepted": true | false,
  "imageMode": "study_document_image" | "study_mixed_image" | "non_study_image" | "unclear_image",
  "readableWordCount": 0,
  "extractedText": "Short extracted readable text sample. Empty if none.",
  "rejectionReason": "Short reason if rejected. Empty string if accepted.",
  "script": "If accepted and summarization is requested, provide a natural spoken study summary. If validateOnly/checkOnly is true or if rejected, use an empty string."
}

Decision rules:
- readableWordCount < 3: accepted must be false.
- readableWordCount >= 3: accepted must be true.
- readableWordCount > 10 and summarization is requested: script must summarize the readable content.
- validateOnly/checkOnly: script must be empty.

If rejected, use this rejectionReason:
"This image has too little readable text. Please upload a clearer page, notes, slide, worksheet, screenshot, or document."
`;

      const userText = validateOnly || checkOnly
        ? "Validate this image by readable word count. If it has 3 or more readable words, accept it. If it has fewer than 3 readable words, reject it. Do not summarize it yet."
        : "Validate this image by readable word count. If it has more than 10 readable words, accept it and summarize the readable content. If it has 3 to 10 readable words, accept it and provide a brief summary. If it has fewer than 3 readable words, reject it.";

      const chatCompletion = await groq.chat.completions.create({
        model: GROQ_VISION_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: imageValidationPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userText,
              },
              {
                type: "image_url",
                image_url: {
                  url: signedUrlData.signedUrl,
                },
              },
            ],
          },
        ] as any,
      });

      const rawResponse =
        chatCompletion.choices[0]?.message?.content?.trim() || "";

      const parsedImageResult = parseImageAnalysis(rawResponse);
      const readableWordCount =
        typeof parsedImageResult.readableWordCount === "number"
          ? parsedImageResult.readableWordCount
          : countWords(parsedImageResult.extractedText || "");

      const hasEnoughReadableText = readableWordCount >= 3;

      if (!hasEnoughReadableText) {
        return NextResponse.json({
          accepted: false,
          rejected: true,
          imageMode: parsedImageResult.imageMode || "unclear_image",
          readableWordCount,
          rejectionReason:
            "This image has too little readable text. Please upload a clearer page, notes, slide, worksheet, screenshot, or document.",
          script: "",
        });
      }

      if (!parsedImageResult.accepted) {
        return NextResponse.json({
          accepted: false,
          rejected: true,
          imageMode: parsedImageResult.imageMode || "non_study_image",
          rejectionReason:
            parsedImageResult.rejectionReason ||
            "This image does not appear to be study material. Please upload notes, slides, textbook pages, worksheets, diagrams, or documents instead.",
          script: "",
        });
      }

      if (validateOnly || checkOnly) {
        return NextResponse.json({
          accepted: true,
          rejected: false,
          imageMode: parsedImageResult.imageMode || "study_document_image",
          readableWordCount,
          script: "",
        });
      }

      return NextResponse.json({
        accepted: true,
        rejected: false,
        imageMode: parsedImageResult.imageMode || "study_document_image",
        readableWordCount,
        script:
          parsedImageResult.script ||
          parsedImageResult.extractedText ||
          "This image contains readable text, but I could not generate a clear summary from it.",
      });
    }

    /**
     * DOCUMENT PROCESSING
     */
    console.log("Downloading document...");

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("SUPABASE DOWNLOAD ERROR:", downloadError);
      console.error("Requested filePath:", filePath);

      return NextResponse.json(
        {
          error:
            downloadError?.message || "Failed to download file from Supabase",
          filePath,
        },
        { status: 500 }
      );
    }

    console.log("Extracting text...");

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let extractedText = "";

    if (format.includes("pdf")) {
      const parser = new PDFParse({
        data: new Uint8Array(buffer),
        CanvasFactory,
      });

      try {
        const pdfData = await parser.getText();
        extractedText = pdfData.text;
      } finally {
        await parser.destroy();
      }
    } else if (format === "docx") {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else if (format === "xlsx" || format === "xls") {
      const workbook = xlsx.read(buffer, { type: "buffer" });

      const sheetTexts = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(sheet);
        return `Sheet: ${sheetName}\n${csv}`;
      });

      extractedText = sheetTexts.join("\n\n");
    } else if (format === "txt") {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable text found in this document." },
        { status: 400 }
      );
    }

    const wordCount = countWords(extractedText);
    const isLongDocument = wordCount > LONG_DOCUMENT_WORD_LIMIT;

    if (checkOnly) {
      return NextResponse.json({
        accepted: true,
        rejected: false,
        requiresConfirmation: isLongDocument,
        wordCount,
        limit: LONG_DOCUMENT_WORD_LIMIT,
        fileType: "document",
      });
    }

    if (isLongDocument && !skipLongDocumentCheck) {
      return NextResponse.json({
        accepted: true,
        rejected: false,
        requiresConfirmation: true,
        wordCount,
        limit: LONG_DOCUMENT_WORD_LIMIT,
        message:
          "This document is quite long. It may feel overwhelming to review all at once. Do you still want to continue?",
      });
    }

    const truncatedText = extractedText.substring(0, 8000);

    console.log("Sending document text to GROQ...");

    const chatCompletion = await groq.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "You are an AI study assistant. The user has provided raw text extracted from a study document. Create a clear, engaging, conversational summary of the core concepts that is optimized to be read aloud by a Text-to-Speech engine. Keep it under 3 minutes of speaking time. Do not use markdown formatting like **, #, bullet symbols, or tables because this will be read aloud.",
        },
        {
          role: "user",
          content: `Here is the document text:\n\n${truncatedText}`,
        },
      ],
    });

    return NextResponse.json({
      accepted: true,
      rejected: false,
      requiresConfirmation: false,
      wordCount,
      limit: LONG_DOCUMENT_WORD_LIMIT,
      script:
        chatCompletion.choices[0]?.message?.content ||
        "No summary generated.",
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR STACK:", error?.stack);

    return NextResponse.json(
      {
        error: error?.message || "Unknown server error",
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}