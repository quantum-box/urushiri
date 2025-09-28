import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative grid w-full items-start gap-y-1 rounded-[12px] border px-4 py-4 text-sm leading-relaxed has-[>svg]:grid-cols-[40px_1fr] has-[>svg]:gap-x-3 [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'border-border bg-card text-card-foreground [&>svg]:text-muted-foreground',
        destructive:
          'border-[#f3bcbc] bg-[#fff0f0] text-[#b15252] [&>svg]:text-[#d96f6f] *:data-[slot=alert-description]:text-[#b15252]',
        success:
          'border-[#b9dbb9] bg-[var(--success-bg)] text-[var(--success-foreground)] [&>svg]:text-[var(--success-foreground)]',
        info:
          'border-[#b7d4e0] bg-[var(--info-bg)] text-[var(--info-foreground)] [&>svg]:text-[var(--info-foreground)]',
        warning:
          'border-[#f0dcaa] bg-[var(--warning-bg)] text-[var(--warning-foreground)] [&>svg]:text-[var(--warning-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 grid justify-items-start gap-1 text-sm text-inherit [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
