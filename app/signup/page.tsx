"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password || !confirmPassword) {
      setError("すべての項目を入力してください")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const getRedirectUrl = () => {
        if (process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL) {
          return process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
        }

        // 本番環境では yurusiri.vercel.app または現在のオリジンを使用
        const origin = window.location.origin
        if (origin.includes("yurusiri.vercel.app") || origin.includes("localhost")) {
          return `${origin}/`
        }

        // フォールバック
        return "https://yurusiri.vercel.app/"
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (error) {
        setError("アカウント作成に失敗しました。入力内容を確認してください。")
      } else {
        router.push("/auth/signup-success")
      }
    } catch (err) {
      setError("予期しないエラーが発生しました。")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-200/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-amber-200/10 rounded-full blur-2xl" />
      </div>

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-yellow-200 rounded-3xl relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🍯</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 bg-clip-text text-transparent">
              ゆるしり
            </CardTitle>
          </div>
          <CardDescription className="text-amber-600 text-lg font-medium">
            新しいアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-amber-700 font-semibold">
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-amber-700 font-semibold">
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="6文字以上のパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-amber-700 font-semibold">
                パスワード確認
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl h-12"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 px-8 pb-8">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  アカウント作成中...
                </>
              ) : (
                "アカウント作成"
              )}
            </Button>
            <p className="text-amber-600 text-center font-medium">
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/signin"
                className="text-yellow-600 hover:text-yellow-700 font-semibold hover:underline transition-colors"
              >
                サインイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
