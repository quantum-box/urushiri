export type AgeGroup = "teens" | "twenties" | "thirties" | "forties" | "fifties" | "sixtiesPlus"

export type OccupationCategory = "student" | "engineer" | "designer" | "planner" | "manager" | "other"

export type DiscoverySource = "sns" | "search" | "friend" | "media" | "eventSite" | "other"

export interface EventParticipant {
  id: string
  ageGroup: AgeGroup
  occupation: OccupationCategory
  discovery: DiscoverySource
  sharedEventTitles: string[]
  other?: string
}
