import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[#f091a6]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-[#c56161]",
        outline:
          "border border-border bg-white text-foreground hover:border-[color:var(--secondary)] hover:text-[color:var(--secondary-foreground)] focus-visible:ring-offset-2",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#95c9de]",
        ghost: "text-foreground hover:bg-[color:var(--info-bg)] hover:text-[color:var(--info-foreground)]",
        link: "text-primary underline-offset-4 hover:underline",
        ai: "relative overflow-hidden border border-primary/30 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white shadow-[0_12px_32px_-12px_rgba(124,58,237,0.65)] transition-[transform,box-shadow] before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.35)_100%)] before:pointer-events-none before:opacity-0 before:transition-opacity hover:translate-y-[-1px] hover:shadow-[0_16px_36px_-12px_rgba(14,165,233,0.6)] hover:before:opacity-100 active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-3 has-[>svg]:px-5",
        sm: "h-9 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-7 has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef<
  React.ElementRef<"button">,
  React.ComponentPropsWithoutRef<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
