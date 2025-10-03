"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import type { Event } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Sparkles, X, Save } from "lucide-react"

interface AiFormFieldMapping {
  title?: string
  description?: string
  date?: string
  time?: string
  location?: string
  category?: string
  maxAttendees?: number
  isPublic?: boolean
  imageUrl?: string
}

interface UploadingFile {
  id: string
  fileName: string
  status: "uploading" | "uploaded" | "failed"
}

export interface EventFormSubmission {
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

const categorySynonyms: Record<string, string> = {
  technology: "テクノロジー",
  tech: "テクノロジー",
  it: "テクノロジー",
  software: "テクノロジー",
  developer: "テクノロジー",
  engineering: "テクノロジー",
  ai: "テクノロジー",
  デジタル: "テクノロジー",
  テック: "テクノロジー",
  design: "デザイン",
  designer: "デザイン",
  creative: "デザイン",
  ux: "デザイン",
  ui: "デザイン",
  art: "アート",
  arts: "アート",
  culture: "アート",
  cultural: "アート",
  exhibition: "アート",
  gallery: "アート",
  business: "ビジネス",
  marketing: "ビジネス",
  startup: "ビジネス",
  finance: "ビジネス",
  management: "ビジネス",
  教育: "教育",
  education: "教育",
  learning: "教育",
  study: "教育",
  workshop: "教育",
  lecture: "教育",
  entertainment: "エンターテイメント",
  music: "エンターテイメント",
  movie: "エンターテイメント",
  film: "エンターテイメント",
  game: "エンターテイメント",
  festival: "エンターテイメント",
  sports: "スポーツ",
  sport: "スポーツ",
  fitness: "スポーツ",
  athletic: "スポーツ",
  soccer: "スポーツ",
  baseball: "スポーツ",
  その他: "その他",
  other: "その他",
  others: "その他",
  misc: "その他",
  general: "その他",
}

const tryParseJsonString = (value: string): unknown => {
  const trimmed = value.trim()

  const directCandidate = trimmed.startsWith("{") || trimmed.startsWith("[") ? trimmed : null
  if (directCandidate) {
    try {
      return JSON.parse(directCandidate)
    } catch {
      // ignore
    }
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (codeBlockMatch?.[1]) {
    try {
      return JSON.parse(codeBlockMatch[1])
    } catch {
      // ignore
    }
  }

  return null
}

const sanitizeUrlValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }
  return trimmed
}

const parseBooleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "yes", "公開", "public", "open", "1", "available"].includes(normalized)) {
      return true
    }
    if (["false", "no", "非公開", "private", "closed", "0"].includes(normalized)) {
      return false
    }
  }

  return undefined
}

const parseNumberValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const digits = value.replace(/[^0-9.-]/g, "").trim()
    if (!digits) {
      return undefined
    }
    const parsed = Number.parseFloat(digits)
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

const parseDateValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const normalized = trimmed
    .replace(/年|\//g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/\s+/g, " ")

  const match = normalized.match(/(\d{4})[^0-9]?(\d{1,2})[^0-9]?(\d{1,2})/)
  if (match) {
    const [, year, month, day] = match
    const y = year.padStart(4, "0")
    const m = month.padStart(2, "0")
    const d = day.padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const timestamp = Date.parse(trimmed)
  if (!Number.isNaN(timestamp)) {
    const date = new Date(timestamp)
    const y = date.getFullYear().toString().padStart(4, "0")
    const m = (date.getMonth() + 1).toString().padStart(2, "0")
    const d = date.getDate().toString().padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  return undefined
}

const parseTimeValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) {
      return undefined
    }

    const explicitMatch = trimmed.match(/(午前|午後|am|pm)?\s*(\d{1,2})(?:[:時](\d{1,2}))?/i)
    if (explicitMatch) {
      const period = explicitMatch[1]?.toLowerCase()
      let hour = Number.parseInt(explicitMatch[2] ?? "", 10)
      const minute = explicitMatch[3] ? Number.parseInt(explicitMatch[3], 10) : 0

      if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
        if (period) {
          const isPm = /午後|pm/.test(period)
          const isAm = /午前|am/.test(period)
          if (isPm && hour < 12) {
            hour += 12
          }
          if (isAm && hour === 12) {
            hour = 0
          }
        }

        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        }
      }
    }

    const simpleMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/)
    if (simpleMatch) {
      const hour = Number.parseInt(simpleMatch[1], 10)
      const minute = Number.parseInt(simpleMatch[2], 10)
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      }
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const totalMinutes = Math.max(0, Math.min(23 * 60 + 59, Math.round(value)))
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  return undefined
}

const normalizeCategoryValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  if (categories.includes(trimmed)) {
    return trimmed
  }

  const lower = trimmed.toLowerCase()
  if (categorySynonyms[lower]) {
    return categorySynonyms[lower]
  }

  const normalized = lower.replace(/[、・|]/g, " ")

  for (const [keyword, mappedCategory] of Object.entries(categorySynonyms)) {
    if (!keyword) {
      continue
    }
    if (normalized.includes(keyword)) {
      return mappedCategory
    }
  }

  const lowerTrimmed = lower
  const japaneseHeuristics: Array<{ keywords: string[]; category: string }> = [
    { keywords: ["テクノロジー", "テック", "it", "ai"], category: "テクノロジー" },
    { keywords: ["アート", "芸術", "クリエイ", "デザイン"], category: "アート" },
    { keywords: ["ビジネス", "起業", "スタートアップ", "マーケ"], category: "ビジネス" },
    { keywords: ["教育", "勉強", "学習", "セミナー"], category: "教育" },
    { keywords: ["エンタ", "音楽", "ライブ", "映画", "フェス"], category: "エンターテイメント" },
    { keywords: ["スポーツ", "運動", "フィットネス", "マラソン"], category: "スポーツ" },
  ]

  for (const { keywords, category } of japaneseHeuristics) {
    if (keywords.some((keyword) => lowerTrimmed.includes(keyword.toLowerCase()))) {
      return category
    }
  }

  return "その他"
}

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
  const [aiConversationId, setAiConversationId] = useState<string | null>(null)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [aiInput, setAiInput] = useState("")
  const [isSendingAiMessage, setIsSendingAiMessage] = useState(false)
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const formRef = useRef<HTMLFormElement>(null)

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
    setAiConversationId(null)
    setAiErrorMessage(null)
    setAiSuccessMessage(null)
    setAiInput("")
    setIsAiDialogOpen(false)
    setUploadingFiles([])
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

  const toggleAiDialog = useCallback(() => {
    setIsAiDialogOpen((prev) => !prev)
  }, [])

  const markFileUploading = (fileId: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, ...updates } : file)))
  }

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleAutoFill = (payload: AiFormFieldMapping) => {
    setFormData((prev) => ({
      ...prev,
      title: payload.title ?? prev.title,
      description: payload.description ?? prev.description,
      date: payload.date ?? prev.date,
      time: payload.time ?? prev.time,
      location: payload.location ?? prev.location,
      category: payload.category ?? prev.category,
      maxAttendees: typeof payload.maxAttendees === "number" ? payload.maxAttendees : prev.maxAttendees,
      isPublic: typeof payload.isPublic === "boolean" ? payload.isPublic : prev.isPublic,
      imageUrl: payload.imageUrl ?? prev.imageUrl,
    }))
  }

