import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventsPageClient } from "@/components/events-page-client"
import { mockEvents } from "./events/[id]/page" 

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventsPageClient initialEvents={mockEvents} />
    </div>
  )
}
