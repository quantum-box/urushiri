import { redirect } from "next/navigation"
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
}

export default async function EventsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/signin")
  }

  const { data: eventRows, error: eventsError } = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .order("created_at", { ascending: false })

  if (eventsError) {
    console.error(eventsError)
  }

  const events: Event[] = ((eventRows ?? []) as EventRow[]).map(mapEventRowToEvent)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventsPageClient initialEvents={events} />
    </div>
  )
}
