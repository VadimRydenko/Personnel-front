import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <section
    className={cn(
      'rounded-lg border border-border bg-surface p-5 shadow-card md:px-[22px] md:py-5',
      className,
    )}
    {...props}
  />
)

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn('m-0 mb-1.5 text-2xl font-bold tracking-[-0.02em] text-ink', className)}
    {...props}
  />
)

export const CardHeading = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('m-0 mb-2 text-lg font-semibold text-ink', className)} {...props} />
)
