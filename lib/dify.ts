import "server-only"
import { Buffer } from "node:buffer"

export type DifyFilePayload =
  | {
      type: string
      transfer_method: "remote_url"
      url: string
    }
  | {
      type: string
      transfer_method: "local_file"
      upload_file_id: string
    }

export interface SendDifyChatMessageParams {
  query: string
  inputs?: Record<string, unknown>
  conversationId?: string
  user?: string
  files?: DifyFilePayload[]
  responseMode?: "blocking" | "streaming"
  timeoutMs?: number
}

export interface DifyChatMessageResponse {
  [key: string]: unknown
}

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL ?? "https://api.dify.ai"
const DIFY_API_KEY = process.env.DIFY_API_KEY

const DIFY_CHAT_MESSAGES_ENDPOINT = "/v1/chat-messages"
const DIFY_FILES_UPLOAD_ENDPOINT = "/v1/files/upload"

interface DifyFileUploadResponse {
  id?: string
  [key: string]: unknown
}

export interface UploadDifyBase64FileParams {
  base64: string
  fileName: string
  mimeType: string
}

export async function sendDifyChatMessage(
  params: SendDifyChatMessageParams,
): Promise<DifyChatMessageResponse> {
  const { query, inputs, conversationId, user, files, responseMode, timeoutMs } = params

  if (!query?.trim()) {
    throw new Error("query is required to send a Dify chat message")
  }

  if (!DIFY_API_KEY) {
    throw new Error("DIFY_API_KEY is not set. Please add it to your environment configuration.")
  }

  const bodyPayload: Record<string, unknown> = {
    inputs: inputs ?? {},
    query,
    response_mode: responseMode ?? "blocking",
    user: user ?? "server",
    files: files ?? [],
  }

  if (conversationId && conversationId.trim()) {
    bodyPayload.conversation_id = conversationId
  }

  const controller = new AbortController()
  const timeoutDuration = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 60_000
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutDuration)

  const response = await fetch(`${DIFY_API_BASE_URL}${DIFY_CHAT_MESSAGES_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
    body: JSON.stringify(bodyPayload),
    // Explicitly opt out of caching to prevent stale AI responses
    cache: "no-store",
    signal: controller.signal,
  })
  clearTimeout(timeout)

  if (!response.ok) {
    const errorBody = await safeReadResponseBody(response)
    throw new Error(
      `Failed to call Dify chat messages API: ${response.status} ${response.statusText}` +
        (errorBody ? ` - ${errorBody}` : ""),
    )
  }

  return (await response.json()) as DifyChatMessageResponse
}

export async function uploadBase64FileToDify(params: UploadDifyBase64FileParams): Promise<string> {
  const { base64, fileName, mimeType } = params

  if (!base64?.trim()) {
    throw new Error("base64 data is required to upload a file to Dify")
  }

  if (!DIFY_API_KEY) {
    throw new Error("DIFY_API_KEY is not set. Please add it to your environment configuration.")
  }

  const buffer = Buffer.from(base64, "base64")
  const formData = new FormData()
  formData.append("file", new Blob([buffer], { type: mimeType || "application/octet-stream" }), fileName)

  const response = await fetch(`${DIFY_API_BASE_URL}${DIFY_FILES_UPLOAD_ENDPOINT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
    body: formData,
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await safeReadResponseBody(response)
    throw new Error(
      `Failed to upload file to Dify: ${response.status} ${response.statusText}` + (errorBody ? ` - ${errorBody}` : ""),
    )
  }

  const json = (await response.json()) as DifyFileUploadResponse
  if (!json.id) {
    throw new Error("Dify file upload response did not contain an id")
  }

  return json.id
}

async function safeReadResponseBody(response: Response): Promise<string | null> {
  try {
    const text = await response.text()
    return text.length ? text : null
  } catch (readError) {
    console.error("Failed to read Dify error response body", readError)
    return null
  }
}
