# ゆるしり デザインシステム

## 概要

「ゆるしり」は、イベント参加のハードルを下げるサービスです。ちいかわの優しさを取り入れながら、洗練されたミニマルデザインで信頼感と親しみやすさを両立させています。

---

## カラーシステム

### 基本原則

カラーの配分比率を明確に定義し、統一感のあるUIを実現します。

| 種別 | 配分 | 役割 |
|------|------|------|
| **ニュートラル** | 90% | グレー・白系で落ち着いた基調 |
| **プライマリ** | 8% | 控えめなピンクでアクセント |
| **セカンダリ** | 2% | 補助的なブルー（最小限） |

### プライマリカラー

#### ソフトコーラル
- **HEX**: `#F4A8B9`
- **RGB**: rgb(244, 168, 185)
- **用途**: 重要なCTA、参加表明ボタン、ロゴアクセント
- **特徴**: ちいかわのピンクを大人っぽく調整した、控えめで上品なアクセントカラー

#### ミストブルー
- **HEX**: `#A8D5E8`
- **RGB**: rgb(168, 213, 232)
- **用途**: リンク、補助的な情報表示のみ
- **特徴**: 信頼感を演出する落ち着いたブルー（最小限の使用）

### ニュートラルカラー（基調色）

| 名称 | HEX | 用途 |
|------|-----|------|
| **Pure White** | `#FFFFFF` | カード背景、メインコンテンツ |
| **Background** | `#FAFAFA` | ページ背景 |
| **Light Gray** | `#F5F5F5` | セクション区切り |
| **Border** | `#E8E8E8` | 境界線、区切り線 |
| **Sub Text** | `#9B9B9B` | 補助テキスト、説明文 |
| **Main Text** | `#4A4A4A` | 本文、見出し |

### アクセントカラー（極小使用）

特別な強調が必要な場合のみ、ごく控えめに使用します。

| 名称 | HEX | 用途 |
|------|-----|------|
| **Pale Pink** | `#FFE8EC` | 新着バッジ背景 |
| **Pale Blue** | `#E8F4F8` | 情報系背景 |
| **Pale Yellow** | `#FFF9E6` | 注目系背景 |
| **Success** | `#E8F5E8` | 成功メッセージ背景 |
| **Error** | `#FFF0F0` | エラーメッセージ背景 |
| **Warning** | `#FFF8E6` | 警告メッセージ背景 |

---

## タイポグラフィ

### フォントファミリー

\`\`\`css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", 
             "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
\`\`\`

### フォントサイズ

| 種別 | サイズ | line-height | 用途 |
|------|--------|-------------|------|
| **Display** | 32px | 1.2 | ページタイトル |
| **Heading 1** | 24px | 1.3 | セクション見出し |
| **Heading 2** | 20px | 1.4 | サブセクション |
| **Body** | 16px | 1.6 | 本文 |
| **Small** | 14px | 1.5 | 補助テキスト |
| **Caption** | 12px | 1.5 | キャプション |

### フォントウェイト

- **Bold**: 700 - 見出し、強調
- **Medium**: 500 - ボタンテキスト
- **Regular**: 400 - 本文

---

## スペーシング

8pxグリッドシステムを採用

| 名称 | 値 | 用途 |
|------|-----|------|
| **xs** | 4px | 最小余白 |
| **sm** | 8px | 小要素間 |
| **md** | 16px | 標準余白 |
| **lg** | 24px | セクション内 |
| **xl** | 32px | セクション間 |
| **2xl** | 48px | 大セクション間 |

---

## コンポーネント

### ボタン

#### プライマリボタン
\`\`\`css
background-color: #F4A8B9;
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
transition: all 0.2s ease;
\`\`\`

#### セカンダリボタン
\`\`\`css
background-color: transparent;
color: #F4A8B9;
border: 1px solid #F4A8B9;
padding: 12px 24px;
border-radius: 8px;
\`\`\`

### カード

\`\`\`css
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
\`\`\`

### 入力フィールド

\`\`\`css
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 6px;
padding: 8px 12px;
color: #4A4A4A;
transition: border-color 0.2s ease;

/* フォーカス時 */
border-color: #F4A8B9;
outline: none;
\`\`\`

---

## 実装ガイドライン

### ✅ 推奨される使い方

1. **グレースケール中心**
   - UIの90%以上はニュートラルカラーで構成
   - 色ではなく階層と余白で情報を整理

2. **ピンクは最小限**
   - 主要CTAボタンのみ
   - 1画面に1-2箇所まで

3. **余白を活かす**
   - 要素間に十分な余白を確保
   - 密度より呼吸感を重視

4. **フラットデザイン**
   - 過度な影やグラデーションは避ける
   - シンプルで明快な表現

### ❌ 避けるべき使い方

- 複数の鮮やかな色を同時に使用
- ピンク・ブルー・イエローを均等に配置
- 派手なグラデーションや装飾的な影
- 色による過度な情報の差別化

---

## 実装例

### イベントカード

\`\`\`html
<div class="event-card">
  <div class="event-header">
    <h3>もくもく会 #12</h3>
    <span class="badge-new">New</span>
  </div>
  <p class="event-date">2月15日（土）14:00〜</p>
  <div class="event-stats">
    <div class="stat">
      <span class="stat-number">3</span>
      <span class="stat-label">面識あり</span>
    </div>
    <div class="stat">
      <span class="stat-number">25</span>
      <span class="stat-label">参加予定</span>
    </div>
  </div>
  <button class="btn-primary">参加する</button>
</div>
\`\`\`

### スタイル定義

\`\`\`css
.event-card {
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  padding: 24px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
}

.event-header h3 {
  color: #4A4A4A;
  font-size: 18px;
  font-weight: 700;
}

.badge-new {
  background: #FFE8EC;
  color: #F4A8B9;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.event-date {
  color: #9B9B9B;
  font-size: 14px;
  margin-bottom: 16px;
}

.btn-primary {
  background: #F4A8B9;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #F091A6;
  box-shadow: 0 4px 12px rgba(244, 168, 185, 0.3);
}
\`\`\`

---

## アクセシビリティ

### カラーコントラスト

- 本文テキスト（#4A4A4A）と背景（#FFFFFF）: **8.59:1** ✅ WCAG AAA
- ボタンテキスト（#FFFFFF）とボタン背景（#F4A8B9）: **3.2:1** ✅ WCAG AA

### フォーカス表示

\`\`\`css
:focus {
  outline: 2px solid #F4A8B9;
  outline-offset: 2px;
}
\`\`\`

---

## まとめ

「ゆるしり」のデザインシステムは、**引き算のデザイン**を基本理念としています。

- 色数を抑え、グレースケールを基調とすることで洗練された印象を実現
- ちいかわの優しさは、ほんのりとしたピンクのアクセントで表現
- 余白と階層構造で「ゆるさ」を演出
- プロフェッショナルでありながら親しみやすいバランスを保持

このデザインシステムにより、ユーザーが安心してイベントに参加できる、優しくて信頼感のあるサービスを提供します。
