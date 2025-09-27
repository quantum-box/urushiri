"use client"

import { useState } from "react"
import { EventList } from "@/components/event-list"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import type { Event } from "@/app/page"

interface EventsPageClientProps {
  initialEvents: Event[]
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const handleCreateEvent = (eventData: Omit<Event, "id" | "createdAt">) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setEvents([newEvent, ...events])
    setShowForm(false)
  }

  const handleUpdateEvent = (eventData: Omit<Event, "id" | "createdAt">) => {
    if (editingEvent) {
      const updatedEvent: Event = {
        ...eventData,
        id: editingEvent.id,
        createdAt: editingEvent.createdAt,
      }
      setEvents(events.map((event) => (event.id === editingEvent.id ? updatedEvent : event)))
      setEditingEvent(null)
      setShowForm(false)
    }
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">イベント一覧</h2>
            <p className="text-muted-foreground">イベントの作成、編集、削除ができます</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2" size="lg">
          <Plus className="h-5 w-5" />
          新しいイベント
        </Button>
      </div>

      {showForm ? (
        <EventForm
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={handleCancelForm}
        />
      ) : (
        <EventList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
      )}
    </div>
  )
}
