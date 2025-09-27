"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
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
    <header className="border-b-2 border-yellow-200 bg-gradient-to-r from-amber-50 to-yellow-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🍯</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
              HoneyMeet
            </h1>
            <p className="text-sm text-amber-600 font-medium">イベント共有プラットフォーム</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 hover:bg-yellow-100 rounded-full px-4 py-2 transition-all duration-200"
            >
              <Avatar className="h-9 w-9 ring-2 ring-yellow-300">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-amber-700 font-medium">{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-yellow-200 shadow-xl rounded-xl">
            <DropdownMenuItem disabled className="text-amber-700">
              <User className="mr-3 h-4 w-4 text-yellow-500" />
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-amber-700 hover:bg-yellow-50 focus:bg-yellow-50">
              <LogOut className="mr-3 h-4 w-4 text-yellow-500" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
