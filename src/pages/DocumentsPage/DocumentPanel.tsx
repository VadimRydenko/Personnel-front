import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import type { Document } from '../../app/documentsApi'
import { formatUkDate } from '../../lib/dateUtils'
import { cn } from '../../lib/cn'
import { PANEL_TABS, STATUS_BADGE_CLASS, STATUS_LABEL } from './constants'
import type { PanelTab } from './constants'

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-2 py-2.5 border-b border-border last:border-b-0">
    <span className="w-36 shrink-0 text-xs text-muted">{label}</span>
    <span className="min-w-0 text-sm font-medium text-ink">{value ?? '—'}</span>
  </div>
)

export const DocumentPanel = ({
  doc,
  onClose,
  onSign,
  isSigning,
  signError,
}: {
  doc: Document
  onClose: () => void
  onSign: () => void
  isSigning: boolean
  signError: string | null
}) => {
  const [tab, setTab] = useState<PanelTab>('details')

  return (
    <section
      className="fixed right-0 top-0 z-40 flex h-svh w-[480px] flex-col overflow-hidden border-l border-border bg-surface shadow-xl"
      aria-label="Картка документа"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-bold text-ink">Картка документа</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
          onClick={onClose}
          aria-label="Закрити картку"
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 pb-4 pt-5">
          <p className="m-0 text-xs text-muted">Документи / {doc.category}</p>
          <p className="m-0 mt-0.5 text-xs font-semibold text-muted">
            Документ {doc.number} від {formatUkDate(doc.date)}
          </p>
          <p className="m-0 mt-1.5 text-base font-bold leading-snug text-ink">{doc.title}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                STATUS_BADGE_CLASS[doc.status],
              )}
            >
              {STATUS_LABEL[doc.status]}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {doc.typeLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border px-5 pb-4">
          <button
            type="button"
            disabled={doc.status === 'done' || isSigning}
            onClick={onSign}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-transparent bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSigning ? 'Підписання…' : 'Підписати через КЕП'}
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            Дублювати
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-white px-3 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            PDF
          </button>
          {signError && <p className="w-full m-0 text-xs text-rose-600">{signError}</p>}
        </div>

        <nav
          className="flex shrink-0 gap-0 border-b border-border px-3"
          aria-label="Вкладки документа"
        >
          {PANEL_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-3 py-3 text-sm font-medium transition',
                tab === t.id
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="px-5 pb-6">
          {tab === 'details' ? (
            <div className="mt-4 flex gap-6">
              <div className="flex-1 min-w-0">
                <DetailRow label="Категорія" value={doc.category} />
                <DetailRow label="Тип" value={doc.typeLabel} />
                <DetailRow label="Дата" value={formatUkDate(doc.date)} />
                <DetailRow label="Номер" value={doc.number} />
                <DetailRow label="Статус" value={STATUS_LABEL[doc.status]} />
              </div>
              <div className="w-36 shrink-0">
                <p className="m-0 text-[0.65rem] font-bold uppercase tracking-widest text-muted">
                  КЕП-ПІДПИСИ
                </p>
                <p className="m-0 mt-2 text-xs text-muted">Підписів немає</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <FileText size={32} strokeWidth={1.25} className="text-slate-300" />
              <p className="m-0 mt-2 text-sm text-muted">Розділ у розробці</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
