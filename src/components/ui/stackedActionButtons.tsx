import { cn } from '../../lib/cn'

export type StackedActionButtonVariant = 'primary' | 'outline' | 'danger'

export type StackedActionButtonItem = {
  label: string
  variant?: StackedActionButtonVariant
  disabled?: boolean
  onClick?: () => void
  title?: string
}

const itemVariants: Record<StackedActionButtonVariant, string> = {
  primary:
    'border-accent/25 bg-accent/10 text-accent hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-55',
  outline:
    'border-border bg-white text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55',
  danger:
    'border-red-200 bg-white text-red-700 hover:bg-red-50/80 disabled:cursor-not-allowed disabled:opacity-55',
}

export const StackedActionButtons = ({
  items,
  className,
}: {
  items: StackedActionButtonItem[]
  className?: string
}) => (
  <div className={cn('flex flex-col', className)}>
    {items.map((item, i) => (
      <StackedActionButton key={item.label} item={item} isFirst={i === 0} />
    ))}
  </div>
)

const StackedActionButton = ({
  item,
  isFirst,
}: {
  item: StackedActionButtonItem
  isFirst: boolean
}) => {
  const variant = item.variant ?? 'outline'

  return (
    <button
      type="button"
      disabled={item.disabled}
      title={item.title ?? (item.disabled ? 'Незабаром' : undefined)}
      onClick={item.onClick}
      className={cn(
        'w-full cursor-pointer rounded-lg border px-4 py-3 text-center text-sm font-semibold transition',
        !isFirst && 'mt-2.5',
        itemVariants[variant],
      )}
    >
      {item.label}
    </button>
  )
}
