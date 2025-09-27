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
      title: "テックカンファレンス 2025",
      description: "最新のテクノロジートレンドについて学ぶカンファレンス",
      date: "2025-03-15",
      time: "10:00",
      location: "東京国際フォーラム",
      category: "テクノロジー",
      maxAttendees: 500,
      currentAttendees: 234,
      isPublic: true,
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "2",
      title: "デザインワークショップ",
      description: "UI/UXデザインの基礎を学ぶハンズオンワークショップ",
      date: "2025-02-28",
      time: "14:00",
      location: "渋谷クリエイティブセンター",
      category: "デザイン",
      maxAttendees: 30,
      currentAttendees: 18,
      isPublic: true,
      createdAt: "2025-01-10T14:30:00Z",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventsPageClient initialEvents={initialEvents} />
    </div>
  )
}
