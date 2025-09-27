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
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-honey-yellow/20 p-3 rounded-3xl">
            <Calendar className="h-10 w-10 text-amber-700" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-amber-800 mb-1">🎪 イベント一覧</h2>
            <p className="text-amber-600 text-lg">みんなでゆるく楽しいイベントを共有しよう</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-honey-yellow hover:bg-honey-yellow/90 text-amber-800 font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
          size="lg"
        >
          <Plus className="h-6 w-6" />✨ 新しいイベント
        </Button>
      </div>

      {showForm ? (
        <div className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-lg border border-honey-yellow/20">
          <EventForm
            event={editingEvent}
            onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
            onCancel={handleCancelForm}
          />
        </div>
      ) : (
        <EventList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
      )}
    </div>
  )
}
