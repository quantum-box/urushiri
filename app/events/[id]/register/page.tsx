"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Event } from "@/app/page"

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

interface EventRegisterPageProps {
  params: { id: string }
}

interface FormState {
  name: string
  ageGroup: string
  occupation: string
  discovery: string
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  ageGroup: "",
  occupation: "",
  discovery: "",
}

export default function EventRegisterPage({ params }: EventRegisterPageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const foundEvent = mockEvents.find((item) => item.id === params.id) || null
    setEvent(foundEvent)
    setLoading(false)
  }, [params.id])

  const handleChange = (field: keyof FormState) => (
    changeEvent: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: changeEvent.target.value,
    }))
  }

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setError(null)

    if (!formState.name.trim() || !formState.ageGroup || !formState.occupation || !formState.discovery) {
      setError("必須項目を入力してください")
      return
    }

    if (!event) {
      setError("イベント情報の取得に失敗しました")
      return
    }

    setSubmitted(true)
  }

  const handleReset = () => {
    setFormState(INITIAL_FORM_STATE)
    setSubmitted(false)
    setError(null)
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

  const remainingSeats = Math.max(event.maxAttendees - event.currentAttendees, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {event.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-card-foreground">{event.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.date), "yyyy年M月d日（E）", { locale: ja })} {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      定員 {event.maxAttendees} 名 / 残り {remainingSeats} 席
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">参加申し込みフォーム</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">申し込みを受け付けました</p>
                      <p className="text-sm">担当者よりご連絡いたします。ご参加ありがとうございます。</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => router.push(`/events/${event.id}`)} className="flex-1 min-w-[160px]">
                      イベント詳細に戻る
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="flex-1 min-w-[160px]">
                      もう一度申し込む
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">お名前 *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange("name")}
                      placeholder="山田 太郎"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>年代 *</Label>
                      <Select
                        value={formState.ageGroup || undefined}
                        onValueChange={(value) => setFormState((prev) => ({ ...prev, ageGroup: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teens">10代以下</SelectItem>
                          <SelectItem value="twenties">20代</SelectItem>
                          <SelectItem value="thirties">30代</SelectItem>
                          <SelectItem value="forties">40代</SelectItem>
                          <SelectItem value="fifties">50代</SelectItem>
                          <SelectItem value="sixtiesPlus">60代以上</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>職種 *</Label>
                      <Select
                        value={formState.occupation || undefined}
                        onValueChange={(value) => setFormState((prev) => ({ ...prev, occupation: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">学生</SelectItem>
                          <SelectItem value="engineer">エンジニア</SelectItem>
                          <SelectItem value="designer">デザイナー</SelectItem>
                          <SelectItem value="planner">企画・マーケティング</SelectItem>
                          <SelectItem value="manager">マネジメント</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>どこでこのイベントを知りましたか *</Label>
                    <Select
                      value={formState.discovery || undefined}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, discovery: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sns">SNS</SelectItem>
                        <SelectItem value="search">インターネット検索</SelectItem>
                        <SelectItem value="friend">友人・知人の紹介</SelectItem>
                        <SelectItem value="media">メディア記事やブログ</SelectItem>
                        <SelectItem value="eventSite">イベント紹介サイト</SelectItem>
                        <SelectItem value="eventSite">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="flex-1 min-w-[160px]">
                      申し込む
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="flex-1 min-w-[160px]"
                    >
                      キャンセル
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
