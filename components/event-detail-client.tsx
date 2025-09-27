"use client"

import type { ReactNode } from "react"
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
  aiSummarySection?: ReactNode
}

export function EventDetailClient({
  event,
  eventId,
  participants,
  hasAppliedToEvent,
  aiSummarySection,
}: EventDetailClientProps) {
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
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        戻る
      </Button>

      {!event ? (
        <div className="rounded-[16px] border border-dashed border-border/80 bg-white/70 px-8 py-16 text-center">
          <div className="mb-3 text-lg font-medium text-foreground">イベントが見つかりませんでした</div>
          <p className="text-sm text-muted-foreground">
            指定されたイベントは存在しないか、削除された可能性があります。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border border-border/80 bg-white/95 shadow-none">
            <CardHeader className="space-y-5 pb-0">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Badge variant="secondary">{event.category}</Badge>
                <Badge variant={event.isPublic ? "neutral" : "outline"}>
                  {event.isPublic ? "公開イベント" : "非公開"}
                </Badge>
                <span className="text-muted-foreground">ID: {event.id}</span>
              </div>
              <CardTitle className="text-[28px] font-semibold leading-tight text-card-foreground">
                {event.title}
              </CardTitle>
              {event.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-full border-transparent bg-accent/40 text-primary hover:border-primary/40 hover:bg-accent"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  シェア
                </Button>
                <Button variant="ghost" size="sm" onClick={handleEdit} className="rounded-full px-4 text-foreground/80">
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <section className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">開催情報</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div className="text-foreground">
                        <div className="font-medium">
                          {format(parseISO(event.date), "yyyy年M月d日（E）", { locale: ja })}
                        </div>
                        <div className="text-xs text-muted-foreground">{event.time} 開始</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="text-foreground">
                        <div className="font-medium">{event.location}</div>
                        <div className="text-xs text-muted-foreground">会場情報</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">参加状況</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="flex-1 text-foreground">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {event.currentAttendees} / {event.maxAttendees} 人
                          </span>
                          <span className="text-xs text-muted-foreground">{attendancePercentage.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full rounded-full bg-muted">
                          <div
                            className="h-2.5 rounded-full bg-primary transition-all"
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      残り {Math.max(event.maxAttendees - event.currentAttendees, 0)} 席
                    </div>
                  </div>
                </section>
              </div>

              {aiSummarySection && (
                <div className="rounded-[12px] border border-border/70 bg-white/80 p-5">
                  {aiSummarySection}
                </div>
              )}

              <section className="space-y-5 rounded-[12px] border border-border/70 bg-muted/30 p-5">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">共通イベント参加者</h3>
                  <p className="text-xs text-muted-foreground">
                    あなたと共通の参加履歴があるユーザー: {participantCount} 名
                  </p>
                </div>

                {participantCount === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {hasAppliedToEvent
                      ? "あなたと共通の参加履歴があるユーザーはまだ見つかりません。"
                      : "このイベントに申し込むと、共通の参加履歴があるユーザーが表示されます。"}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {participants.map((participant) => (
                      <li
                        key={participant.id}
                        className="rounded-[12px] border border-border/60 bg-white/90 p-4"
                      >
                        <div className="flex flex-col gap-2 text-sm text-foreground">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {AGE_GROUP_LABELS[participant.ageGroup]}
                            </Badge>
                            <Badge variant="neutral" className="text-xs">
                              {OCCUPATION_LABELS[participant.occupation]}
                            </Badge>
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
              </section>

              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                <span>作成日: {format(new Date(event.createdAt), "yyyy年M月d日", { locale: ja })}</span>
                <span>現在の参加者: {event.currentAttendees} 名</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="flex-1 min-w-[200px]" onClick={handleRegister} disabled={hasAppliedToEvent}>
                  {hasAppliedToEvent ? "申し込み済み" : "参加申し込み"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 min-w-[200px]"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  イベントをシェア
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
