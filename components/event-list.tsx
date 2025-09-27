"use client"

import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Clock, Users, Share2, Eye } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface EventListProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (id: string) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  const router = useRouter()

  const handleShare = (event: Event) => {
    const shareUrl = `${window.location.origin}/events/${event.id}`
    navigator.clipboard.writeText(shareUrl)
    console.log("イベントURLをコピーしました:", shareUrl)
  }

  const handleViewDetail = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur rounded-3xl p-12 shadow-lg border border-honey-yellow/20 max-w-md mx-auto">
          <div className="text-6xl mb-4">🧸</div>
          <div className="text-amber-800 text-xl font-semibold mb-3">まだイベントがありません</div>
          <p className="text-amber-600">
            「✨ 新しいイベント」ボタンをクリックして
            <br />
            最初のイベントを作成しましょう
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="bg-white/90 backdrop-blur border-2 border-honey-yellow/20 hover:border-honey-yellow/40 hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden"
        >
          <CardHeader className="pb-4 bg-gradient-to-br from-honey-yellow/10 to-soft-cream/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-amber-800 line-clamp-2 font-bold mb-2">{event.title}</CardTitle>
                <Badge className="bg-honey-yellow/20 text-amber-700 border-honey-yellow/30 font-medium px-3 py-1 rounded-full">
                  🏷️ {event.category}
                </Badge>
              </div>
              <div className="flex gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetail(event.id)}
                  className="h-9 w-9 p-0 text-amber-600 hover:text-amber-800 hover:bg-honey-yellow/20 rounded-full"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(event)}
                  className="h-9 w-9 p-0 text-amber-600 hover:text-amber-800 hover:bg-honey-yellow/20 rounded-full"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="h-9 w-9 p-0 text-amber-600 hover:text-amber-800 hover:bg-honey-yellow/20 rounded-full"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="h-9 w-9 p-0 text-amber-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <p className="text-amber-700 text-sm line-clamp-3 leading-relaxed">{event.description}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-amber-700 bg-honey-yellow/10 p-3 rounded-2xl">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-medium">
                  📅 {format(new Date(event.date), "yyyy年M月d日", { locale: ja })} {event.time}
                </span>
              </div>

              <div className="flex items-center gap-3 text-amber-700 bg-honey-yellow/10 p-3 rounded-2xl">
                <MapPin className="h-5 w-5 text-amber-600" />
                <span className="truncate font-medium">📍 {event.location}</span>
              </div>

              <div className="bg-honey-yellow/10 p-3 rounded-2xl">
                <div className="flex items-center gap-3 text-amber-700 mb-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">
                    👥 {event.currentAttendees} / {event.maxAttendees} 人
                  </span>
                </div>
                <div className="bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-honey-yellow to-amber-400 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <Badge
                variant={event.isPublic ? "default" : "secondary"}
                className={
                  event.isPublic
                    ? "bg-soft-green/80 text-green-800 border-green-200"
                    : "bg-soft-pink/80 text-pink-800 border-pink-200"
                }
              >
                {event.isPublic ? "🌍 公開" : "🔒 非公開"}
              </Badge>
              <span className="text-xs text-amber-600 bg-honey-yellow/10 px-2 py-1 rounded-full">
                {format(new Date(event.createdAt), "M/d作成", { locale: ja })}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(event.id)}
              className="w-full mt-4 flex items-center gap-2 bg-honey-yellow/20 hover:bg-honey-yellow/30 text-amber-800 border-honey-yellow/30 font-semibold py-3 rounded-2xl"
            >
              <Eye className="h-4 w-4" />🔍 詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
