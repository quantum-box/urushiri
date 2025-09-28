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
        "relative w-full overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15 to-cyan-500/15 px-6 py-6",
        className,
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: shimmerKeyframes }} />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        style={{ animation: "ai-summary-shimmer 1.8s linear infinite" }}
      />
      <div className="relative text-center text-sm font-medium text-white/70">
        AIインサイトを生成しています...
      </div>
    </div>
  )
}
