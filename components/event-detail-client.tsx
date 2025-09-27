"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Users, Share2, Edit, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import type { Event } from "@/app/page"
import type { AgeGroup, DiscoverySource, EventParticipant, OccupationCategory } from "@/types/participant"

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  teens: "10代以下",
  twenties: "20代",
  thirties: "30代",
  forties: "40代",
  fifties: "50代",
  sixtiesPlus: "60代以上",
}

const OCCUPATION_LABELS: Record<OccupationCategory, string> = {
  student: "学生",
  engineer: "エンジニア",
  designer: "デザイナー",
  planner: "企画・マーケティング",
  manager: "マネジメント",
  other: "その他",
}

const DISCOVERY_LABELS: Record<DiscoverySource, string> = {
  sns: "SNS",
  search: "インターネット検索",
  friend: "友人・知人の紹介",
  media: "メディア記事・ブログ",
  eventSite: "イベント紹介サイト",
  other: "その他",
}

interface EventDetailClientProps {
  event: Event | null
  eventId: string
  participants: EventParticipant[]
  hasAppliedToEvent: boolean
}

export function EventDetailClient({ event, eventId, participants, hasAppliedToEvent }: EventDetailClientProps) {
  const router = useRouter()

  const handleShare = () => {
    if (event) {
      const shareUrl = `${window.location.origin}/events/${event.id}`
      navigator.clipboard.writeText(shareUrl)
      console.log("イベントURLをコピーしました:", shareUrl)
    }
  }

  const handleEdit = () => {
    router.push(`/?edit=${eventId}`)
  }

  const handleRegister = () => {
    router.push(`/events/${eventId}/register`)
  }

  const attendancePercentage = event ? Math.min((event.currentAttendees / event.maxAttendees) * 100, 100) : 0
  const participantCount = participants.length

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        戻る
      </Button>

      {!event ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-4">イベントが見つかりません</div>
          <p className="text-muted-foreground">指定されたイベントは存在しないか、削除された可能性があります</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {event.category}
                    </Badge>
                    <Badge variant={event.isPublic ? "default" : "secondary"}>
                      {event.isPublic ? "公開" : "非公開"}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl text-card-foreground mb-4">{event.title}</CardTitle>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Share2 className="h-4 w-4" />
                    シェア
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Edit className="h-4 w-4" />
                    編集
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">イベント詳細</h3>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">開催情報</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          {format(parseISO(event.date), "yyyy年M月d日（E）", { locale: ja })}
                        </div>
                        <div className="text-sm text-muted-foreground">{event.time}開始</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{event.location}</div>
                        <div className="text-sm text-muted-foreground">会場</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">参加状況</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {event.currentAttendees} / {event.maxAttendees} 人
                          </span>
                          <span className="text-sm text-muted-foreground">{attendancePercentage.toFixed(0)}%</span>
                        </div>
                        <div className="bg-muted rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      残り {event.maxAttendees - event.currentAttendees} 席
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t border-border pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">共通イベント参加者</h3>
                    <p className="text-sm text-muted-foreground">あなたと共通の参加履歴があるユーザー: {participantCount} 名</p>
                  </div>
                  {participantCount === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {hasAppliedToEvent
                        ? "あなたと共通の参加履歴があるユーザーはまだ見つかりません。"
                        : "このイベントに参加申し込みすると、共通の参加履歴があるユーザーが表示されます。"}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {participants.map((participant) => (
                        <li
                          key={participant.id}
                          className="rounded-lg border border-border bg-muted/10 p-4"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                {AGE_GROUP_LABELS[participant.ageGroup]}
                              </span>
                              <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                                {OCCUPATION_LABELS[participant.occupation]}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              認知経路: {DISCOVERY_LABELS[participant.discovery]}
                            </div>
                            {participant.sharedEventTitles.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                共通参加イベント: {participant.sharedEventTitles.join(" / ")}
                              </div>
                            )}
                            {participant.other && (
                              <p className="text-sm text-muted-foreground">その他: {participant.other}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>作成日: {format(new Date(event.createdAt), "yyyy年M月d日", { locale: ja })}</span>
                  <span>イベントID: {event.id}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button size="lg" className="flex-1" onClick={handleRegister} disabled={hasAppliedToEvent}>
                  {hasAppliedToEvent ? "申し込み済み" : "参加申し込み"}
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  シェア
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
