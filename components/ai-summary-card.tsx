import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface AiSummaryCardProps {
  summary: string
  className?: string
}

export function AiSummaryCard({ summary, className }: AiSummaryCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-primary/30 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 px-4 py-4 text-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2 text-sm leading-snug text-foreground">
        <div className="flex h-6 items-center gap-1 rounded-full bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-wide text-primary/80">
          <Sparkles className="h-3 w-3" />
          AI生成
        </div>
        <p className="text-[13px] leading-snug text-foreground/90">{summary}</p>
      </div>
    </div>
  )
}
