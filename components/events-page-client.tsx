"use client"

import { useState } from "react"
import { EventList } from "@/components/event-list"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🎉</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-yellow-700 bg-clip-text text-transparent mb-2">
              みんなのイベント
            </h2>
            <p className="text-amber-600 text-lg font-medium">楽しいイベントを見つけて、新しい仲間と出会おう！</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          size="lg"
        >
          <Plus className="h-6 w-6" />
          新しいイベントを作る
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-yellow-200 p-8">
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
    </div>
  )
}
