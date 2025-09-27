import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventsPageClient } from "@/components/events-page-client"

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

  const initialEvents: Event[] = [
    {
      id: "1",
      title: "カフェでゆるっと再会",
      description: "以前お会いした方々と、リラックスした雰囲気でお話ししませんか？",
      date: "2025-03-15",
      time: "14:00",
      location: "渋谷のおしゃれカフェ",
      category: "カジュアル",
      maxAttendees: 8,
      currentAttendees: 5,
      isPublic: true,
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "お散歩しながらおしゃべり",
      description: "公園を歩きながら、ゆるく近況報告をしあいましょう",
      date: "2025-02-28",
      time: "10:00",
      location: "代々木公園",
      category: "アウトドア",
      maxAttendees: 6,
      currentAttendees: 3,
      isPublic: true,
      createdAt: "2025-01-10T14:30:00Z",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Header />
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-100/30 to-transparent pointer-events-none" />
        <EventsPageClient initialEvents={initialEvents} />
      </div>
    </div>
  )
}
