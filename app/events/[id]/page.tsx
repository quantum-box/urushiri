import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EventDetailClient } from "@/components/event-detail-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { AgeGroup, DiscoverySource, EventParticipant, OccupationCategory } from "@/types/participant"
import type { Event } from "@/app/page"

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

  if (authError || !user) {
    redirect("/signin")
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

  const currentUserRegistrationQuery = await supabase
    .from("event_registrations")
    .select("event_id, user_id")
    .eq("user_id", user.id)

  const currentUserRegistrations = (currentUserRegistrationQuery.data as EventRegistrationRow[] | null) ?? []

  const currentUserEventIds = currentUserRegistrations.map((registration) => registration.event_id)
  const currentUserEventIdSet = new Set(currentUserEventIds)

  const currentEventRegistrationsQuery = await supabase
    .from("event_registrations")
    .select("id, user_id, age_group, occupation, discovery, other")
    .eq("event_id", params.id)

  if (currentEventRegistrationsQuery.error) {
    console.error(currentEventRegistrationsQuery.error)
  }

  const participantRows = ((currentEventRegistrationsQuery.data as EventRegistrationDetailRow[] | null) ?? []).filter(
    (registration) => registration.user_id !== user.id,
  )
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

    participantRegistrations = (participantRegistrationsQuery.data as EventRegistrationRow[] | null) ?? []
  }

  const eventIdsForTitleLookup = new Set<string>([
    eventRow.id,
    ...participantRegistrations.map((registration) => registration.event_id),
    ...Array.from(currentUserEventIdSet),
  ])

  const eventTitleMap = new Map<string, string>()
  eventTitleMap.set(eventRow.id, eventRow.title)

  if (eventIdsForTitleLookup.size > 1) {
    const idsToFetch = Array.from(eventIdsForTitleLookup).filter((eventId) => !eventTitleMap.has(eventId))

    if (idsToFetch.length > 0) {
      const { data: relatedEvents, error: relatedEventsError } = await supabase
        .from("events")
        .select("id, title")
        .in("id", idsToFetch)

      if (relatedEventsError) {
        console.error(relatedEventsError)
      }

      for (const relatedEvent of relatedEvents ?? []) {
        eventTitleMap.set(relatedEvent.id, relatedEvent.title)
      }
    }
  }

  const participants = participantRows.reduce<EventParticipant[]>((acc, registration) => {
    const userEventIds = participantRegistrations
      .filter((participantRegistration) => participantRegistration.user_id === registration.user_id)
      .map((participantRegistration) => participantRegistration.event_id)

    const sharedEventIds = currentUserEventIdSet.size
      ? Array.from(new Set(userEventIds.filter((eventId) => currentUserEventIdSet.has(eventId))))
      : userEventIds.includes(params.id)
        ? [params.id]
        : []

    if (!sharedEventIds.length) {
      return acc
    }

    const sharedEventTitles = sharedEventIds
      .map((eventId) => eventTitleMap.get(eventId))
      .filter((title): title is string => Boolean(title))

    if (!sharedEventTitles.length) {
      return acc
    }

    const { age_group: ageGroup, occupation, discovery } = registration

    if (!ageGroup || !occupation || !discovery) {
      return acc
    }

    acc.push({
      id: registration.user_id,
      ageGroup,
      occupation,
      discovery,
      sharedEventTitles,
      other: registration.other ?? undefined,
    })

    return acc
  }, [])

  const hasAppliedToEvent = currentUserEventIdSet.has(params.id)

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
