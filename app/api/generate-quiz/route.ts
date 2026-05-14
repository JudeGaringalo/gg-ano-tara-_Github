export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";
import * as mammoth from "mammoth";
import * as xlsx from "xlsx";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DOCUMENT_FORMATS = ["pdf", "docx", "xlsx", "xls", "txt"];
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

// Use the text model for quiz generation.
// Keep the vision model only when a selected quiz file is an image.
const GROQ_TEXT_MODEL = "openai/gpt-oss-20b";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

type QuizSourceFile = {
  fileName?: string;
  filePath?: string;
  fileType?: string;
};

type NormalizedQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceFile?: string;
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

function sanitizeQuestionCount(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 5;

  return Math.min(Math.max(Math.round(parsed), 1), 5);
}

function extractJsonObject(rawResponse: string) {
  const cleaned = String(rawResponse || "")
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

function normalizeQuestions(rawQuestions: any[]): NormalizedQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  return rawQuestions
    .slice(0, 5)
    .map((item, index) => {
      const options = Array.isArray(item?.options)
        ? item.options
          .map((option: unknown) => String(option || "").trim())
          .slice(0, 4)
        : [];

      const correctAnswerIndex =
        typeof item?.correctAnswerIndex === "number"
          ? item.correctAnswerIndex
          : Number(item?.correctAnswerIndex);

      return {
        id: String(item?.id || `q${index + 1}`),
        question: String(item?.question || "").trim(),
        options,
        correctAnswerIndex: Number.isFinite(correctAnswerIndex)
          ? Math.min(Math.max(Math.round(correctAnswerIndex), 0), 3)
          : 0,
        explanation: String(item?.explanation || "").trim(),
        sourceFile: item?.sourceFile ? String(item.sourceFile) : undefined,
      };
    })
    .filter((question: NormalizedQuestion) => {
      return (
        question.question.length > 0 &&
        question.options.length === 4 &&
        question.options.every((option) => option.length > 0)
      );
    });
}

async function extractDocumentText(filePath: string, format: string) {
  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("documents")
    .download(filePath);

  if (downloadError || !fileData) {
    throw new Error(downloadError?.message || "Failed to download file.");
  }

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

    const sheetTexts = workbook.SheetNames.map((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = xlsx.utils.sheet_to_csv(sheet);
      return `Sheet: ${sheetName}\n${csv}`;
    });

    extractedText = sheetTexts.join("\n\n");
  } else if (format === "txt") {
    extractedText = buffer.toString("utf-8");
  }

  return extractedText.trim();
}

async function summarizeStudyImage(filePath: string, fileName: string) {
  const { data: signedUrlData, error: signedUrlError } =
    await supabaseAdmin.storage.from("documents").createSignedUrl(filePath, 600);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(
      signedUrlError?.message || "Failed to create signed URL for image."
    );
  }

  const imageCompletion = await groq.chat.completions.create({
    model: GROQ_VISION_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a study assistant with vision ability. If the uploaded image contains study material such as notes, textbook pages, slides, worksheets, diagrams, tables, formulas, or whiteboard content, extract and summarize the study content. If it is not study material, return only NOT_STUDY_MATERIAL.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this image from the file named ${fileName}. Extract study content for quiz generation.`,
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

  return imageCompletion.choices[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL." },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing authorization token." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized request." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const questionCount = sanitizeQuestionCount(body?.questionCount);
    const files: QuizSourceFile[] = Array.isArray(body?.files)
      ? body.files
      : [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files were provided." },
        { status: 400 }
      );
    }

    const sourceTexts: string[] = [];

    for (const incomingFile of files) {
      if (!incomingFile.filePath || !incomingFile.fileType) continue;

      const { data: fileRecord, error: fileRecordError } = await supabaseAdmin
        .from("files")
        .select("file_name, file_path, file_type, user_id")
        .eq("file_path", incomingFile.filePath)
        .eq("user_id", user.id)
        .maybeSingle();

      if (fileRecordError) {
        throw new Error(fileRecordError.message);
      }

      if (!fileRecord) {
        continue;
      }

      const format = normalizeFileType(
        String(fileRecord.file_type || incomingFile.fileType)
      );

      if (!isDocumentFormat(format) && !isImageFormat(format)) {
        continue;
      }

      const fileName = fileRecord.file_name || incomingFile.fileName || "File";
      let sourceText = "";

      if (isImageFormat(format)) {
        sourceText = await summarizeStudyImage(fileRecord.file_path, fileName);

        if (sourceText.includes("NOT_STUDY_MATERIAL")) {
          continue;
        }
      } else {
        sourceText = await extractDocumentText(fileRecord.file_path, format);
      }

      if (sourceText.trim()) {
        sourceTexts.push(
          `SOURCE FILE: ${fileName}\nCONTENT:\n${sourceText.slice(0, 4000)}`
        );
      }
    }

    if (sourceTexts.length === 0) {
      return NextResponse.json(
        {
          error:
            "No readable study content was found in the selected files.",
        },
        { status: 400 }
      );
    }

    const combinedStudyContent = sourceTexts.join("\n\n---\n\n").slice(0, 12000);

    const quizCompletion = await groq.chat.completions.create({
      model: GROQ_TEXT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are an expert quiz generator for a study app.

Create a quiz based ONLY on the provided study content.

Rules:
- Generate between 1 and 5 questions only.
- Use the requested question count unless the content is too limited.
- Every question must have exactly 4 answer options.
- Only one answer can be correct.
- correctAnswerIndex must be a number from 0 to 3.
- Do not invent facts outside the provided content.
- Keep wording clear and student-friendly.

Return ONLY valid JSON in this exact shape:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Short explanation based on the source content.",
      "sourceFile": "Source file name if identifiable"
    }
  ]
}
`,
        },
        {
          role: "user",
          content: `Requested number of questions: ${questionCount}\n\nStudy content:\n\n${combinedStudyContent}`,
        },
      ],
    });

    const rawResponse = quizCompletion.choices[0]?.message?.content || "";

    let parsed: any;

    try {
      parsed = JSON.parse(extractJsonObject(rawResponse));
    } catch {
      return NextResponse.json(
        {
          error:
            "The AI returned an invalid quiz format. Please try again.",
          rawPreview:
            process.env.NODE_ENV === "development"
              ? rawResponse.slice(0, 500)
              : undefined,
        },
        { status: 502 }
      );
    }

    const questions = normalizeQuestions(parsed?.questions);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "The AI did not return usable quiz questions. Try clearer study materials.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      questions,
    });
    } catch (error: any) {
    console.error("GENERATE QUIZ ERROR:", error);

    const errorMessage =
      error?.error?.message ||
      error?.message ||
      "Unknown server error.";

    const isRateLimit =
      error?.status === 429 ||
      errorMessage.toLowerCase().includes("rate limit") ||
      errorMessage.toLowerCase().includes("tokens per day");

    if (isRateLimit) {
      return NextResponse.json(
        {
          error:
            "The AI quiz generator is temporarily busy because the daily token limit was reached. Please try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: errorMessage,
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
