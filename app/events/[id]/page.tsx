import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventDetailClient } from "@/components/event-detail-client"
import type { AgeGroup, DiscoverySource, EventParticipant, OccupationCategory } from "@/types/participant"
import type { Event } from "@/app/page"

// モックデータ（実際のアプリでは、APIやデータベースから取得）
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "テックカンファレンス 2025",
    description:
      "最新のテクノロジートレンドについて学ぶカンファレンス。AI、機械学習、Web開発の最新動向について業界のエキスパートが講演します。ネットワーキングの機会もあり、同じ志を持つ開発者との交流も期待できます。",
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
    description:
      "UI/UXデザインの基礎を学ぶハンズオンワークショップ。Figmaを使った実践的なデザイン制作を通じて、ユーザー中心のデザイン思考を身につけます。",
    date: "2025-02-28",
    time: "14:00",
    location: "渋谷クリエイティブセンター",
    category: "デザイン",
    maxAttendees: 30,
    currentAttendees: 18,
    isPublic: true,
    createdAt: "2025-01-10T14:30:00Z",
  },
  {
    id: "3",
    title: "ハッカソン",
    description:
      "UI/UXデザインの基礎を学ぶハンズオンワークショップ。Figmaを使った実践的なデザイン制作を通じて、ユーザー中心のデザイン思考を身につけます。",
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

interface MockUser {
  id: string
  email: string
  ageGroup: AgeGroup
  occupation: OccupationCategory
  discovery: DiscoverySource
}

interface MockEventAttendance {
  userId: string
  eventId: string
}

const mockUsers: MockUser[] = [
  {
    id: "p-1",
    email: "hanako.takahashi@example.com",
    ageGroup: "twenties",
    occupation: "designer",
    discovery: "sns",
  },
  {
    id: "p-2",
    email: "makoto.sato@example.com",
    ageGroup: "thirties",
    occupation: "engineer",
    discovery: "friend",
  },
  {
    id: "p-3",
    email: "misaki.nakamura@example.com",
    ageGroup: "forties",
    occupation: "manager",
    discovery: "media",
  },
  {
    id: "p-4",
    email: "ichiro.yamamoto@example.com",
    ageGroup: "thirties",
    occupation: "planner",
    discovery: "search",
  },
  {
    id: "p-5",
    email: "hong.lee@example.com",
    ageGroup: "twenties",
    occupation: "student",
    discovery: "eventSite",
  },
  {
    id: "p-6",
    email: "sho.tanaka@example.com",
    ageGroup: "fifties",
    occupation: "manager",
    discovery: "media",
  },
]

const mockEventAttendances: MockEventAttendance[] = [
  { userId: "p-1", eventId: "1" },
  { userId: "p-1", eventId: "3" },
  { userId: "p-2", eventId: "1" },
  { userId: "p-2", eventId: "2" },
  { userId: "p-3", eventId: "1" },
  { userId: "p-4", eventId: "2" },
  { userId: "p-4", eventId: "3" },
  { userId: "p-5", eventId: "2" },
  { userId: "p-6", eventId: "3" },
  { userId: "p-6", eventId: "2" },
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

  const supabaseEmail = data.user.email ?? null
  const currentUser = supabaseEmail ? mockUsers.find((user) => user.email === supabaseEmail) : null

  const currentUserEventIds = currentUser
    ? mockEventAttendances.filter((attendance) => attendance.userId === currentUser.id).map((attendance) => attendance.eventId)
    : []
  const currentUserEventIdSet = new Set(currentUserEventIds)
  const hasAppliedToEvent = currentUser ? currentUserEventIdSet.has(params.id) : true

  const eventParticipantUsers = new Map<string, MockUser>()

  mockEventAttendances
    .filter((attendance) => attendance.eventId === params.id)
    .forEach((attendance) => {
      const user = mockUsers.find((item) => item.id === attendance.userId)
      if (user) {
        eventParticipantUsers.set(user.id, user)
      }
    })

  const participants: EventParticipant[] = Array.from(eventParticipantUsers.values())
    .filter((user) => !currentUser || user.id !== currentUser.id)
    .map((user) => {
      const userEventIds = mockEventAttendances
        .filter((attendance) => attendance.userId === user.id)
        .map((attendance) => attendance.eventId)

      const sharedEventIds = currentUser
        ? Array.from(new Set(userEventIds.filter((eventId) => currentUserEventIdSet.has(eventId))))
        : userEventIds.includes(params.id)
          ? [params.id]
          : []

      if (!sharedEventIds.length) {
        return null
      }

      const sharedEventTitles = sharedEventIds
        .map((eventId) => mockEvents.find((mockEvent) => mockEvent.id === eventId))
        .filter((sharedEvent): sharedEvent is Event => Boolean(sharedEvent))
        .map((sharedEvent) => sharedEvent.title)

      return {
        id: user.id,
        ageGroup: user.ageGroup,
        occupation: user.occupation,
        discovery: user.discovery,
        sharedEventTitles,
      }
    })
    .filter((participant): participant is EventParticipant => participant !== null)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventDetailClient
        event={event}
        eventId={params.id}
        participants={participants}
        hasAppliedToEvent={hasAppliedToEvent}
      />
    </div>
  )
}
