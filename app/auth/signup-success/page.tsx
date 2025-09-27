import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">アカウント作成完了</CardTitle>
          </div>
          <CardDescription>メールアドレスの確認が必要です</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            登録したメールアドレスに確認メールを送信しました。
            メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <Button asChild className="w-full">
            <Link href="/signin">サインインページに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
