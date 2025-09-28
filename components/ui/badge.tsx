import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium tracking-tight w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none [&>svg:not([class*="size-"])]:size-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]',
        neutral: 'border-border bg-muted text-foreground/80',
        outline: 'border-border bg-transparent text-foreground',
        subtle: 'border-transparent bg-[color:var(--info-bg)] text-[color:var(--info-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const Badge = React.forwardRef<
  React.ElementRef<"span">,
  React.ComponentPropsWithoutRef<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge, badgeVariants }
