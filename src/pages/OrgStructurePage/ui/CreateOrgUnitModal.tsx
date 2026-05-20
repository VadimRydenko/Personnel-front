import type { UseQueryResult } from '@tanstack/react-query'
import type { CreateOrgUnitFormState, OrgCatalog } from '../state/useOrgStructurePage'

const fieldLabel = 'text-[0.85rem] font-medium text-[var(--text)]'

const fieldControl =
  'w-full rounded-lg border border-[var(--surface-border)] bg-white px-3 py-2.5 text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[rgba(59,130,246,0.15)]'

export const CreateOrgUnitModal = (props: {
  catalogQuery: UseQueryResult<OrgCatalog, Error>
  parents: { code: number; name: string }[]
  form: {
    value: CreateOrgUnitFormState
    setField: <K extends keyof CreateOrgUnitFormState>(
      key: K,
      value: CreateOrgUnitFormState[K],
    ) => void
  }
  canSubmit: boolean
  errorText: string | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}) => {
  const { catalogQuery, parents, form, canSubmit, errorText, isSubmitting, onClose, onSubmit } =
    props

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Новий підрозділ"
    >
      <div className="w-full max-w-[720px] overflow-hidden rounded-[22px] border border-[var(--surface-border)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between px-[22px] pb-3.5 pt-5">
          <h2 className="m-0 text-2xl font-bold tracking-[-0.02em] text-[var(--text)]">
            Новий підрозділ
          </h2>
          <button
            type="button"
            className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-xl border border-transparent bg-transparent text-2xl leading-none text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--text)]"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <form
          className="flex flex-col gap-4 px-[22px] pb-5"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Батьківський підрозділ</span>
            <select
              className={fieldControl}
              value={form.value.parentCode}
              onChange={(e) => form.setField('parentCode', e.target.value)}
            >
              <option value="">—</option>
              {parents.map((p) => (
                <option key={p.code} value={String(p.code)}>
                  {p.name || `#${p.code}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Тип підрозділу</span>
            <select
              className={fieldControl}
              value={form.value.unitTypeCode}
              onChange={(e) => form.setField('unitTypeCode', e.target.value)}
              disabled={catalogQuery.isLoading || catalogQuery.isError}
            >
              <option value="">Оберіть тип…</option>
              {(catalogQuery.data?.unitTypes ?? []).map((t) => (
                <option key={t.code} value={String(t.code)}>
                  {t.val}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Назва</span>
            <input
              className={fieldControl}
              value={form.value.name}
              onChange={(e) => form.setField('name', e.target.value)}
              placeholder="Введіть назву підрозділу…"
            />
          </label>

          <div className="flex gap-3.5 max-[900px]:flex-col max-[900px]:gap-3.5">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className={fieldLabel}>№ наказу</span>
              <input
                className={fieldControl}
                value={form.value.orderNo}
                onChange={(e) => form.setField('orderNo', e.target.value)}
                placeholder="Напр. 123/к"
              />
            </label>

            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className={fieldLabel}>Дата</span>
              <input
                className={fieldControl}
                type="date"
                value={form.value.orderDate}
                onChange={(e) => form.setField('orderDate', e.target.value)}
              />
            </label>
          </div>

          {errorText ? <p className="error">{errorText}</p> : null}

          <div className="flex justify-end gap-3 pt-1.5">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--surface-border)] bg-white px-4 py-2.5 font-semibold text-[var(--text)] transition hover:bg-slate-50"
              onClick={onClose}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 font-semibold text-white transition hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Створення…' : 'Створити'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
