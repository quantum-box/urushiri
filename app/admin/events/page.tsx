import { createClient } from "@/lib/supabase/server"
import { EventsPageClient } from "@/components/events-page-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { Event } from "@/app/page"

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

  return <EventsPageClient initialEvents={events} canManageEvents showAdminHint={false} />
}
