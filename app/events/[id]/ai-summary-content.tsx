import { AiSummaryCard } from "@/components/ai-summary-card"
import { sendDifyChatMessage, type DifyChatMessageResponse } from "@/lib/dify"
import type { Event } from "@/app/page"
import type { AgeGroup, OccupationCategory } from "@/types/participant"

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  teens: "10代以下",
  twenties: "20代",
  thirties: "30代",
  forties: "40代",
  fifties: "50代",
  sixtiesPlus: "60代以上",
}

const OCCUPATION_LABELS: Record<OccupationCategory, string> = {
  student: "学生",
  engineer: "エンジニア",
  designer: "デザイナー",
  planner: "企画・マーケティング",
  manager: "マネジメント",
  other: "その他",
}

const AGE_GROUP_ORDER: AgeGroup[] = ["teens", "twenties", "thirties", "forties", "fifties", "sixtiesPlus"]
const OCCUPATION_ORDER: OccupationCategory[] = [
  "student",
  "engineer",
  "designer",
  "planner",
  "manager",
  "other",
]

interface AiSummaryContentProps {
  event: Event
  registrations: EventRegistrationInsight[]
}

export interface EventRegistrationInsight {
  age_group: AgeGroup | null
  occupation: OccupationCategory | null
  other: string | null
}

export async function AiSummaryContent({ event, registrations }: AiSummaryContentProps) {
  const summary = await generateEventInsight(event, registrations)

  if (!summary) {
    return null
  }

  return <AiSummaryCard summary={summary} />
}

async function generateEventInsight(
  event: Event,
  registrations: EventRegistrationInsight[],
): Promise<string | null> {
  const ageCounts = new Map<AgeGroup, number>()
  const occupationCounts = new Map<OccupationCategory, number>()

  for (const registration of registrations) {
    if (registration.age_group) {
      const key = registration.age_group
      ageCounts.set(key, (ageCounts.get(key) ?? 0) + 1)
    }

    if (registration.occupation) {
      const key = registration.occupation
      occupationCounts.set(key, (occupationCounts.get(key) ?? 0) + 1)
    }
  }

  const ageSummary = formatDistribution(ageCounts, AGE_GROUP_ORDER, AGE_GROUP_LABELS)
  const occupationSummary = formatDistribution(occupationCounts, OCCUPATION_ORDER, OCCUPATION_LABELS)

  const promptLines = [
    `イベントタイトル: ${event.title}`,
    `カテゴリ: ${event.category}`,
    event.description ? `イベント説明: ${event.description.slice(0, 500)}` : null,
    ageSummary ? `参加者の年代構成: ${ageSummary}` : null,
    occupationSummary ? `参加者の職種構成: ${occupationSummary}` : null,
    `上記の情報をもとに、このイベントがどんな体験になるかを日本語で60字以内で端的に説明してください。`,
    `「コミュニケーション多め」や「手を動かす」など、イベントの雰囲気を示す短い表現を必ず含めてください。`,
    `箇条書きは使わず、文末はフラットな言い切りにしてください。`,
  ].filter((line): line is string => Boolean(line))

  if (!promptLines.length) {
    return null
  }

  try {
    const difyResponse = await sendDifyChatMessage({
      query: promptLines.join("\n"),
      responseMode: "blocking",
      user: `event-ai-summary-${event.id}`,
    })

    const answer = extractDifyAnswer(difyResponse)

    if (answer) {
      return answer
    }

    console.warn("Dify response did not contain an answer field", difyResponse)
  } catch (aiError) {
    console.error("Failed to generate AI event insight", aiError)
  }

  return null
}

function formatDistribution<K extends string>(
  counts: Map<K, number>,
  order: readonly K[],
  labels: Record<K, string>,
): string | null {
  const parts = order
    .map((key) => {
      const count = counts.get(key)
      if (!count) {
        return null
      }
      return `${labels[key]}: ${count}人`
    })
    .filter((part): part is string => Boolean(part))

  return parts.length ? parts.join("、") : null
}

function extractDifyAnswer(response: DifyChatMessageResponse): string | null {
  const candidateKeys = ["answer", "output_text", "message", "result", "text"]

  for (const key of candidateKeys) {
    const value = response[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  const messages = response["messages"]

  if (Array.isArray(messages)) {
    for (const message of messages) {
      if (message && typeof message === "object" && "data" in message) {
        const data = (message as Record<string, unknown>).data
        if (data && typeof data === "object" && "content" in data) {
          const content = (data as Record<string, unknown>).content
          if (typeof content === "string" && content.trim()) {
            return content.trim()
          }
        }
      }
    }
  }

  return null
}
