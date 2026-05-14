export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
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

    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing file ID." },
        { status: 400 }
      );
    }

    const { data: fileRecord, error: fileRecordError } = await supabaseAdmin
      .from("files")
      .select("id, user_id, file_path")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fileRecordError) {
      return NextResponse.json(
        { error: fileRecordError.message },
        { status: 500 }
      );
    }

    if (!fileRecord) {
      return NextResponse.json(
        { error: "File not found or you do not have permission to delete it." },
        { status: 404 }
      );
    }

    if (fileRecord.file_path) {
      const { error: storageDeleteError } = await supabaseAdmin.storage
        .from("documents")
        .remove([fileRecord.file_path]);

      if (storageDeleteError) {
        return NextResponse.json(
          { error: storageDeleteError.message },
          { status: 500 }
        );
      }
    }

    const { error: dbDeleteError } = await supabaseAdmin
      .from("files")
      .delete()
      .eq("id", fileRecord.id)
      .eq("user_id", user.id);

    if (dbDeleteError) {
      return NextResponse.json(
        { error: dbDeleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deleted: true,
      fileId: fileRecord.id,
    });
  } catch (error: any) {
    console.error("DELETE FILE ERROR:", error);

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