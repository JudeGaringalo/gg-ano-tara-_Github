// services/insertFile.ts

import { createClient  } from "@/app/lib/supabase/client"

export async function insertFile(
  files: FileList | File[]
) {
  const supabase = createClient()
  
  try {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: "No files selected"
      }
    }

    const uploadedFiles = []

    for (const file of files) {
      // Basic validation
      if (!(file instanceof File)) {
        continue
      }

      // Optional: limit file size (10MB)
      const maxSize = 10 * 1024 * 1024

      if (file.size > maxSize) {
        return {
          success: false,
          message: `${file.name} exceeds 10MB limit`
        }
      }

      // Unique file path
      const filePath = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          upsert: false
        })

      if (error) {
        return {
          success: false,
          message: error.message
        }
      }

      uploadedFiles.push(data)
    }

    return {
      success: true,
      data: uploadedFiles
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong"
    }
  }
}