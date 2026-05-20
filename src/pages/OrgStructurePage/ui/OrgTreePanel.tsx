import { Calendar, ChevronsDownUp, ChevronsUpDown, Plus, Search, X } from 'lucide-react'
import type { OrgStructurePageState } from '../state/useOrgStructurePage'
import { OrgTree } from './OrgTree'

export const OrgTreePanel = ({ state }: { state: OrgStructurePageState }) => {
  return (
    <section
      className="box-border flex w-[360px] shrink-0 flex-col overflow-hidden bg-[var(--main-bg)] px-5 py-4 min-w-0 max-[900px]:w-full max-[900px]:flex-[0_1_auto] max-[900px]:overflow-visible"
      aria-label="Підрозділи"
    >
      <div className="mb-3 flex flex-col gap-3">
        <label className="flex h-11 cursor-text items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-white px-3">
          <span className="visuallyHidden">Пошук підрозділу</span>
          <Search size={16} strokeWidth={2} aria-hidden className="shrink-0 text-[var(--muted)]" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-[var(--text)] outline-none"
            value={state.searchQuery}
            onChange={(e) => state.setSearchQuery(e.target.value)}
            placeholder="Пошук підрозділу…"
          />
          {state.searchQuery.trim() ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--text)]"
              onClick={() => state.setSearchQuery('')}
              title="Очистити"
            >
              <X size={16} strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </label>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-[var(--surface-border)] bg-white hover:bg-slate-50"
              title="Згорнути всі"
              onClick={state.collapseAll}
            >
              <ChevronsDownUp size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-[var(--surface-border)] bg-white hover:bg-slate-50"
              title="Розгорнути всі"
              onClick={state.expandAll}
            >
              <ChevronsUpDown size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent)] text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"
              title="Новий підрозділ"
              onClick={state.createModal.open}
            >
              <Plus size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div
            className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[var(--surface-border)] bg-white px-3 text-sm font-semibold text-[var(--muted)]"
            title="Поточна дата"
          >
            <Calendar size={16} strokeWidth={2} aria-hidden />
            <span>{state.createModal.form.value.orderDate.split('-').reverse().join('.')}</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto pr-0.5">
        {state.unitsQuery.isLoading ? (
          <p className="muted m-0">Завантаження…</p>
        ) : state.unitsQuery.isError ? (
          <p className="error m-0">Не вдалося завантажити підрозділи</p>
        ) : (state.unitsQuery.data?.items ?? []).length === 0 ? (
          <p className="muted m-0">Підрозділів ще немає</p>
        ) : (
          <OrgTree state={state} />
        )}
      </div>
    </section>
  )
}
