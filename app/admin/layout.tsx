import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminNav } from "@/components/admin/admin-nav"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error(error)
  }

  if (!user) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b border-border/80 bg-white/80">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">管理コンソール</h1>
            <p className="text-xs text-muted-foreground">イベント運営に必要な情報を確認できます。</p>
          </div>
          <AdminNav />
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
    </div>
  )
}
