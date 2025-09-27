import type { Event } from "@/app/page"

export const EVENT_SELECT_COLUMNS =
  "id, title, description, date, time, location, category, max_attendees, current_attendees, is_public, created_at"

export type EventRow = {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  location: string | null
  category: string | null
  max_attendees: number
  current_attendees: number | null
  is_public: boolean
  created_at: string
}

export const mapEventRowToEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  date: row.date,
  time: row.time ?? "",
  location: row.location ?? "",
  category: row.category ?? "",
  maxAttendees: row.max_attendees,
  currentAttendees: row.current_attendees ?? 0,
  isPublic: row.is_public,
  createdAt: row.created_at,
})
