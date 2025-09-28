"use client"

import type React from "react"

import { useEffect, useState, type ChangeEvent } from "react"
import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save } from "lucide-react"

interface EventFormSubmission {
  data: Omit<Event, "id" | "createdAt">
  imageFile: File | null
  removeImage: boolean
}

interface EventFormProps {
  event?: Event | null
  onSubmit: (submission: EventFormSubmission) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
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

export function EventForm({ event, onSubmit, onCancel, isSubmitting = false }: EventFormProps) {
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
    imageUrl: event?.imageUrl || "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || "")
  const [removeImage, setRemoveImage] = useState(false)
  const [imageInputKey, setImageInputKey] = useState(0)

  useEffect(() => {
    setFormData({
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date || "",
      time: event?.time || "",
      location: event?.location || "",
      category: event?.category || "",
      maxAttendees: event?.maxAttendees || 50,
      currentAttendees: event?.currentAttendees || 0,
      isPublic: event?.isPublic ?? true,
      imageUrl: event?.imageUrl || "",
    })
    setRemoveImage(false)
    setImageFile(null)
    setImageInputKey((prev) => prev + 1)
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev)
      }
      return event?.imageUrl || ""
    })
  }, [event])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) {
      return
    }
    await onSubmit({
      data: {
        ...formData,
        imageUrl: removeImage ? "" : formData.imageUrl,
      },
      imageFile,
      removeImage,
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) {
      return
    }

    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      window.alert("JPEG・PNG・WebP形式の画像を選択してください")
      event.target.value = ""
      return
    }

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_IMAGE_SIZE) {
      window.alert("画像サイズは5MB以下にしてください")
      event.target.value = ""
      return
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const objectUrl = URL.createObjectURL(file)
    setImageFile(file)
    setPreviewUrl(objectUrl)
    setRemoveImage(false)
  }

  const handleRemoveImage = () => {
    if (isSubmitting) {
      return
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setImageFile(null)
    setPreviewUrl("")
    setRemoveImage(true)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    setImageInputKey((prev) => prev + 1)
  }

  return (
    <Card className="mx-auto max-w-3xl border border-border/80 bg-white/95 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          {event ? "イベントを編集" : "新しいイベントを作成"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 w-9 rounded-full text-muted-foreground">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                イベント名 *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="イベント名を入力"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                カテゴリー *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger disabled={isSubmitting}>
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
              placeholder="イベントの詳細を入力"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventImage" className="text-foreground">
              カバー画像（任意）
            </Label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img src={previewUrl} alt="イベント画像プレビュー" className="h-24 w-24 rounded-lg object-cover" />
                ) : formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="イベント画像"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border/80 text-xs text-muted-foreground">
                    画像なし
                  </div>
                )}
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <Input
                    key={imageInputKey}
                    id="eventImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                  <span>対応形式: JPEG / PNG / WebP（最大5MB）</span>
                </div>
              </div>
              {(previewUrl || formData.imageUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="max-w-[160px]"
                >
                  画像を削除
                </Button>
              )}
            </div>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleChange("isPublic", checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isPublic" className="text-foreground">
              公開イベント
            </Label>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button type="submit" className="flex-1 min-w-[160px] items-center gap-2" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {event ? "更新" : "作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 min-w-[160px]"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
