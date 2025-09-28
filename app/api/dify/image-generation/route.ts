import { NextResponse } from "next/server"
import { Buffer } from "node:buffer"
import {
  sendDifyChatMessage,
  type DifyChatMessageResponse,
  uploadBase64FileToDify,
  type DifyFilePayload,
} from "@/lib/dify"

const MODE_KEY = "image_generation"
const CLEANUP_INSTRUCTION =
  "文字を全て消してテクスチャだけ残す。文字のバックグラウンドになっているようなところもけして幾何学模様やテーマなどのところを一様に出力。"

const DIFY_API_KEY = process.env.DIFY_API_KEY

const isString = (value: unknown): value is string => typeof value === "string"

const dataUrlPattern = /^data:(?<mime>[^;]+);base64,(?<data>.+)$/

interface ImageGenerationRequestBody {
  imageBase64?: unknown
  fileName?: unknown
  imageUrl?: unknown
}

interface NormalizedImagePayload {
  base64?: string
  mimeType: string
  fileName: string
  remoteUrl?: string
}

interface ExtractedImageResult {
  imageBase64?: string
  imageUrl?: string
}

const sanitizeDifyUrl = (url: string | null | undefined): string | null => {
  if (!isString(url)) {
    return null
  }

  try {
    let sanitized = url.trim()
    while (sanitized.endsWith(")")) {
      sanitized = sanitized.slice(0, -1)
    }
    return sanitized.length ? sanitized : null
  } catch (error) {
    console.error("Failed to sanitize Dify image URL", error)
    return url
  }
}

const extractImageResult = (response: DifyChatMessageResponse): ExtractedImageResult | null => {
  const candidates: string[] = []

  if (isString((response as Record<string, unknown>).answer)) {
    candidates.push((response as Record<string, string>).answer)
  }

  const dataField = (response as Record<string, unknown>).data
  if (dataField && typeof dataField === "object") {
    const dataRecord = dataField as Record<string, unknown>
    const directUrl = sanitizeDifyUrl(dataRecord.image_url)
    if (directUrl) {
      return { imageUrl: directUrl }
    }
    if (isString(dataRecord.image_base64)) {
      return { imageBase64: dataRecord.image_base64 }
    }
    const dataOutputs = dataRecord.outputs
    if (Array.isArray(dataOutputs)) {
      for (const output of dataOutputs) {
        if (!output || typeof output !== "object") {
          continue
        }
        const imageBase64 = (output as Record<string, unknown>).image_base64
        if (isString(imageBase64)) {
          return { imageBase64 }
        }
        const imageUrl = sanitizeDifyUrl((output as Record<string, unknown>).image_url)
        if (imageUrl) {
          return { imageUrl }
        }
        const text = (output as Record<string, unknown>).text
        if (isString(text)) {
          candidates.push(text)
        }
      }
    }
  }

  const outputs = (response as Record<string, unknown>).outputs
  if (Array.isArray(outputs)) {
    for (const output of outputs) {
      if (!output || typeof output !== "object") {
        continue
      }

      const value = (output as Record<string, unknown>).text
      if (isString(value)) {
        candidates.push(value)
      }
    }
  }

  const message = (response as Record<string, unknown>).message
  if (message && typeof message === "object") {
    const content = (message as Record<string, unknown>).content
    if (Array.isArray(content)) {
      for (const item of content) {
        if (item && typeof item === "object") {
          const type = (item as Record<string, unknown>).type
          if (type === "image") {
            const urlFromImage = sanitizeDifyUrl((item as Record<string, unknown>).image_url as string)
            if (urlFromImage) {
              return { imageUrl: urlFromImage }
            }
          }
          if (type === "image" && isString((item as Record<string, unknown>).image_base64)) {
            return { imageBase64: (item as Record<string, string>).image_base64 }
          }
          const data = (item as Record<string, unknown>).data
          if (data && typeof data === "object") {
            const dataRecord = data as Record<string, unknown>
            const embeddedUrl = sanitizeDifyUrl(dataRecord.url)
            if (embeddedUrl) {
              return { imageUrl: embeddedUrl }
            }
            const embeddedImageUrl = sanitizeDifyUrl(dataRecord.image_url)
            if (embeddedImageUrl) {
              return { imageUrl: embeddedImageUrl }
            }
            if (isString(dataRecord.image_base64)) {
              return { imageBase64: dataRecord.image_base64 }
            }
          }
          const text = (item as Record<string, unknown>).text
          if (isString(text)) {
            candidates.push(text)
          }
        }
      }
    }
  }

  for (const candidate of candidates) {
    const match = candidate.match(dataUrlPattern)
    if (match?.groups?.data) {
      return { imageBase64: match.groups.data }
    }

    const urlMatch = candidate.match(/https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+/)
    if (urlMatch?.[0]) {
      const sanitized = sanitizeDifyUrl(urlMatch[0])
      if (sanitized) {
        return { imageUrl: sanitized }
      }
    }
  }

  return null
}

