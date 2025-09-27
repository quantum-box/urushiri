"use client"

import type React from "react"

import { useState } from "react"
import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface EventFormProps {
  event?: Event | null
  onSubmit: (eventData: Omit<Event, "id" | "createdAt">) => void
  onCancel: () => void
}

const categories = [
  "テクノロジー",
  "デザイン",
  "ビジネス",
  "教育",
  "エンターテイメント",
  "スポーツ",
  "アート",
  "その他",
]

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    time: event?.time || "",
    location: event?.location || "",
    category: event?.category || "",
    maxAttendees: event?.maxAttendees || 50,
    currentAttendees: event?.currentAttendees || 0,
    isPublic: event?.isPublic ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto bg-white border-2 border-honey-yellow/20 rounded-3xl shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-honey-yellow/10 to-soft-cream/50 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎪</div>
          <CardTitle className="text-2xl text-amber-800 font-bold">
            {event ? "✏️ イベントを編集" : "✨ 新しいイベントを作成"}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-10 w-10 p-0 hover:bg-honey-yellow/20 rounded-full text-amber-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-amber-800 font-semibold flex items-center gap-2">
                🏷️ イベント名 *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="楽しいイベント名を入力"
                required
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-amber-800 font-semibold flex items-center gap-2">
                📂 カテゴリー *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-honey-yellow/20 rounded-2xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-amber-800 hover:bg-honey-yellow/10">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-800 font-semibold flex items-center gap-2">
              📝 説明
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="イベントの詳細を入力してください"
              rows={4}
              className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl p-4 text-amber-800 resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-amber-800 font-semibold flex items-center gap-2">
                📅 日付 *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-amber-800 font-semibold flex items-center gap-2">
                ⏰ 時間 *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees" className="text-amber-800 font-semibold flex items-center gap-2">
                👥 定員
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={(e) => handleChange("maxAttendees", Number.parseInt(e.target.value) || 0)}
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-amber-800 font-semibold flex items-center gap-2">
              📍 場所 *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="開催場所を入力"
              required
              className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
            />
          </div>

          {event && (
            <div className="space-y-2">
              <Label htmlFor="currentAttendees" className="text-amber-800 font-semibold flex items-center gap-2">
                🙋‍♀️ 現在の参加者数
              </Label>
              <Input
                id="currentAttendees"
                type="number"
                min="0"
                max={formData.maxAttendees}
                value={formData.currentAttendees}
                onChange={(e) => handleChange("currentAttendees", Number.parseInt(e.target.value) || 0)}
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>
          )}

          <div className="flex items-center space-x-3 bg-honey-yellow/10 p-4 rounded-2xl">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange("isPublic", checked)}
              className="data-[state=checked]:bg-honey-yellow"
            />
            <Label htmlFor="isPublic" className="text-amber-800 font-semibold flex items-center gap-2">
              {formData.isPublic ? "🌍 公開イベント" : "🔒 非公開イベント"}
            </Label>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 flex items-center gap-2 bg-honey-yellow hover:bg-honey-yellow/90 text-amber-800 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
            >
              <Save className="h-5 w-5" />
              {event ? "🔄 更新" : "🎉 作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 py-4 border-honey-yellow/30 text-amber-700 hover:bg-honey-yellow/10 rounded-2xl font-semibold bg-transparent"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
