"use client"

import { useMemo, useState } from "react"
import { EventList } from "@/components/event-list"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { Event } from "@/app/page"

interface EventsPageClientProps {
  initialEvents: Event[]
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

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const [events, setEvents] = useState<Event[]>(() => sortEventsByStartDesc(initialEvents))
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCreateEvent = async (eventData: Omit<Event, "id" | "createdAt">) => {
    setIsProcessing(true)
    setErrorMessage(null)

    const insertResult = await supabase
      .from("events")
      .insert({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        category: eventData.category,
        max_attendees: eventData.maxAttendees,
        current_attendees: 0,
        is_public: eventData.isPublic,
      })
      .select(EVENT_SELECT_COLUMNS)
      .single()

    if (insertResult.error) {
      console.error(insertResult.error)
      setErrorMessage("イベントの作成に失敗しました。入力内容を確認して再度お試しください。")
    } else if (insertResult.data) {
      const createdEvent = mapEventRowToEvent(insertResult.data as EventRow)
      setEvents((prev) => sortEventsByStartDesc([...prev, createdEvent]))
      setShowForm(false)
    }

    setIsProcessing(false)
  }

  const handleUpdateEvent = async (eventData: Omit<Event, "id" | "createdAt">) => {
    if (!editingEvent) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const updateResult = await supabase
      .from("events")
      .update({
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        category: eventData.category,
        max_attendees: eventData.maxAttendees,
        current_attendees: eventData.currentAttendees,
        is_public: eventData.isPublic,
      })
      .eq("id", editingEvent.id)
      .select(EVENT_SELECT_COLUMNS)
      .single()

    if (updateResult.error) {
      console.error(updateResult.error)
      setErrorMessage("イベントの更新に失敗しました。時間を置いて再度お試しください。")
    } else if (updateResult.data) {
      const updatedEvent = mapEventRowToEvent(updateResult.data as EventRow)
      setEvents((prev) =>
        sortEventsByStartDesc(prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))),
      )
      setEditingEvent(null)
      setShowForm(false)
    }

    setIsProcessing(false)
  }

  const handleDeleteEvent = async (id: string) => {
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
      if (editingEvent?.id === id) {
        setEditingEvent(null)
        setShowForm(false)
      }
    }

    setIsProcessing(false)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Calendar className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <h2 className="text-[32px] font-semibold leading-tight text-foreground">イベント一覧</h2>
            <p className="text-sm text-muted-foreground">開催予定のイベントを確認し、新規作成や内容の更新ができます。</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
          size="lg"
          disabled={isProcessing}
        >
          <Plus className="h-5 w-5" />
          新しいイベント
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {showForm ? (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          isSubmitting={isProcessing}
          onCancel={handleCancelForm}
        />
      ) : (
        <EventList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} isProcessing={isProcessing} />
      )}
    </div>
  )
}