const extensionToMimeType: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
}

const guessMimeTypeFromFileName = (fileName: string | null | undefined): string => {
  if (!fileName) {
    return "image/png"
  }
  const extension = fileName.split(".").pop()?.toLowerCase() ?? ""
  return extensionToMimeType[extension] ?? "image/png"
}

const extractFileNameFromUrl = (url: string | null | undefined): string => {
  if (!url) {
    return "image.png"
  }
  try {
    const { pathname } = new URL(url)
    const candidate = pathname.split("/").pop()
    if (candidate && candidate.trim()) {
      return decodeURIComponent(candidate)
    }
  } catch (error) {
    console.error("Failed to parse file name from URL", error)
  }
  return "image.png"
}

const normalizeFormDataPayload = async (formData: FormData): Promise<NormalizedImagePayload | null> => {
  const imageEntry = formData.get("image")

  if (!(imageEntry instanceof File)) {
    return null
  }

  const arrayBuffer = await imageEntry.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  const fileNameFromForm = formData.get("fileName")
  const fileName = isString(fileNameFromForm) && fileNameFromForm.trim().length > 0 ? fileNameFromForm : imageEntry.name || "image.png"

  const mimeType = imageEntry.type || guessMimeTypeFromFileName(fileName)

  return {
    base64,
    mimeType,
    fileName,
  }
}

const normalizeJsonPayload = (body: ImageGenerationRequestBody): NormalizedImagePayload | null => {
  const hasBase64 = isString(body.imageBase64) && body.imageBase64.trim().length > 0
  const sanitizedUrl = isString(body.imageUrl) ? sanitizeDifyUrl(body.imageUrl) : null

  if (!hasBase64 && !sanitizedUrl) {
    return null
  }

  const base64Match = hasBase64 ? (body.imageBase64 as string).match(dataUrlPattern) : null
  const base64 = base64Match?.groups?.data ?? (hasBase64 ? (body.imageBase64 as string) : undefined)
  const mimeTypeFromBase64 = base64Match?.groups?.mime

  const rawFileName = isString(body.fileName) && body.fileName.trim().length > 0 ? body.fileName : undefined
  const fileName = rawFileName ?? extractFileNameFromUrl(sanitizedUrl ?? undefined)
  const mimeTypeFromName = guessMimeTypeFromFileName(fileName)
  const mimeType = mimeTypeFromBase64 ?? mimeTypeFromName

  return {
    base64,
    mimeType,
    fileName,
    remoteUrl: sanitizedUrl ?? undefined,
  }
}

