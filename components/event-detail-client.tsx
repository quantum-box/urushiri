"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Users, Share2, Edit, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Event } from "@/app/page"

interface EventDetailClientProps {
  event: Event | null
  eventId: string
}

export function EventDetailClient({ event, eventId }: EventDetailClientProps) {
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

  const attendancePercentage = event ? Math.min((event.currentAttendees / event.maxAttendees) * 100, 100) : 0

  return (
    <div className="container mx-auto px-6 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 hover:bg-honey-yellow/10 text-amber-700 rounded-2xl px-4 py-2"
      >
        <ArrowLeft className="h-5 w-5" />🔙 戻る
      </Button>

      {!event ? (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur rounded-3xl p-12 shadow-lg border border-honey-yellow/20 max-w-md mx-auto">
            <div className="text-6xl mb-4">😅</div>
            <div className="text-amber-800 text-xl font-semibold mb-3">イベントが見つかりません</div>
            <p className="text-amber-600">
              指定されたイベントは存在しないか、
              <br />
              削除された可能性があります
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur border-2 border-honey-yellow/20 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-br from-honey-yellow/10 to-soft-cream/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-honey-yellow/20 p-2 rounded-2xl">
                      <Calendar className="h-6 w-6 text-amber-700" />
                    </div>
                    <Badge className="bg-honey-yellow/20 text-amber-700 border-honey-yellow/30 font-medium px-3 py-1 rounded-full">
                      🏷️ {event.category}
                    </Badge>
                    <Badge
                      className={
                        event.isPublic
                          ? "bg-soft-green/80 text-green-800 border-green-200"
                          : "bg-soft-pink/80 text-pink-800 border-pink-200"
                      }
                    >
                      {event.isPublic ? "🌍 公開" : "🔒 非公開"}
                    </Badge>
                  </div>
                  <CardTitle className="text-4xl text-amber-800 mb-4 font-bold leading-tight">{event.title}</CardTitle>
                </div>
                <div className="flex gap-2 ml-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-white/80 border-honey-yellow/30 text-amber-700 hover:bg-honey-yellow/10 rounded-2xl px-4 py-2"
                  >
                    <Share2 className="h-4 w-4" />
                    シェア
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="flex items-center gap-2 bg-white/80 border-honey-yellow/30 text-amber-700 hover:bg-honey-yellow/10 rounded-2xl px-4 py-2"
                  >
                    <Edit className="h-4 w-4" />
                    編集
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-8">
              <div>
                <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">📝 イベント詳細</h3>
                <div className="bg-honey-yellow/5 p-6 rounded-2xl border border-honey-yellow/10">
                  <p className="text-amber-700 leading-relaxed text-lg">{event.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">📋 開催情報</h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-honey-yellow/10 p-4 rounded-2xl">
                      <div className="bg-honey-yellow/20 p-2 rounded-xl">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-bold text-amber-800 text-lg">
                          📅 {format(new Date(event.date), "yyyy年M月d日（E）", { locale: ja })}
                        </div>
                        <div className="text-amber-600 font-medium">⏰ {event.time}開始</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-honey-yellow/10 p-4 rounded-2xl">
                      <div className="bg-honey-yellow/20 p-2 rounded-xl">
                        <MapPin className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-bold text-amber-800 text-lg">📍 {event.location}</div>
                        <div className="text-amber-600 font-medium">会場</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">👥 参加状況</h3>

                  <div className="space-y-4">
                    <div className="bg-honey-yellow/10 p-6 rounded-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-honey-yellow/20 p-2 rounded-xl">
                          <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-amber-800 text-lg">
                              {event.currentAttendees} / {event.maxAttendees} 人
                            </span>
                            <span className="text-amber-600 font-medium">{attendancePercentage.toFixed(0)}%</span>
                          </div>
                          <div className="bg-white rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-honey-yellow to-amber-400 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-amber-700 font-medium text-center bg-white/50 p-3 rounded-xl">
                        🎯 残り {event.maxAttendees - event.currentAttendees} 席
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-honey-yellow/20 pt-6">
                <div className="flex items-center justify-between text-sm text-amber-600 bg-honey-yellow/5 p-4 rounded-2xl">
                  <span className="font-medium">
                    📅 作成日: {format(new Date(event.createdAt), "yyyy年M月d日", { locale: ja })}
                  </span>
                  <span className="font-medium">🆔 イベントID: {event.id}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  size="lg"
                  className="flex-1 bg-honey-yellow hover:bg-honey-yellow/90 text-amber-800 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
                >
                  🙋‍♀️ 参加申し込み
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="px-8 py-4 border-honey-yellow/30 text-amber-700 hover:bg-honey-yellow/10 rounded-2xl font-semibold bg-transparent"
                >
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
