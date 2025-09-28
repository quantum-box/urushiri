"use client"

import type React from "react"

import { useCallback, useEffect, useState, type ChangeEvent } from "react"
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
  imageOnlyExtraction: boolean
}

interface EventFormProps {
  event?: Event | null
  onSubmit: (submission: EventFormSubmission) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  enableAiImageTools?: boolean
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

export function EventForm({
  event,
  onSubmit,
  onCancel,
  isSubmitting = false,
  enableAiImageTools = false,
}: EventFormProps) {
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
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || "")
  const [removeImage, setRemoveImage] = useState(false)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [imageOnlyExtraction, setImageOnlyExtraction] = useState(false)
  const [isTransformingImage, setIsTransformingImage] = useState(false)

  const replacePreview = useCallback((nextPreviewUrl: string) => {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev)
      }
      return nextPreviewUrl
    })
  }, [])

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
    setSourceImageFile(null)
    setImageInputKey((prev) => prev + 1)
    setImageOnlyExtraction(false)
    replacePreview(event?.imageUrl || "")
    setIsTransformingImage(false)
  }, [event, replacePreview])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const convertBase64ToFile = useCallback((base64: string, mimeType: string, baseName: string): File => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })
    return new File([blob], `${baseName}.${mimeType.split("/").pop() ?? "png"}`, { type: mimeType })
  }, [])

  const transformImageWithDify = useCallback(
    async (file: File): Promise<File | null> => {
      setIsTransformingImage(true)
      try {
        const formData = new FormData()
        formData.append("image", file)
        formData.append("fileName", file.name)

        const response = await fetch("/api/dify/image-generation", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          let errorMessage = "画像の変換に失敗しました"
          try {
            const errorPayload = (await response.json()) as { error?: unknown }
            if (errorPayload && typeof errorPayload.error === "string" && errorPayload.error.trim().length > 0) {
              errorMessage = errorPayload.error
            }
            console.error("Dify image generation API error", errorPayload)
          } catch (parseError) {
            console.error("Failed to parse image generation error response", parseError)
          }
          throw new Error(errorMessage)
        }

        const result: {
          imageBase64: string | null
          imageUrl: string | null
          mimeType: string | null
        } = await response.json()

        if (result.imageBase64) {
          const mimeType = result.mimeType && result.mimeType.trim().length > 0 ? result.mimeType : "image/png"
          const baseName = file.name.replace(/\.[^.]+$/, "-texture")
          return convertBase64ToFile(result.imageBase64, mimeType, baseName)
        }

        if (result.imageUrl) {
          const fetched = await fetch(result.imageUrl)
          if (!fetched.ok) {
            throw new Error("生成画像の取得に失敗しました")
          }
          const blob = await fetched.blob()
          const extension = blob.type.split("/").pop() ?? "png"
          const baseName = file.name.replace(/\.[^.]+$/, "-texture")
          return new File([blob], `${baseName}.${extension}`, { type: blob.type })
        }

        console.error("Dify image generation response did not contain image data", result)
        throw new Error("生成結果に画像がありません")
      } catch (error) {
        console.error(error)
        const userMessage = error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "画像から文字のみを除去する処理に失敗しました。"
        window.alert(`${userMessage}\n元の画像をそのまま使用します。`)
        return null
      } finally {
        setIsTransformingImage(false)
      }
    },
    [convertBase64ToFile],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isTransformingImage) {
      return
    }
    await onSubmit({
      data: {
        ...formData,
        imageUrl: removeImage ? "" : formData.imageUrl,
      },
      imageFile,
      removeImage,
      imageOnlyExtraction,
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting || isTransformingImage) {
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

    let fileToUse: File | null = file

    setSourceImageFile(file)

    if (enableAiImageTools && imageOnlyExtraction) {
      const transformed = await transformImageWithDify(file)
      if (transformed) {
        fileToUse = transformed
      } else {
        setImageOnlyExtraction(false)
      }
    }

    if (fileToUse) {
      setImageFile(fileToUse)
      replacePreview(URL.createObjectURL(fileToUse))
      setRemoveImage(false)
    }
  }

  const handleRemoveImage = () => {
    if (isSubmitting || isTransformingImage) {
      return
    }

    setImageFile(null)
    setSourceImageFile(null)
    replacePreview("")
    setRemoveImage(true)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    setImageInputKey((prev) => prev + 1)
    setIsTransformingImage(false)
    setImageOnlyExtraction(false)
  }

  const handleImageOnlyExtractionChange = useCallback(
    async (checked: boolean) => {
      if (!enableAiImageTools) {
        return
      }

      if (isTransformingImage) {
        return
      }

      setImageOnlyExtraction(checked)

      if (!sourceImageFile) {
        return
      }

      if (checked) {
        const transformed = await transformImageWithDify(sourceImageFile)
        if (transformed) {
          setImageFile(transformed)
          replacePreview(URL.createObjectURL(transformed))
          setRemoveImage(false)
        } else {
          setImageOnlyExtraction(false)
        }
      } else {
        setImageFile(sourceImageFile)
        replacePreview(URL.createObjectURL(sourceImageFile))
        setRemoveImage(false)
      }
    },
    [enableAiImageTools, isTransformingImage, replacePreview, sourceImageFile, transformImageWithDify],
  )

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
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
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
                    onChange={(event) => {
                      void handleImageChange(event)
                    }}
                    disabled={isSubmitting || isTransformingImage}
                  />
                  <span>対応形式: JPEG / PNG / WebP（最大5MB）</span>
                  {isTransformingImage && <span className="text-primary">テクスチャ変換中...</span>}
                </div>
              </div>
              {(previewUrl || formData.imageUrl) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting || isTransformingImage}
                  className="max-w-[160px]"
                >
                  画像を削除
                </Button>
              )}
              {enableAiImageTools && (
                <label className="flex w-full cursor-pointer items-start gap-2 text-sm text-foreground md:max-w-[220px]">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-input accent-primary"
                    checked={imageOnlyExtraction}
                    onChange={(event) => {
                      void handleImageOnlyExtractionChange(event.target.checked)
                    }}
                    disabled={isSubmitting || isTransformingImage}
                  />
                  <span className="leading-tight">
                    イメージのみ抽出する
                    <span className="mt-1 block text-xs text-muted-foreground">
                      文字を除去しテクスチャのみ生成します
                    </span>
                  </span>
                </label>
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
            <Button
              type="submit"
              className="flex-1 min-w-[160px] items-center gap-2"
              disabled={isSubmitting || isTransformingImage}
            >
              <Save className="h-4 w-4" />
              {event ? "更新" : "作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isTransformingImage}
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
