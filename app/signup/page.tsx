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
import { Loader2, Calendar } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-soft-cream via-honey-yellow/20 to-soft-cream flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?key=7x9vt')] opacity-5"></div>
      <Card className="w-full max-w-md bg-white/95 backdrop-blur border-2 border-honey-yellow/30 rounded-3xl shadow-2xl relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-honey-yellow/20 p-3 rounded-2xl">
              <Calendar className="h-8 w-8 text-amber-700" />
            </div>
            <div className="text-left">
              <CardTitle className="text-3xl font-bold text-amber-800">🧸 ゆるしり</CardTitle>
              <p className="text-amber-600 text-sm">イベント共有ページ</p>
            </div>
          </div>
          <CardDescription className="text-amber-700 text-base">
            新しいアカウントを作成して
            <br />
            楽しいイベントライフを始めよう
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-8">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-800 font-semibold">
                📧 メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-800 font-semibold">
                🔐 パスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="6文字以上のパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-amber-800 font-semibold">
                🔒 パスワード確認
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="bg-white border-honey-yellow/30 focus:border-honey-yellow rounded-2xl py-3 text-amber-800"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-8">
            <Button
              type="submit"
              className="w-full bg-honey-yellow hover:bg-honey-yellow/90 text-amber-800 font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />🍯 アカウント作成中...
                </>
              ) : (
                "✨ アカウント作成"
              )}
            </Button>
            <p className="text-sm text-amber-700 text-center bg-honey-yellow/10 p-3 rounded-2xl">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/signin" className="text-amber-800 hover:underline font-semibold">
                🚀 サインイン
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
