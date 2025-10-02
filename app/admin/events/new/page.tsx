import type { Metadata } from "next"
import { EventCreateClient } from "@/components/admin/event-create-client"

const enableAiImageTools = Boolean(process.env.DIFY_API_KEY)

export const metadata: Metadata = {
  title: "イベント作成 | 管理コンソール",
}

export default function AdminEventCreatePage() {
  return <EventCreateClient enableAiImageTools={enableAiImageTools} />
}
