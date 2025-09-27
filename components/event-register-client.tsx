"use client"

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import type { Event } from "@/app/page"
import { EVENT_SELECT_COLUMNS, mapEventRowToEvent, type EventRow } from "@/lib/supabase/events"
import type { AgeGroup, DiscoverySource, OccupationCategory } from "@/types/participant"

interface EventRegisterClientProps {
  event: Event
  eventId: string
  userId: string
  existingRegistration?: {
    name: string | null
    ageGroup: AgeGroup | ""
    occupation: OccupationCategory | ""
    discovery: DiscoverySource | ""
    other?: string | null
  }
}

interface FormState {
  name: string
  ageGroup: string
  occupation: string
  discovery: string
  other: string
}

const INITIAL_FORM_STATE: FormState = {
  name: "",
  ageGroup: "",
  occupation: "",
  discovery: "",
  other: "",
}

export function EventRegisterClient({ event, eventId, userId, existingRegistration }: EventRegisterClientProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [eventState, setEventState] = useState<Event>(event)
  const [formState, setFormState] = useState<FormState>({
    name: existingRegistration?.name ?? "",
    ageGroup: existingRegistration?.ageGroup ?? "",
    occupation: existingRegistration?.occupation ?? "",
    discovery: existingRegistration?.discovery ?? "",
    other: existingRegistration?.other ?? "",
  })
  const [submitted, setSubmitted] = useState(Boolean(existingRegistration))
  const [hasRegistered, setHasRegistered] = useState(Boolean(existingRegistration))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const remainingSeats = Math.max(eventState.maxAttendees - eventState.currentAttendees, 0)
  const isFull = remainingSeats <= 0
  const canApply = !isFull || hasRegistered

  const handleChange = (field: keyof FormState) => (
    changeEvent: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: changeEvent.target.value,
    }))
  }

  const handleSelectChange = (field: keyof FormState) => (value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const syncEventAttendance = async () => {
    const { count, error: countError } = await supabase
      .from("event_registrations")
      .select("event_id", { count: "exact", head: true })
      .eq("event_id", eventId)

    if (!countError && typeof count === "number") {
      const updateResult = await supabase
        .from("events")
        .update({ current_attendees: count })
        .eq("id", eventId)
        .select(EVENT_SELECT_COLUMNS)
        .single()

      if (!updateResult.error && updateResult.data) {
        setEventState(mapEventRowToEvent(updateResult.data as EventRow))
        return
      }

      if (updateResult.error) {
        console.error(updateResult.error)
      }
    } else if (countError) {
      console.error(countError)
    }

    const latestEventResult = await supabase
      .from("events")
      .select(EVENT_SELECT_COLUMNS)
      .eq("id", eventId)
      .single()

    if (!latestEventResult.error && latestEventResult.data) {
      setEventState(mapEventRowToEvent(latestEventResult.data as EventRow))
    } else if (latestEventResult.error) {
      console.error(latestEventResult.error)
    }
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()

    if (isSubmitting) {
      return
    }

    setError(null)

    if (!formState.name.trim() || !formState.ageGroup || !formState.occupation || !formState.discovery) {
      setError("必須項目を入力してください")
      return
    }

    if (!canApply) {
      setError("満席のため申し込みできません")
      return
    }

    setIsSubmitting(true)

    const upsertResult = await supabase
      .from("event_registrations")
      .upsert(
        {
          event_id: eventId,
          user_id: userId,
          name: formState.name.trim(),
          age_group: formState.ageGroup,
          occupation: formState.occupation,
          discovery: formState.discovery,
          other: formState.other ? formState.other.trim() : null,
        },
        { onConflict: "event_id,user_id" },
      )

    if (upsertResult.error) {
      console.error(upsertResult.error)
      setError("申し込みに失敗しました。時間を置いて再度お試しください。")
      setIsSubmitting(false)
      return
    }

    await syncEventAttendance()

    setSubmitted(true)
    setHasRegistered(true)
    setIsSubmitting(false)
  }

  const handleReset = () => {
    setFormState({
      name: existingRegistration?.name ?? "",
      ageGroup: existingRegistration?.ageGroup ?? "",
      occupation: existingRegistration?.occupation ?? "",
      discovery: existingRegistration?.discovery ?? "",
      other: existingRegistration?.other ?? "",
    })
    setSubmitted(false)
    setError(null)
  }

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
                      {eventState.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-card-foreground">{eventState.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(eventState.date), "yyyy年M月d日（E）", { locale: ja })} {eventState.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {eventState.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      定員 {eventState.maxAttendees} 名 / 残り {Math.max(eventState.maxAttendees - eventState.currentAttendees, 0)} 席
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{eventState.description}</p>
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
                    <Button onClick={() => router.push(`/events/${eventId}`)} className="flex-1 min-w-[160px]">
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

                  {isFull && !hasRegistered && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                      満席のため現在申し込みできません。
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
                      disabled={isSubmitting || !canApply}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>年代 *</Label>
                      <Select
                        value={formState.ageGroup || undefined}
                        onValueChange={handleSelectChange("ageGroup")}
                        disabled={isSubmitting || !canApply}
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
                        onValueChange={handleSelectChange("occupation")}
                        disabled={isSubmitting || !canApply}
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
                      onValueChange={handleSelectChange("discovery")}
                      disabled={isSubmitting || !canApply}
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
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other">その他（任意）</Label>
                    <Textarea
                      id="other"
                      value={formState.other}
                      onChange={handleChange("other")}
                      placeholder="補足があればご記入ください"
                      rows={3}
                      disabled={isSubmitting || !canApply}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" className="flex-1 min-w-[160px]" disabled={isSubmitting || !canApply}>
                      {isSubmitting ? "送信中..." : "申し込む"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/events/${eventId}`)}
                      className="flex-1 min-w-[160px]"
                      disabled={isSubmitting}
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
