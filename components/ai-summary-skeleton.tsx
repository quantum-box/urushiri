import { cn } from "@/lib/utils"

const shimmerKeyframes = `
@keyframes ai-summary-shimmer {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
`

interface AiSummarySkeletonProps {
  className?: string
}

export function AiSummarySkeleton({ className }: AiSummarySkeletonProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[12px] border border-primary/25 bg-accent/40 px-5 py-5 text-sm text-muted-foreground",
        className,
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{ animation: "ai-summary-shimmer 1.8s linear infinite" }}
      />
      <div className="relative text-center font-medium text-foreground/70">
        AIインサイトを生成しています...
      </div>
    </div>
  )
}
