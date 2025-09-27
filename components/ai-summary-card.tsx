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
        "w-full rounded-[12px] border border-primary/30 bg-accent/40 px-5 py-5",
        className,
      )}
    >
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/90">
        <div className="inline-flex h-7 w-fit items-center gap-1 rounded-full bg-white/80 px-3 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-3 w-3" />
          AI生成
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
      </div>
    </div>
  )
}
