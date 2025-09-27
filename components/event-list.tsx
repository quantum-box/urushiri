"use client"

import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Clock, Users, Share2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface EventListProps {
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (id: string) => void
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  const handleShare = (event: Event) => {
    const shareUrl = `${window.location.origin}/events/${event.id}`
    navigator.clipboard.writeText(shareUrl)
    // Toast notification would go here
    console.log("イベントURLをコピーしました:", shareUrl)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-4">まだイベントがありません</div>
        <p className="text-muted-foreground">「新しいイベント」ボタンをクリックして最初のイベントを作成しましょう</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="bg-card border-border hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-card-foreground line-clamp-2">{event.title}</CardTitle>
                <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
                  {event.category}
                </Badge>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(event)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm line-clamp-2">{event.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.date), "yyyy年M月d日", { locale: ja })} {event.time}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {event.currentAttendees} / {event.maxAttendees} 人
                </span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge variant={event.isPublic ? "default" : "secondary"}>{event.isPublic ? "公開" : "非公開"}</Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.createdAt), "M/d作成", { locale: ja })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
