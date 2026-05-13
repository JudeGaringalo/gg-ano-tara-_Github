export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';
import * as mammoth from 'mammoth';
import * as xlsx from 'xlsx';
import { CanvasFactory } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { filePath, fileType } = await req.json();

    if (!filePath || !fileType) {
      return NextResponse.json(
        { error: 'Missing file path or type' },
        { status: 400 }
      );
    }

    console.log("Downloading file...");

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("SUPABASE DOWNLOAD ERROR:", downloadError);
      console.error("Requested filePath:", filePath);

      return NextResponse.json(
        {
          error: downloadError?.message || "Failed to download file from Supabase",
          filePath,
        },
        { status: 500 }
      );
    }

    console.log("Extracting text...");

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let extractedText = '';

    const format = fileType.toLowerCase();

    if (format.includes('pdf')) {
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

    } else if (format === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;

    } else if (format === 'xlsx' || format === 'xls') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      extractedText = xlsx.utils.sheet_to_csv(
        workbook.Sheets[workbook.SheetNames[0]]
      );

    } else if (format === 'txt') {
      extractedText = buffer.toString('utf-8');

    } else {
      return NextResponse.json(
        { error: `Unsupported file format: ${format}` },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable text found in this document." },
        { status: 400 }
      );
    }

    const truncatedText = extractedText.substring(0, 15000);

    console.log("Sending to GROQ...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI study assistant. The user has provided raw text extracted from a study document. Create a clear, engaging, conversational summary of the core concepts that is optimized to be read aloud by a Text-to-Speech engine. Keep it under 3 minutes of speaking time. Do not use markdown formatting like ** or #, as this will be read aloud."
        },
        {
          role: "user",
          content: `Here is the document text:\n\n${truncatedText}`
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
    });

    return NextResponse.json({
      script: chatCompletion.choices[0]?.message?.content || "No summary generated."
    });

  } catch (error: any) {
    console.error("FULL ERROR:", error);
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR STACK:", error?.stack);

    return NextResponse.json(
      {
        error: error?.message || "Unknown server error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}