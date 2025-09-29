# ゆるしり

ゆるしりは、イベント情報をゆるく共有し合うための Next.js 製アプリケーションです。Vercel 上でホスティングしており、Supabase をバックエンドに利用しています。八戸市令和７年度 いきいきとしたデジタル社会推進事業 ハッカソンから生まれたプロダクトで、イベントの詳細は [https://8nohe-ikiikidx.jp/ideahack/](https://8nohe-ikiikidx.jp/ideahack/) を参照してください。制作に関わった参加者全員を著作者として扱います。

## デプロイ

- 本番環境: [https://yurusiri.vercel.app/](https://yurusiri.vercel.app/)
- v0.app プロジェクト: [https://v0.app/chat/projects/XBUUue51MUx](https://v0.app/chat/projects/XBUUue51MUx)

## セットアップ

1. `mise install`
2. `mise run install`
3. `.env.local` に Supabase 関連の環境変数を設定

## 主なコマンド

- `mise run dev`: 開発サーバーを起動
- `mise run build`: 本番ビルドを生成
- `mise run start`: 本番ビルドをローカルで確認
- `mise run lint`: Lint チェックを実行

## ライセンス

このリポジトリは MIT License のもとで公開されています。詳細は `LICENSE` を参照してください。
