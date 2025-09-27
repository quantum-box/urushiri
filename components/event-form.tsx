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

const categories = ["カフェ会", "お散歩", "ランチ", "お茶会", "読書会", "映画鑑賞", "アート鑑賞", "その他"]

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    date: event?.date || "",
    time: event?.time || "",
    location: event?.location || "",
    category: event?.category || "",
    maxAttendees: event?.maxAttendees || 8, // Changed default from 50 to 8 for more intimate gatherings
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
    <Card className="max-w-2xl mx-auto bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-card-foreground">{event ? "集まりを編集" : "新しい集まりを作成"}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                集まりの名前 *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="集まりの名前を入力"
                required
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                カテゴリー *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              説明
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="集まりの詳細を入力"
              rows={3}
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                日付 *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">
                時間 *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                required
                className="bg-input border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees" className="text-foreground">
                定員
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={(e) => handleChange("maxAttendees", Number.parseInt(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">
              場所 *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="開催場所を入力"
              required
              className="bg-input border-border text-foreground"
            />
          </div>

          {event && (
            <div className="space-y-2">
              <Label htmlFor="currentAttendees" className="text-foreground">
                現在の参加者数
              </Label>
              <Input
                id="currentAttendees"
                type="number"
                min="0"
                max={formData.maxAttendees}
                value={formData.currentAttendees}
                onChange={(e) => handleChange("currentAttendees", Number.parseInt(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange("isPublic", checked)}
            />
            <Label htmlFor="isPublic" className="text-foreground">
              公開集まり
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 flex items-center gap-2">
              <Save className="h-4 w-4" />
              {event ? "更新" : "作成"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
