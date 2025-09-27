"use client"

import { useState } from "react"
import { EventList } from "@/components/event-list"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  maxAttendees: number
  currentAttendees: number
  isPublic: boolean
  createdAt: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "テックカンファレンス 2025",
      description: "最新のテクノロジートレンドについて学ぶカンファレンス",
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
      description: "UI/UXデザインの基礎を学ぶハンズオンワークショップ",
      date: "2025-02-28",
      time: "14:00",
      location: "渋谷クリエイティブセンター",
      category: "デザイン",
      maxAttendees: 30,
      currentAttendees: 18,
      isPublic: true,
      createdAt: "2025-01-10T14:30:00Z",
    },
  ])

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">イベント管理</h1>
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
    </div>
  )
}
