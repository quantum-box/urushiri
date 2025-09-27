import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-32 w-full rounded-[6px] border border-input bg-white px-3 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm',
        'selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
