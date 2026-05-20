import type { OrgStructurePageState } from '../state/useOrgStructurePage'

const fmtDate = (value: string | null | undefined) => {
  if (!value) return '—'

  return String(value).slice(0, 10).split('-').reverse().join('.')
}

export const UnitCardPanel = ({ state }: { state: OrgStructurePageState }) => {
  const crumbs = state.selectedBreadcrumbs

  return (
    <section
      className="box-border flex w-[520px] shrink-0 flex-col overflow-hidden border-l border-[var(--surface-border)] bg-[var(--main-bg)] px-5 py-4 min-w-0 max-[900px]:w-full max-[900px]:flex-[0_1_auto] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:border-[var(--surface-border)] max-[900px]:overflow-visible"
      aria-label="Картка підрозділу"
    >
      <div className="mb-2.5">
        {crumbs.length ? (
          <span className="muted">{crumbs.map((x) => x.name || `#${x.code}`).join(' / ')}</span>
        ) : (
          <span className="muted">Оберіть підрозділ зліва</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3.5">
        <div>
          <h1 className="mb-1 text-[1.65rem] font-extrabold tracking-[-0.03em] text-[var(--text)]">
            {state.selectedDetailsQuery.data?.name ||
              (state.selectedCode ? `Підрозділ #${state.selectedCode}` : 'Підрозділ')}
          </h1>
          <div className="muted text-sm">
            {state.selectedDetailsQuery.data?.stationing
              ? state.selectedDetailsQuery.data.stationing
              : '—'}{' '}
            ·{' '}
            {state.selectedDetailsQuery.data?.places
              ? `${state.selectedDetailsQuery.data.places.length} штатних одиниць`
              : '—'}
          </div>
        </div>
      </div>

      <hr
        className="my-3 h-0 shrink-0 border-0 border-t border-[var(--surface-border)]"
        aria-hidden
      />

      {state.selectedCode == null ? (
        <div className="muted">Виберіть підрозділ, щоб побачити деталі.</div>
      ) : state.selectedDetailsQuery.isLoading ? (
        <div className="muted">Завантаження…</div>
      ) : state.selectedDetailsQuery.isError ? (
        <p className="error">Не вдалося завантажити підрозділ</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--surface-border)] py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-[var(--muted)]">Тип</span>
              <span className="text-right font-bold text-[var(--text)]">
                {state.selectedDetailsQuery.data?.unitType?.val ?? '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--surface-border)] py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-[var(--muted)]">Наказ</span>
              <span className="text-right font-bold text-[var(--text)]">
                {state.selectedDetailsQuery.data?.createOrder
                  ? `№ ${state.selectedDetailsQuery.data.createOrder.orderNo} від ${fmtDate(state.selectedDetailsQuery.data.createOrder.orderDate)}`
                  : '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-[var(--surface-border)] py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-[var(--muted)]">Дата створення</span>
              <span className="text-right font-bold text-[var(--text)]">
                {fmtDate(state.selectedDetailsQuery.data?.validFrom)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
