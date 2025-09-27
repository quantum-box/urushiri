import { NextResponse } from "next/server"
import { sendDifyChatMessage, type DifyFilePayload } from "@/lib/dify"

interface ChatRequestBody {
  query?: unknown
  inputs?: unknown
  conversationId?: unknown
  user?: unknown
  files?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const normalizeFiles = (files: unknown): DifyFilePayload[] | undefined => {
  if (!Array.isArray(files)) {
    return undefined
  }

  return files.reduce<DifyFilePayload[]>((acc, file) => {
    if (!isRecord(file)) {
      return acc
    }

    const type = typeof file.type === "string" ? file.type : undefined
    const transferMethod = typeof file.transfer_method === "string" ? file.transfer_method : undefined

    if (!type || !transferMethod) {
      return acc
    }

    acc.push({
      ...file,
      type,
      transfer_method: transferMethod,
    } as DifyFilePayload)

    return acc
  }, [])
}

export async function POST(request: Request) {
  let body: ChatRequestBody

  try {
    body = (await request.json()) as ChatRequestBody
  } catch (parseError) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (typeof body.query !== "string" || !body.query.trim()) {
    return NextResponse.json({ error: "'query' must be a non-empty string" }, { status: 400 })
  }

  try {
    const difyResponse = await sendDifyChatMessage({
      query: body.query,
      inputs: isRecord(body.inputs) ? body.inputs : undefined,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
      user: typeof body.user === "string" ? body.user : undefined,
      files: normalizeFiles(body.files),
      responseMode: "blocking",
    })

    return NextResponse.json(difyResponse)
  } catch (error) {
    console.error("Failed to complete Dify chat request", error)
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
