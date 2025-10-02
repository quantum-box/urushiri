import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventsPageClient } from "@/components/events-page-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  maxAttendees: number
  currentAttendees: number
  isPublic: boolean
  createdAt: string
  imageUrl?: string
}

export default async function EventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error(authError)
  }

  const { data: eventRows, error: eventsError } = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .order("date", { ascending: false })
    .order("time", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (eventsError) {
    console.error(eventsError)
  }

  const events: Event[] = ((eventRows ?? []) as EventRow[]).map(mapEventRowToEvent)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventsPageClient initialEvents={events} canManageEvents={false} showAdminHint={false} />
    </div>
  )
}