export async function POST(request: Request) {
  let payload: NormalizedImagePayload | null = null

  const contentType = request.headers.get("content-type") ?? ""

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      payload = await normalizeFormDataPayload(formData)
    } else {
      const body = (await request.json()) as ImageGenerationRequestBody
      payload = normalizeJsonPayload(body)
    }
  } catch (parseError) {
    console.error("Failed to parse image generation request payload", parseError)
    return NextResponse.json({ error: "画像データの読み込みに失敗しました" }, { status: 400 })
  }

  if (!payload) {
    return NextResponse.json({ error: "画像データが取得できませんでした" }, { status: 400 })
  }

  if (payload.remoteUrl && !payload.base64) {
    try {
      const response = await fetch(payload.remoteUrl)
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        payload.base64 = Buffer.from(arrayBuffer).toString("base64")
        const remoteMimeType = response.headers.get("content-type")
        if (remoteMimeType) {
          payload.mimeType = remoteMimeType
        }
        const remoteFileName = extractFileNameFromUrl(payload.remoteUrl)
        if (remoteFileName) {
          payload.fileName = remoteFileName
        }
      } else {
        console.error(
          `Failed to download source image from remote URL: ${response.status} ${response.statusText}`,
        )
      }
    } catch (downloadSourceError) {
      console.error("Failed to fetch source image from remote URL", downloadSourceError)
    }
  }

  const difyFiles: DifyFilePayload[] = []

  if (payload.remoteUrl) {
    difyFiles.push({
      type: "image",
      transfer_method: "remote_url",
      url: payload.remoteUrl,
    })
  }

  if (!payload.remoteUrl) {
    if (!payload.base64) {
      return NextResponse.json({ error: "画像データが正しく取得できませんでした" }, { status: 400 })
    }

    try {
      const uploadFileId = await uploadBase64FileToDify({
        base64: payload.base64,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
      })
      difyFiles.push({
        type: "image",
        transfer_method: "local_file",
        upload_file_id: uploadFileId,
      })
    } catch (uploadError) {
      console.error("Failed to upload source image to Dify", uploadError)
      return NextResponse.json({ error: "画像データのアップロードに失敗しました" }, { status: 500 })
    }
  }

  if (difyFiles.length === 0) {
    return NextResponse.json({ error: "画像データが設定されていません" }, { status: 400 })
  }

  const difyInputs: Record<string, unknown> = {
    mode: MODE_KEY,
    source_image_mime: payload.mimeType,
    source_file_name: payload.fileName,
  }

  if (payload.base64) {
    difyInputs.source_image_base64 = payload.base64
  }

  if (payload.remoteUrl) {
    difyInputs.source_image_url = payload.remoteUrl
  }

  try {
    const difyResponse = await sendDifyChatMessage({
      query: CLEANUP_INSTRUCTION,
      inputs: difyInputs,
      files: difyFiles,
      responseMode: "blocking",
    })

    const extracted = extractImageResult(difyResponse)

    let imageBase64 = extracted?.imageBase64 ?? null
    let imageUrl = sanitizeDifyUrl(extracted?.imageUrl) ?? null
    let resolvedMimeType = payload.mimeType

    if (!imageBase64 && imageUrl) {
      try {
        const headers: Record<string, string> = {}
        if (DIFY_API_KEY) {
          headers.Authorization = `Bearer ${DIFY_API_KEY}`
        }

        const downloadResponse = await fetch(imageUrl, {
          headers,
        })

        if (!downloadResponse.ok) {
          throw new Error(
            `Failed to download generated image: ${downloadResponse.status} ${downloadResponse.statusText}`,
          )
        }

        const arrayBuffer = await downloadResponse.arrayBuffer()
        const mimeFromHeaders = downloadResponse.headers.get("content-type")
        if (mimeFromHeaders) {
          resolvedMimeType = mimeFromHeaders
        }

        imageBase64 = Buffer.from(arrayBuffer).toString("base64")
        imageUrl = null
      } catch (downloadError) {
        console.error("Failed to fetch generated image from Dify URL", downloadError)
      }
    }

    return NextResponse.json({
      imageBase64,
      imageUrl,
      mimeType: imageBase64 ? resolvedMimeType : null,
      raw: difyResponse,
    })
  } catch (error) {
    console.error("Failed to generate image via Dify", error)
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
