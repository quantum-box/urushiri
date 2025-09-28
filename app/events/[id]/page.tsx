import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventDetailClient } from "@/components/event-detail-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { AgeGroup, DiscoverySource, OccupationCategory } from "@/types/participant"
import type { Event } from "@/app/page"
import { AiSummaryContent, type EventRegistrationInsight } from "./ai-summary-content"
import { AiSummarySkeleton } from "@/components/ai-summary-skeleton"

interface EventDetailPageProps {
  params: { id: string }
}

type EventRegistrationDetailRow = {
  id: string
  user_id: string
  age_group: AgeGroup | null
  occupation: OccupationCategory | null
  discovery: DiscoverySource | null
  other: string | null
}

type EventRegistrationRow = {
  event_id: string
  user_id: string
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error(authError)
  }

  const eventQuery = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .eq("id", params.id)
    .maybeSingle()

  if (eventQuery.error) {
    console.error(eventQuery.error)
  }

  const eventRow = (eventQuery.data as EventRow | null) ?? null

  if (!eventRow) {
    notFound()
  }

  const event: Event = mapEventRowToEvent(eventRow)

  const currentEventRegistrationsQuery = await supabase
    .from("event_registrations")
    .select("id, user_id, age_group, occupation, discovery, other")
    .eq("event_id", params.id)

  if (currentEventRegistrationsQuery.error) {
    console.error(currentEventRegistrationsQuery.error)
  }

  const registrationRows =
    (currentEventRegistrationsQuery.data as EventRegistrationDetailRow[] | null) ?? []

  const filteredRegistrationRows = registrationRows.filter(
    (registration) => registration.user_id !== user?.id,
  )

  const insightRegistrations: EventRegistrationInsight[] = filteredRegistrationRows.map((registration) => ({
    age_group: registration.age_group,
    occupation: registration.occupation,
    other: registration.other,
  }))

  const isAuthenticated = Boolean(user)

  let sharedParticipantCount = 0
  let hasAppliedToEvent = false

  if (isAuthenticated && user) {
    const currentUserRegistrationQuery = await supabase
      .from("event_registrations")
      .select("event_id, user_id")
      .eq("user_id", user.id)

    if (currentUserRegistrationQuery.error) {
      console.error(currentUserRegistrationQuery.error)
    }

    const currentUserRegistrations =
      (currentUserRegistrationQuery.data as EventRegistrationRow[] | null) ?? []

    const currentUserEventIds = currentUserRegistrations.map((registration) => registration.event_id)
    const currentUserEventIdSet = new Set(currentUserEventIds)

    const participantRows = filteredRegistrationRows
    const participantUserIds = Array.from(new Set(participantRows.map((registration) => registration.user_id)))

    let participantRegistrations: EventRegistrationRow[] = []
    if (participantUserIds.length > 0) {
      const participantRegistrationsQuery = await supabase
        .from("event_registrations")
        .select("event_id, user_id")
        .in("user_id", participantUserIds)

      if (participantRegistrationsQuery.error) {
        console.error(participantRegistrationsQuery.error)
      }

      participantRegistrations =
        (participantRegistrationsQuery.data as EventRegistrationRow[] | null) ?? []
    }

    const sharedParticipantIds = new Set<string>()

    for (const registration of participantRows) {
      const userEventIds = participantRegistrations
        .filter((participantRegistration) => participantRegistration.user_id === registration.user_id)
        .map((participantRegistration) => participantRegistration.event_id)

      const hasSharedEvent = currentUserEventIdSet.size
        ? userEventIds.some((eventId) => currentUserEventIdSet.has(eventId))
        : userEventIds.includes(params.id)

      if (hasSharedEvent) {
        sharedParticipantIds.add(registration.user_id)
      }
    }

    sharedParticipantCount = sharedParticipantIds.size

    hasAppliedToEvent = currentUserEventIdSet.has(params.id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventDetailClient
        event={event}
        eventId={params.id}
        sharedParticipantCount={sharedParticipantCount}
        hasAppliedToEvent={hasAppliedToEvent}
        isAuthenticated={isAuthenticated}
        aiSummarySection={
          <Suspense fallback={<AiSummarySkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <AiSummaryContent event={event} registrations={insightRegistrations} />
          </Suspense>
        }
      />
    </div>
  )
}
