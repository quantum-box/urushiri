import { NextResponse } from "next/server"
import { Buffer } from "node:buffer"
import { uploadBase64FileToDify } from "@/lib/dify"

const inferDifyFileType = (mimeType: string | null | undefined): string => {
  if (!mimeType) {
    return "document"
  }

  if (mimeType.startsWith("image/")) {
    return "image"
  }

  if (mimeType === "application/pdf") {
    return "document"
  }

  return "document"
}

export async function POST(request: Request) {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch (error) {
    console.error("Failed to parse Dify file upload request", error)
    return NextResponse.json({ error: "Failed to read upload payload" }, { status: 400 })
  }

  const fileEntry = formData.get("file")

  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 })
  }

  try {
    const arrayBuffer = await fileEntry.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = fileEntry.type || "application/octet-stream"
    const fileName = fileEntry.name || "upload.bin"

    const uploadFileId = await uploadBase64FileToDify({
      base64,
      fileName,
      mimeType,
    })

    return NextResponse.json({
      file: {
        type: inferDifyFileType(mimeType),
        transfer_method: "local_file",
        upload_file_id: uploadFileId,
      },
    })
  } catch (error) {
    console.error("Failed to upload file to Dify", error)
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
