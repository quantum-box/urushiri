import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { AGE_GROUP_LABELS, DISCOVERY_LABELS, OCCUPATION_LABELS } from "@/lib/participant-labels"
import type { AgeGroup, DiscoverySource, OccupationCategory } from "@/types/participant"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"

interface EventRecord {
  id: string
  title: string
  date: string | null
}

interface RegistrationRow {
  id: string
  event_id: string
  name: string | null
  age_group: AgeGroup | null
  occupation: OccupationCategory | null
  discovery: DiscoverySource | null
  other: string | null
  created_at: string | null
}

interface ParticipantView {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string | null
  name: string | null
  ageGroup: AgeGroup | null
  occupation: OccupationCategory | null
  discovery: DiscoverySource | null
  other: string | null
  createdAt: string | null
}

interface EventSummary {
  eventId: string
  eventTitle: string
  eventDate: string | null
  total: number
  ageCounts: Partial<Record<AgeGroup, number>>
  occupationCounts: Partial<Record<OccupationCategory, number>>
  discoveryCounts: Partial<Record<DiscoverySource, number>>
  lastRegisteredAt: string | null
}

function formatDate(value: string | null) {
  if (!value) {
    return "未設定"
  }

  try {
    return format(parseISO(value), "yyyy年M月d日", { locale: ja })
  } catch (error) {
    console.error("Failed to format date", error)
    return value
  }
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "-"
  }

  try {
    return format(parseISO(value), "yyyy/MM/dd HH:mm")
  } catch (error) {
    console.error("Failed to format timestamp", error)
    return value
  }
}

function formatDistribution<T extends string>(
  counts: Partial<Record<T, number>>,
  labels: Record<T, string>,
  limit = 3,
) {
  const entries = Object.entries(counts as Record<T, number>)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)

  if (!entries.length) {
    return "未回答"
  }

  return entries.map(([key, count]) => `${labels[key as T]} ${count}人`).join(" / ")
}

export default async function AdminParticipantsPage() {
  const supabase = await createClient()

  const [{ data: eventsData, error: eventsError }, { data: registrationsData, error: registrationsError }] = await Promise.all([
    supabase.from("events").select("id, title, date").order("date", { ascending: false }),
    supabase
      .from("event_registrations")
      .select("id, event_id, name, age_group, occupation, discovery, other, created_at")
      .order("created_at", { ascending: false }),
  ])

  if (eventsError) {
    console.error(eventsError)
  }

  if (registrationsError) {
    console.error(registrationsError)
  }

  const eventMap = new Map<string, EventRecord>()
  for (const event of (eventsData ?? []) as EventRecord[]) {
    eventMap.set(event.id, event)
  }

  const participants: ParticipantView[] = ((registrationsData ?? []) as RegistrationRow[]).map((registration) => {
    const event = eventMap.get(registration.event_id)
    return {
      id: registration.id,
      eventId: registration.event_id,
      eventTitle: event?.title ?? "不明なイベント",
      eventDate: event?.date ?? null,
      name: registration.name,
      ageGroup: registration.age_group,
      occupation: registration.occupation,
      discovery: registration.discovery,
      other: registration.other,
      createdAt: registration.created_at,
    }
  })

  const summaryMap = new Map<string, EventSummary>()

  for (const participant of participants) {
    const summary = summaryMap.get(participant.eventId) ?? {
      eventId: participant.eventId,
      eventTitle: participant.eventTitle,
      eventDate: participant.eventDate,
      total: 0,
      ageCounts: {},
      occupationCounts: {},
      discoveryCounts: {},
      lastRegisteredAt: null,
    }

    summary.total += 1

    if (participant.ageGroup) {
      summary.ageCounts[participant.ageGroup] = (summary.ageCounts[participant.ageGroup] ?? 0) + 1
    }

    if (participant.occupation) {
      summary.occupationCounts[participant.occupation] =
        (summary.occupationCounts[participant.occupation] ?? 0) + 1
    }

    if (participant.discovery) {
      summary.discoveryCounts[participant.discovery] =
        (summary.discoveryCounts[participant.discovery] ?? 0) + 1
    }

    if (
      participant.createdAt &&
      (!summary.lastRegisteredAt || participant.createdAt > summary.lastRegisteredAt)
    ) {
      summary.lastRegisteredAt = participant.createdAt
    }

    summaryMap.set(participant.eventId, summary)
  }

  const summaryRows = Array.from(summaryMap.values()).sort((a, b) => {
    if (a.eventDate && b.eventDate) {
      return a.eventDate > b.eventDate ? -1 : 1
    }
    return b.total - a.total
  })

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">イベント別サマリー</h2>
          <p className="text-sm text-muted-foreground">
            イベントごとの参加者構成や申込状況を把握できます。
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-white/95">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">イベント</th>
                <th className="px-4 py-3 font-medium">開催日</th>
                <th className="px-4 py-3 font-medium">申込数</th>
                <th className="px-4 py-3 font-medium">年代構成</th>
                <th className="px-4 py-3 font-medium">職種構成</th>
                <th className="px-4 py-3 font-medium">認知経路トップ</th>
                <th className="px-4 py-3 font-medium">最終更新</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    まだ参加申し込みはありません。
                  </td>
                </tr>
              ) : (
                summaryRows.map((row) => (
                  <tr key={row.eventId} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">{row.eventTitle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(row.eventDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.total}人</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistribution(row.ageCounts, AGE_GROUP_LABELS)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistribution(row.occupationCounts, OCCUPATION_LABELS)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDistribution(row.discoveryCounts, DISCOVERY_LABELS, 2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTimestamp(row.lastRegisteredAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">参加者一覧</h2>
          <p className="text-sm text-muted-foreground">
            個別の参加者情報を確認し、コミュニケーションやフォローに活用できます。
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-white/95">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">イベント</th>
                <th className="px-4 py-3 font-medium">お名前</th>
                <th className="px-4 py-3 font-medium">属性</th>
                <th className="px-4 py-3 font-medium">認知経路</th>
                <th className="px-4 py-3 font-medium">メモ</th>
                <th className="px-4 py-3 font-medium">申込日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    参加者データがまだありません。
                  </td>
                </tr>
              ) : (
                participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 text-foreground">
                      <div className="font-medium">{participant.eventTitle}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(participant.eventDate)}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{participant.name ?? "匿名"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {participant.ageGroup ? AGE_GROUP_LABELS[participant.ageGroup] : "年代 未回答"}
                        </Badge>
                        <Badge variant="subtle">
                          {participant.occupation ? OCCUPATION_LABELS[participant.occupation] : "職種 未回答"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {participant.discovery ? DISCOVERY_LABELS[participant.discovery] : "未回答"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {participant.other ? participant.other : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTimestamp(participant.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
