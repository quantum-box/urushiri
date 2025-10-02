"use client"

import { useEffect, useMemo, useState } from "react"
import { EventList } from "@/components/event-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { Event } from "@/app/page"

interface EventsPageClientProps {
  initialEvents: Event[]
  canManageEvents: boolean
  showAdminHint?: boolean
  enableAiImageTools?: boolean
}

const buildEventTimestamp = (event: Event) => {
  if (!event.date) {
    return Number.NEGATIVE_INFINITY
  }

  const timePart = event.time ? `${event.time}${event.time.length === 5 ? ":00" : ""}` : "00:00:00"
  const timestamp = Date.parse(`${event.date}T${timePart}`)

  if (Number.isNaN(timestamp)) {
    return Date.parse(event.date)
  }

  return timestamp
}

const sortEventsByStartDesc = (events: Event[]) =>
  [...events].sort((a, b) => {
    const diff = buildEventTimestamp(b) - buildEventTimestamp(a)

    if (diff !== 0) {
      return diff
    }

    return Date.parse(b.createdAt) - Date.parse(a.createdAt)
  })

export function EventsPageClient({
  initialEvents,
  canManageEvents,
  showAdminHint = false,
  enableAiImageTools = false,
}: EventsPageClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const [events, setEvents] = useState<Event[]>(() => sortEventsByStartDesc(initialEvents))
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const getImagePathFromUrl = (url: string) => {
    const marker = "/event-images/"
    const index = url.indexOf(marker)
    if (index === -1) {
      return null
    }
    return url.slice(index + marker.length)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!canManageEvents) {
      return
    }

    const confirmed = window.confirm("このイベントを削除しますか？")
    if (!confirmed) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      console.error(error)
      setErrorMessage("イベントの削除に失敗しました。")
    } else {
      setEvents((prev) => prev.filter((event) => event.id !== id))
    }

    setIsProcessing(false)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:items-start">
          <span className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--info-bg)] text-[color:var(--info-foreground)]">
            <Calendar className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-[32px]">イベント一覧</h2>
            <p className="text-sm text-muted-foreground">
              {canManageEvents
                ? "開催予定のイベントを確認し、内容の更新や削除ができます。"
                : "開催予定のイベントを確認できます。"}
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!canManageEvents && showAdminHint && null}

      <EventList
        events={events}
        onDelete={canManageEvents ? handleDeleteEvent : undefined}
        isProcessing={isProcessing}
        canManageEvents={canManageEvents}
      />
    </div>
  )
}