const parseFormFieldsFromAiResponse = (raw: unknown): AiFormFieldMapping | null => {
  if (!raw) {
    return null
  }

  if (typeof raw === "string") {
    const parsed = tryParseJsonString(raw)
    if (!parsed) {
      return null
    }
    return parseFormFieldsFromAiResponse(parsed)
  }

  if (typeof raw !== "object") {
    return null
  }

  if (Array.isArray(raw)) {
    const merged: AiFormFieldMapping = {}
    for (const item of raw) {
      const mapped = parseFormFieldsFromAiResponse(item)
      if (mapped) {
        Object.assign(merged, mapped)
      }
    }
    return Object.keys(merged).length > 0 ? merged : null
  }

  const record = raw as Record<string, unknown>
  const mapping: AiFormFieldMapping = {}

  const titleValue = typeof record.title === "string" ? record.title.trim() : undefined
  if (titleValue) {
    mapping.title = titleValue
  }

  const descriptionValue = typeof record.description === "string" ? record.description.trim() : undefined
  if (descriptionValue) {
    mapping.description = descriptionValue
  }

  const dateValue = parseDateValue(record.date ?? record.eventDate ?? record.startDate)
  if (dateValue) {
    mapping.date = dateValue
  }

  const timeValue = parseTimeValue(record.time ?? record.eventTime ?? record.startTime)
  if (timeValue) {
    mapping.time = timeValue
  }

  const locationValue = typeof record.location === "string" ? record.location.trim() : undefined
  if (locationValue) {
    mapping.location = locationValue
  }

  const categoryValue = normalizeCategoryValue(record.category ?? record.type ?? record.topic)
  if (categoryValue) {
    mapping.category = categoryValue
  }

  const maxAttendeesValue = parseNumberValue(record.maxAttendees ?? record.capacity ?? record.maxParticipants)
  if (typeof maxAttendeesValue === "number") {
    mapping.maxAttendees = Math.max(1, Math.round(maxAttendeesValue))
  }

  const isPublicValue = parseBooleanValue(record.isPublic ?? record.visibility ?? record.public)
  if (typeof isPublicValue === "boolean") {
    mapping.isPublic = isPublicValue
  }

  const imageUrlValue = sanitizeUrlValue(record.imageUrl ?? record.coverImageUrl ?? record.bannerUrl)
  if (imageUrlValue) {
    mapping.imageUrl = imageUrlValue
  }

  const hasAnyField = Object.keys(mapping).length > 0
  return hasAnyField ? mapping : null
}

  const handleAiResponse = useCallback(
    (response: Record<string, unknown>) => {
      const fieldCandidates: unknown[] = []

      const data = response.data
      if (data && typeof data === "object") {
        const dataRecord = data as Record<string, unknown>
        fieldCandidates.push(
          dataRecord.formFields,
          dataRecord.form_fields,
          dataRecord.structuredData,
          dataRecord.structured_data,
          dataRecord.outputs,
          dataRecord
        )
      }

      if (typeof response.answer === "string") {
        fieldCandidates.push(response.answer)
      }

      const outputs = (response as Record<string, unknown>).outputs
      if (outputs) {
        fieldCandidates.push(outputs)
      }

      const messageContent = (response as Record<string, unknown>).message
      if (messageContent && typeof messageContent === "object") {
        const contentItems = (messageContent as Record<string, unknown>).content
        if (Array.isArray(contentItems)) {
          fieldCandidates.push(contentItems)
        }
      }

      let applied = false
      for (const candidate of fieldCandidates) {
        const fields = parseFormFieldsFromAiResponse(candidate)
        if (fields) {
          handleAutoFill(fields)
          applied = true
        }
      }
      return applied
    },
    [handleAutoFill],
  )

  const buildFormSnapshot = (): Record<string, unknown> => {
    return {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      category: formData.category,
      maxAttendees: formData.maxAttendees,
      isPublic: formData.isPublic,
      imageUrl: formData.imageUrl,
    }
  }

  interface RequestAutofillOptions {
    files?: unknown[]
    timeoutMs?: number
    resetConversation?: boolean
  }

  const requestAiAutofill = useCallback(
    async (query: string, options: RequestAutofillOptions = {}) => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        return false
      }

      if (options.resetConversation) {
        setAiConversationId(null)
      }

      setIsSendingAiMessage(true)
      setAiErrorMessage(null)
      setAiSuccessMessage(null)

      try {
        const bodyPayload: Record<string, unknown> = {
          query: trimmedQuery,
          responseMode: "blocking",
          inputs: {
            currentFields: buildFormSnapshot(),
          },
          timeoutMs: options.timeoutMs ?? 75_000,
        }

        const conversationId = options.resetConversation ? null : aiConversationId
        if (conversationId) {
          bodyPayload.conversationId = conversationId
        }

        if (options.files) {
          bodyPayload.files = options.files
        }

        const response = await fetch("/api/dify/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        })

        if (!response.ok) {
          const errorPayload = (await response.json()) as { error?: string }
          throw new Error(errorPayload.error || "Failed to call AI agent")
        }

        const json = (await response.json()) as Record<string, unknown>
        const nextConversationId = typeof json.conversation_id === "string" ? json.conversation_id : null
        if (nextConversationId) {
          setAiConversationId(nextConversationId)
        }

        const applied = handleAiResponse(json)
        if (applied) {
          setAiSuccessMessage("フォームに自動入力しました。内容をご確認ください。")
        } else {
          setAiSuccessMessage("AIからの応答は受け取りましたが、フォームに適用できる項目が見つかりませんでした。")
        }

        return applied
      } catch (error) {
        console.error("Failed to run AI autofill", error)
        setAiErrorMessage(error instanceof Error ? error.message : "AI連携中に予期せぬエラーが発生しました。")
        return false
      } finally {
        setIsSendingAiMessage(false)
      }
    },
    [aiConversationId, buildFormSnapshot, handleAiResponse],
  )

  const handleAutoFillFromInput = async () => {
    if (isSendingAiMessage) {
      return
    }

    const source = aiInput.trim()
    if (!source) {
      setAiErrorMessage("テキストを入力してください。")
      setAiSuccessMessage(null)
      return
    }

    const prompt = `次のテキストを解析し、イベントフォームに必要な情報をできるだけ詳しく抽出してください。description には日付・開始時刻・場所・参加条件・連絡先など重要な要素をすべて日本語でまとめ、他フィールドと重複しても構いません。結果は以下のキーを持つ JSON オブジェクトで返してください: {\n  "title": string,\n  "description": string,\n  "date": "YYYY-MM-DD",\n  "time": "HH:MM",\n  "location": string,\n  "category": string,\n  "maxAttendees": number,\n  "isPublic": boolean,\n  "imageUrl": string\n}.\n入力テキスト:\n\n${source}`
    await requestAiAutofill(prompt, { resetConversation: true })
  }

  const handleFileUploadToAi = async (file: File) => {
    const fileId = crypto.randomUUID()
    setUploadingFiles((prev) => [...prev, { id: fileId, fileName: file.name, status: "uploading" }])

    try {
      const formDataPayload = new FormData()
      formDataPayload.append("file", file)

      const uploadResponse = await fetch("/api/dify/files", {
        method: "POST",
        body: formDataPayload,
      })

      if (!uploadResponse.ok) {
        const errorPayload = (await uploadResponse.json()) as { error?: string }
        throw new Error(errorPayload.error || "Failed to upload file to AI agent")
      }

      const uploadJson = (await uploadResponse.json()) as { file: Record<string, unknown> }
      markFileUploading(fileId, { status: "uploaded" })
      setTimeout(() => {
        removeUploadingFile(fileId)
      }, 1500)

      const filePayload = uploadJson.file
      const safeFilePayload = Array.isArray(filePayload) ? filePayload : [filePayload]

      const summaryPrompt = `アップロードされた資料からイベント情報をできるだけ詳細に抽出してください。description には開催日時・会場・参加条件・主催者や特記事項など重要な情報をすべて含め、他のフィールドと内容が重なっても構いません。以下のキーを持つ JSON オブジェクトを返してください: {"title": string, "description": string, "date": "YYYY-MM-DD", "time": "HH:MM", "location": string, "category": string, "maxAttendees": number, "isPublic": boolean, "imageUrl": string}.`

      await requestAiAutofill(summaryPrompt, {
        files: safeFilePayload,
        timeoutMs: 90_000,
        resetConversation: true,
      })
    } catch (error) {
      console.error("Failed to upload file for AI processing", error)
      markFileUploading(fileId, { status: "failed" })
      setAiErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred during file upload.")
    }
  }

  const handleAiFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    Array.from(files).forEach((file) => {
      void handleFileUploadToAi(file)
    })

    event.target.value = ""
  }

  const aiPrimaryButtonLabel = useMemo(() => {
    if (!isAiDialogOpen) {
      return "AIアシストを開く"
    }
    return "AIアシストを閉じる"
  }, [isAiDialogOpen])

  return (
    <Card className="mx-auto w-full max-w-3xl border border-border/80 bg-white/95 shadow-none">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-4">
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          {event ? "イベントを編集" : "新しいイベントを作成"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 w-9 rounded-full text-muted-foreground">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-6 sm:px-6 sm:py-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
            <div className="space-y-3">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="イベントの詳細を入力"
                rows={4}
                disabled={isSubmitting}
                className="min-h-[140px]"
              />
              <Button
                type="button"
                variant="ai"
                className="w-full justify-center gap-2 md:hidden"
                onClick={toggleAiDialog}
              >
                <Sparkles className="h-4 w-4" />
                {aiPrimaryButtonLabel}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventImage" className="text-foreground">
              カバー画像（任意）
            </Label>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
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
                <div className="flex w-full flex-col gap-2 text-xs text-muted-foreground sm:w-auto">
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
                  className="w-full max-w-[240px] sm:max-w-[160px]"
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

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap">
            <Button
              type="submit"
              className="w-full items-center gap-2 sm:flex-1"
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
              className="w-full sm:flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="ai"
              className="w-full sm:flex-1"
              onClick={toggleAiDialog}
            >
              <Sparkles className="h-4 w-4" />
              {aiPrimaryButtonLabel}
            </Button>
          </div>
        </form>

        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AIアシスト</DialogTitle>
              <DialogDescription>
                テキストを貼り付けるか資料を添付すると、AIがイベントフォームを自動で埋めます。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiAutofillInput" className="text-sm font-medium text-foreground">
                  イベント情報（テキスト貼り付け）
                </Label>
                <Textarea
                  id="aiAutofillInput"
                  value={aiInput}
                  onChange={(event) => setAiInput(event.target.value)}
                  placeholder="イベント概要、日付、場所、参加条件などを貼り付けてください。AIが内容を解析してフォームに反映します。"
                  rows={6}
                  disabled={isSendingAiMessage}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ai"
                  className="w-full sm:w-auto"
                  disabled={isSendingAiMessage}
                  onClick={() => {
                    void handleAutoFillFromInput()
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  貼り付け内容で自動入力
                </Button>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-white sm:text-sm">
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,image/*,text/plain"
                    onChange={handleAiFileInputChange}
                    multiple
                  />
                  ファイルを添付して自動入力
                </label>
              </div>

              {isSendingAiMessage && (
                <div className="ai-border-animated rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 p-[2px]">
                  <div className="flex items-center gap-3 rounded-[calc(var(--radius)-4px)] bg-white/96 px-4 py-3 text-sm text-muted-foreground shadow-[0_4px_20px_-12px_rgba(124,58,237,0.5)]">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium text-foreground">AIがフォームへの自動入力を準備しています...</span>
                  </div>
                </div>
              )}

              {uploadingFiles.length > 0 && (
                <div className="rounded-md border border-dashed border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">ファイル処理の状況</div>
                  <ul className="mt-2 space-y-1">
                    {uploadingFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between gap-2">
                        <span className="truncate text-foreground">{file.fileName}</span>
                        <span>
                          {file.status === "uploading"
                            ? "アップロード中"
                            : file.status === "uploaded"
                              ? "解析中"
                              : "失敗"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuccessMessage && (
                <Alert variant="success">
                  <AlertDescription>{aiSuccessMessage}</AlertDescription>
                </Alert>
              )}

              {aiErrorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{aiErrorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAiDialogOpen(false)}>
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
