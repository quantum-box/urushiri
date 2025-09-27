import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventRegisterClient } from "@/components/event-register-client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { AgeGroup, DiscoverySource, OccupationCategory } from "@/types/participant"

interface EventRegisterPageProps {
  params: { id: string }
}

type RegistrationRow = {
  name: string | null
  age_group: AgeGroup | null
  occupation: OccupationCategory | null
  discovery: DiscoverySource | null
  other: string | null
}

export default async function EventRegisterPage({ params }: EventRegisterPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/signin")
  }

  const eventResult = await supabase
    .from("events")
    .select(EVENT_SELECT_COLUMNS)
    .eq("id", params.id)
    .maybeSingle()

  if (eventResult.error) {
    console.error(eventResult.error)
  }

  const eventRow = (eventResult.data as EventRow | null) ?? null

  if (!eventRow) {
    notFound()
  }

  const existingRegistrationResult = await supabase
    .from("event_registrations")
    .select("name, age_group, occupation, discovery, other")
    .eq("event_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingRegistrationResult.error && existingRegistrationResult.error.code !== "PGRST116") {
    console.error(existingRegistrationResult.error)
  }

  const registrationRow = (existingRegistrationResult.data as RegistrationRow | null) ?? null

  const existingRegistration = registrationRow
    ? {
        name: registrationRow.name,
        ageGroup: (registrationRow.age_group ?? "") as AgeGroup | "",
        occupation: (registrationRow.occupation ?? "") as OccupationCategory | "",
        discovery: (registrationRow.discovery ?? "") as DiscoverySource | "",
        other: registrationRow.other ?? "",
      }
    : undefined

  return (
    <EventRegisterClient
      event={mapEventRowToEvent(eventRow)}
      eventId={params.id}
      userId={user.id}
      existingRegistration={existingRegistration}
    />
  )
}
