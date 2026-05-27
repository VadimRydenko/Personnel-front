import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '../../../lib/cn'
import type { TreeNode } from '../state/tree'
import { matchesQuery } from '../state/tree'

export const AccNode = ({
  node,
  depth,
  expanded,
  onToggle,
  selectedCode,
  onSelect,
  query,
}: {
  node: TreeNode
  depth: number
  expanded: Set<number>
  onToggle: (code: number) => void
  selectedCode: number | null
  onSelect: (code: number | null) => void
  query: string
}) => {
  const hasChildren = node.children.length > 0
  const isExpanded = expanded.has(node.code)
  const isActive = selectedCode === node.code
  const isVisible = !query || matchesQuery(node, query)

  if (!isVisible) return null

  const indentOffsetPx = depth * 16

  return (
    <li className="group">
      <div className="relative">
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 rounded-sm',
            isActive ? 'bg-slate-100' : 'bg-transparent',
          )}
          style={{
            left: -indentOffsetPx,
          }}
        />

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink disabled:cursor-default disabled:opacity-60"
            disabled={!hasChildren}
            aria-label={
              hasChildren ? (isExpanded ? 'Згорнути' : 'Розгорнути') : 'Немає підпідрозділів'
            }
            onClick={() => {
              if (!hasChildren) return

              onToggle(node.code)
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown size={16} strokeWidth={2} aria-hidden />
              ) : (
                <ChevronRight size={16} strokeWidth={2} aria-hidden />
              )
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            )}
          </button>

          <button
            type="button"
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between bg-transparent py-2 text-left"
            onClick={() => onSelect(node.code)}
            title={node.name || `#${node.code}`}
          >
            <span className="inline-flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="inline-flex shrink-0 items-center justify-center text-slate-900"
                aria-hidden
              >
                {depth === 0 ? (
                  <FolderOpen size={18} strokeWidth={1.75} aria-hidden />
                ) : (
                  <Folder size={18} strokeWidth={1.75} aria-hidden />
                )}
              </span>
              <span className="truncate text-base font-semibold text-ink">
                {node.name || `#${node.code}`}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2.5">
              <span className="whitespace-nowrap text-[0.95rem] text-muted">
                {node.unitType?.val ?? ''}
              </span>
              <span className="whitespace-nowrap text-[0.95rem] font-bold text-muted">
                ({node.children.length})
              </span>
            </span>
          </button>
        </div>
      </div>

      {hasChildren && isExpanded ? (
        <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 pl-4">
          {node.children.map((c) => (
            <AccNode
              key={c.code}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              selectedCode={selectedCode}
              onSelect={onSelect}
              query={query}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
