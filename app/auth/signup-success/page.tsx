import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border border-border/80 bg-white/95 shadow-none">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-foreground">アカウント作成完了</CardTitle>
            <CardDescription className="text-muted-foreground">
              メールアドレスを確認してください。
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            登録したメールアドレスに確認メールを送信しました。
            メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/signin">サインインページに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
