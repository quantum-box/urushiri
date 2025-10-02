import { createClient } from "@/lib/supabase/server"
import { EventsPageClient } from "@/components/events-page-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { Event } from "@/app/page"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminEventsPage() {
  const supabase = await createClient()

  const { data: eventRows, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .order("date", { ascending: false })
    .order("time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
  }

  const events: Event[] = ((eventRows ?? []) as EventRow[]).map(mapEventRowToEvent)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">イベント管理</h1>
          <p className="text-sm text-muted-foreground">イベントの一覧確認と削除ができます。新規作成は下のボタンから。</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/admin/events/new">新しいイベントを作成</Link>
        </Button>
      </div>

      <EventsPageClient initialEvents={events} canManageEvents showAdminHint={false} enableAiImageTools={false} />
    </div>
  )
}
