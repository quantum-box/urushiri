"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { EventForm, type EventFormSubmission } from "@/components/event-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EventCreateClientProps {
  enableAiImageTools?: boolean
}

export function EventCreateClient({ enableAiImageTools = false }: EventCreateClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCreate = async ({ data: eventData, imageFile }: EventFormSubmission) => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    let imageUrlToSave = eventData.imageUrl?.trim() ?? ""

    try {
      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg"
        const filePath = `events/${crypto.randomUUID()}.${extension}`
        const uploadResult = await supabase.storage
          .from("event-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: true,
          })

        if (uploadResult.error) {
          throw uploadResult.error
        }

        const { data: publicUrlData } = supabase.storage.from("event-images").getPublicUrl(filePath)

        if (!publicUrlData?.publicUrl) {
          throw new Error("Failed to resolve uploaded image URL")
        }

        imageUrlToSave = publicUrlData.publicUrl
      }

      const insertResult = await supabase
        .from("events")
        .insert({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          category: eventData.category,
          max_attendees: eventData.maxAttendees,
          current_attendees: 0,
          is_public: eventData.isPublic,
          image_url: imageUrlToSave ? imageUrlToSave : null,
        })
        .select("id")
        .single()

      if (insertResult.error) {
        throw insertResult.error
      }

      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error("Failed to create event", error)
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "イベントの作成に失敗しました。入力内容を確認して再度お試しください。"
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">新しいイベントを作成</h1>
        <p className="text-sm text-muted-foreground">
          イベントの基本情報と参加条件を入力し、保存すると一覧に追加されます。
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <EventForm
        onSubmit={handleCreate}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
        enableAiImageTools={enableAiImageTools}
      />
    </div>
  )
}
