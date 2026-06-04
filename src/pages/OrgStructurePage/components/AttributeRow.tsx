export const AttributeRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
    <span className="shrink-0 text-sm text-muted">{label}</span>
    <span className="min-w-0 text-right text-sm font-semibold text-ink">{value}</span>
  </div>
)
