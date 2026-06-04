import { cn } from '../../lib/cn'

export const userDirectoryRowClass = (selected: boolean, blocked: boolean) =>
  cn(
    'w-full cursor-pointer rounded-sm border border-border bg-slate-50 px-3.5 py-3 text-left text-ink transition-[border-color,background,box-shadow] hover:border-accent/45 hover:bg-accent/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    selected && 'border-accent/75 bg-accent/10 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]',
    blocked && 'border-error/35 bg-error/[0.05] hover:border-error/50 hover:bg-error/[0.08]',
    blocked && selected && 'border-error/60 bg-error/10 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]',
  )
