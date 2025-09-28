import type { AgeGroup, DiscoverySource, OccupationCategory } from "@/types/participant"

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  teens: "10代以下",
  twenties: "20代",
  thirties: "30代",
  forties: "40代",
  fifties: "50代",
  sixtiesPlus: "60代以上",
}

export const OCCUPATION_LABELS: Record<OccupationCategory, string> = {
  student: "学生",
  engineer: "エンジニア",
  designer: "デザイナー",
  planner: "企画・マーケティング",
  manager: "マネジメント",
  other: "その他",
}

export const DISCOVERY_LABELS: Record<DiscoverySource, string> = {
  sns: "SNS",
  search: "インターネット検索",
  friend: "友人・知人の紹介",
  media: "メディア記事・ブログ",
  eventSite: "イベント紹介サイト",
  other: "その他",
}
