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

type ImageMode =
  | "study_document_image"
  | "study_mixed_image"
  | "non_study_image"
  | "unclear_image";

type ImageAnalysisResult = {
  accepted?: boolean;
  imageMode?: ImageMode;
  rejectionReason?: string;
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
You are an AI study-material validator and study assistant with vision ability.

The user uploaded or captured an image. Your task is to decide whether the image should be accepted into a study app.

ACCEPT the image only if it clearly appears to be study-related or document-related, such as:
- handwritten or typed notes
- textbook pages
- worksheets
- exam reviewers
- school modules
- classroom slides
- lecture screenshots
- whiteboard writing
- diagrams, charts, graphs, formulas, tables, or educational illustrations
- screenshots of study content
- documents with readable academic, work, research, or informational content

REJECT the image if it is not useful as study material, such as:
- pets or animals
- selfies or portraits
- people posing
- food
- random objects
- bedrooms, rooms, houses, or scenery
- product photos
- memes
- aesthetic photos
- blank or nearly blank images
- images with no visible study/document content

VERY IMPORTANT:
Do not summarize non-study images.
Do not describe a rejected image in detail.
Do not say, "This image shows a dog" or summarize the dog.
If the image is not study material, reject it politely and briefly.
If the image is unclear and you cannot confidently identify study/document content, reject it.

Return ONLY valid JSON in this exact format:
{
  "accepted": true | false,
  "imageMode": "study_document_image" | "study_mixed_image" | "non_study_image" | "unclear_image",
  "rejectionReason": "Short reason if rejected. Empty string if accepted.",
  "script": "If accepted, provide a natural spoken study summary. If validateOnly is true or if rejected, use an empty string."
}

If accepted:
Create a clear, natural spoken summary optimized for text-to-speech.
No markdown.
No bullets.
No headings.
Keep it under 3 minutes of speaking time.

If rejected:
Set accepted to false.
Set script to an empty string.
Use a short rejectionReason, such as:
"This image does not appear to be study material. Please upload notes, slides, textbook pages, worksheets, diagrams, or documents instead."
`;

      const userText = validateOnly || checkOnly
        ? "Validate whether this image is acceptable study material. Do not summarize it yet."
        : "Validate this image. If it is acceptable study material, summarize the study content. If it is not study material, reject it.";

      const chatCompletion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
          script: "",
        });
      }

      return NextResponse.json({
        accepted: true,
        rejected: false,
        imageMode: parsedImageResult.imageMode || "study_document_image",
        script:
          parsedImageResult.script ||
          "This image appears to contain study material, but I could not generate a clear summary from it.",
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

    const truncatedText = extractedText.substring(0, 15000);

    console.log("Sending document text to GROQ...");

    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
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