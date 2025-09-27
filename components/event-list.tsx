"use client"

import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Clock, Users, Share2, Eye } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface EventListProps {
  events: Event[]
  onEdit?: (event: Event) => void
  onDelete?: (id: string) => void
  isProcessing?: boolean
  canManageEvents?: boolean
}

export function EventList({ events, onEdit, onDelete, isProcessing = false, canManageEvents = false }: EventListProps) {
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
      <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-border/80 bg-white/70 px-10 py-12 text-center">
        <div className="text-lg font-medium text-foreground">まだイベントがありません</div>
        <p className="text-sm text-muted-foreground">
          {canManageEvents
            ? "「新しいイベント」ボタンから最初のイベントを作成して、コミュニティを広げましょう。"
            : "公開されているイベントが追加されると、ここに表示されます。"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event) => (
        <Card
          key={event.id}
          className="group border border-border/80 bg-white/95 transition-all hover:border-primary/40 hover:shadow-[0px_12px_30px_rgba(244,168,185,0.12)]"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Badge variant="secondary" className="w-fit">
                  {event.category}
                </Badge>
                <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2">
                  {event.title}
                </CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetail(event.id)}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(event)}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                {canManageEvents && onEdit && onDelete && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(event)}
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                      disabled={isProcessing}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(event.id)}
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{event.description}</p>

            <div className="space-y-3 text-sm text-foreground">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {format(parseISO(event.date), "yyyy年M月d日", { locale: ja })} {event.time}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{event.location}</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-foreground">
                  {event.currentAttendees} / {event.maxAttendees} 人
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant={event.isPublic ? "neutral" : "outline"}>
                {event.isPublic ? "公開イベント" : "非公開"}
              </Badge>
              <span>{format(new Date(event.createdAt), "M/d作成", { locale: ja })}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetail(event.id)}
              className="mt-1 w-full justify-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              詳細を見る
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
