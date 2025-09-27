"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Clock, Users, Share2, Edit, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Event } from "@/app/page"

// モックデータ（実際のアプリでは、APIやデータベースから取得）
const mockEvents: Event[] = [
  {
    id: "1",
    title: "テックカンファレンス 2025",
    description:
      "最新のテクノロジートレンドについて学ぶカンファレンス。AI、機械学習、Web開発の最新動向について業界のエキスパートが講演します。ネットワーキングの機会もあり、同じ志を持つ開発者との交流も期待できます。",
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
    description:
      "UI/UXデザインの基礎を学ぶハンズオンワークショップ。Figmaを使った実践的なデザイン制作を通じて、ユーザー中心のデザイン思考を身につけます。",
    date: "2025-02-28",
    time: "14:00",
    location: "渋谷クリエイティブセンター",
    category: "デザイン",
    maxAttendees: 30,
    currentAttendees: 18,
    isPublic: true,
    createdAt: "2025-01-10T14:30:00Z",
  },
]

interface EventDetailPageProps {
  params: { id: string }
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 実際のアプリでは、APIからイベントデータを取得
    const foundEvent = mockEvents.find((e) => e.id === params.id)
    setEvent(foundEvent || null)
    setLoading(false)
  }, [params.id])

  const handleShare = () => {
    if (event) {
      const shareUrl = `${window.location.origin}/events/${event.id}`
      navigator.clipboard.writeText(shareUrl)
      console.log("イベントURLをコピーしました:", shareUrl)
    }
  }

  const handleEdit = () => {
    router.push(`/?edit=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">イベントが見つかりません</div>
            <p className="text-muted-foreground">指定されたイベントは存在しないか、削除された可能性があります</p>
          </div>
        </div>
      </div>
    )
  }

  const attendancePercentage = Math.min((event.currentAttendees / event.maxAttendees) * 100, 100)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Button>

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
                          {format(new Date(event.date), "yyyy年M月d日（E）", { locale: ja })}
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

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>作成日: {format(new Date(event.createdAt), "yyyy年M月d日", { locale: ja })}</span>
                  <span>イベントID: {event.id}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button size="lg" className="flex-1">
                  参加申し込み
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  シェア
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
