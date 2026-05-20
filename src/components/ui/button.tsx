import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-55',
  secondary:
    'border-border bg-white text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink',
} as const

export type ButtonVariant = keyof typeof variants

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) => (
  <button
    type={type}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center rounded-sm border px-4 py-2.5 text-sm font-semibold transition-[background,border-color,opacity]',
      variants[variant],
      className,
    )}
    {...props}
  />
)
