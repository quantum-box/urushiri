"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, LogOut, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 現在のユーザーを取得
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/signin")
  }

  if (!user) return null

  return (
    <header className="border-b-2 border-honey-yellow/30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-honey-yellow/20 p-2 rounded-2xl">
            <Calendar className="h-7 w-7 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-800">🧸 ゆるしり</h1>
            <p className="text-sm text-amber-600">イベント共有ページ</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 hover:bg-honey-yellow/10 rounded-2xl px-4 py-2">
              <Avatar className="h-9 w-9 border-2 border-honey-yellow/30">
                <AvatarFallback className="bg-honey-yellow/20 text-amber-800 font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-amber-800 font-medium">{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border-honey-yellow/20 rounded-2xl shadow-lg">
            <DropdownMenuItem disabled className="text-amber-700">
              <User className="mr-2 h-4 w-4" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-amber-700 hover:bg-honey-yellow/10">
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
