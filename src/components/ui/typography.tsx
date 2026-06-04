import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const Muted = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('m-0 text-muted', className)} {...props} />
)

export const ErrorAlert = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      'm-0 rounded-sm border border-red-200 bg-error-surface px-3 py-2.5 text-sm text-error',
      className,
    )}
    {...props}
  />
)

export const Divider = ({ className, ...props }: HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn('my-3.5 h-px border-0 bg-border', className)} {...props} />
)

export const PageContent = ({
  flush,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { flush?: boolean }) => (
  <div
    className={cn('flex flex-col', flush ? 'min-h-0 flex-1 p-0' : 'px-8 pb-10 pt-7', className)}
    {...props}
  />
)

export const PageTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn('m-0 text-[1.75rem] font-bold tracking-[-0.02em] text-ink', className)}
    {...props}
  />
)

export const TabPlaceholder = ({ title }: { title: string }) => (
  <Muted className="py-8 text-center">{title} (незабаром)</Muted>
)
