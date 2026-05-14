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

function normalizeFileType(fileType: string) {
  return fileType.toLowerCase().replace(".", "").trim();
}

function isImageFormat(format: string) {
  return IMAGE_FORMATS.includes(format) || format.startsWith("image/");
}

function isDocumentFormat(format: string) {
  return DOCUMENT_FORMATS.includes(format) || format.includes("pdf");
}

export async function POST(req: Request) {
  try {
    const { filePath, fileType } = await req.json();

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

      console.log("Sending image to GROQ Vision...");

      const chatCompletion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are an AI study assistant. The user uploaded or captured an image that may contain notes, textbook pages, slides, whiteboard content, diagrams, worksheets, or screenshots. Read the visible content carefully and create a clear, engaging, conversational summary optimized to be read aloud by a Text-to-Speech engine. Keep it under 3 minutes of speaking time. Do not use markdown formatting like **, #, bullet symbols, or tables because this will be read aloud. If the image is unclear, say what you can confidently read and mention that some parts may be unclear.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please read this image and summarize the key study points in a natural spoken style.",
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

      return NextResponse.json({
        script:
          chatCompletion.choices[0]?.message?.content ||
          "No image summary generated.",
      });
    }

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

    const truncatedText = extractedText.substring(0, 15000);

    console.log("Sending document text to GROQ...");

    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are an AI study assistant. The user has provided raw text extracted from a study document. Create a clear, engaging, conversational summary of the core concepts that is optimized to be read aloud by a Text-to-Speech engine. Keep it under 3 minutes of speaking time. Do not use markdown formatting like ** or #, as this will be read aloud.",
        },
        {
          role: "user",
          content: `Here is the document text:\n\n${truncatedText}`,
        },
      ],
    });

    return NextResponse.json({
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