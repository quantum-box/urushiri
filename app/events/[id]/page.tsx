import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventDetailClient } from "@/components/event-detail-client"
import type { Event } from "@/app/page"

const mockEvents: Event[] = [
  {
    id: "1",
    title: "カフェでゆるっと再会",
    description:
      "以前お会いした方々とカフェでゆるくお話ししませんか？お互いの近況を聞いたり、新しい発見があるかもしれません。コーヒーを飲みながら、リラックスした雰囲気で過ごしましょう。",
    date: "2025-03-15",
    time: "14:00",
    location: "表参道のおしゃれカフェ",
    category: "カフェ会",
    maxAttendees: 8,
    currentAttendees: 5,
    isPublic: true,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "お散歩しながらおしゃべり",
    description:
      "公園をゆっくり歩きながら、以前お会いした方とのんびりお話ししませんか？自然の中でリフレッシュしながら、お互いのことをもっと知る機会になればと思います。",
    date: "2025-02-28",
    time: "10:00",
    location: "代々木公園",
    category: "お散歩",
    maxAttendees: 6,
    currentAttendees: 3,
    isPublic: true,
    createdAt: "2025-01-10T14:30:00Z",
  },
]

interface EventDetailPageProps {
  params: { id: string }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/signin")
  }

  const event = mockEvents.find((e) => e.id === params.id) || null

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventDetailClient event={event} eventId={params.id} />
    </div>
  )
}
