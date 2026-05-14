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
  | "text_image"
  | "mixed_image"
  | "visual_image"
  | "unclear_image";

type ImageAnalysisResult = {
  imageMode?: ImageMode;
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
      imageMode: parsed.imageMode || "unclear_image",
      script: parsed.script || "",
    };
  } catch {
    return {
      imageMode: "unclear_image",
      script:
        rawResponse ||
        "I can see the uploaded image, but I could not confidently generate a structured summary from it.",
    };
  }
}

export async function POST(req: Request) {
  try {
    const {
      filePath,
      fileType,
      checkOnly = false,
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
     * Images do not use the 500-word document warning.
     * They are processed visually, whether they contain text or not.
     */
    if (isImageFormat(format)) {
      if (checkOnly) {
        return NextResponse.json({
          requiresConfirmation: false,
          wordCount: null,
          limit: LONG_DOCUMENT_WORD_LIMIT,
          fileType: "image",
        });
      }

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

      console.log("Sending image to GROQ Vision...");

      const imageAnalysisPrompt = `
You are an AI study assistant with vision ability.

The user uploaded or captured an image. The image may be:
1. A text-heavy image, such as notes, textbook pages, worksheets, slides, screenshots, or whiteboard writing.
2. A mixed image, with both visible objects and some text.
3. A non-text visual image, such as a person, object, scene, diagram, room, animal, product, artwork, or photo.
4. An unclear or low-quality image.

Your first job is to silently classify the image.

VERY IMPORTANT:
Do not respond with "there is no text on the image" as the main answer.
Do not fail just because there is no readable text.
If the image has no readable text, summarize what is visually present instead.
If the image is not study material, still give a useful spoken summary of what the image appears to show.
Do not invent details that are not visible.
If something is unclear, say it is unclear naturally.

Return ONLY valid JSON in this exact format:
{
  "imageMode": "text_image" | "mixed_image" | "visual_image" | "unclear_image",
  "script": "A clear, natural spoken summary optimized for text-to-speech. No markdown. No bullets. No headings."
}

For text_image:
Summarize the visible written content.

For mixed_image:
Summarize both the visible text and the important visual context.

For visual_image:
Describe and summarize the visible subject, scene, objects, and any meaningful context. Do not say the image has no text as the main response.

For unclear_image:
Say what can be confidently seen and mention that some details are unclear.

Keep the script under 3 minutes of speaking time.
`;

      const chatCompletion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: imageAnalysisPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this uploaded image. If it contains readable text, summarize it. If it does not contain readable text, summarize the visible image instead.",
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

      return NextResponse.json({
        imageMode: parsedImageResult.imageMode || "unclear_image",
        script:
          parsedImageResult.script ||
          "I can see the uploaded image, but I could not confidently generate a summary from it.",
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
        requiresConfirmation: isLongDocument,
        wordCount,
        limit: LONG_DOCUMENT_WORD_LIMIT,
        fileType: "document",
      });
    }

    if (isLongDocument && !skipLongDocumentCheck) {
      return NextResponse.json({
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