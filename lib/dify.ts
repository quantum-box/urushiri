import "server-only"

export interface DifyFilePayload {
  type: string
  transfer_method: string
  [key: string]: unknown
}

export interface SendDifyChatMessageParams {
  query: string
  inputs?: Record<string, unknown>
  conversationId?: string
  user?: string
  files?: DifyFilePayload[]
  responseMode?: "blocking" | "streaming"
}

export interface DifyChatMessageResponse {
  [key: string]: unknown
}

const DIFY_API_BASE_URL = process.env.DIFY_API_BASE_URL ?? "https://api.dify.ai"
const DIFY_API_KEY = process.env.DIFY_API_KEY

const DIFY_CHAT_MESSAGES_ENDPOINT = "/v1/chat-messages"

export async function sendDifyChatMessage(
  params: SendDifyChatMessageParams,
): Promise<DifyChatMessageResponse> {
  const { query, inputs, conversationId, user, files, responseMode } = params

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

  const response = await fetch(`${DIFY_API_BASE_URL}${DIFY_CHAT_MESSAGES_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
    body: JSON.stringify(bodyPayload),
    // Explicitly opt out of caching to prevent stale AI responses
    cache: "no-store",
  })

  if (!response.ok) {
    const errorBody = await safeReadResponseBody(response)
    throw new Error(
      `Failed to call Dify chat messages API: ${response.status} ${response.statusText}` +
        (errorBody ? ` - ${errorBody}` : ""),
    )
  }

  return (await response.json()) as DifyChatMessageResponse
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
