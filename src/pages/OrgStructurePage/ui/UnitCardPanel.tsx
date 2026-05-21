import { ErrorAlert, Muted } from '../../../components/ui'
import type { OrgStructurePageState } from '../state/useOrgStructurePage'

const fmtDate = (value: string | null | undefined) => {
  if (!value) return '—'

  return String(value).slice(0, 10).split('-').reverse().join('.')
}

export const UnitCardPanel = ({ state }: { state: OrgStructurePageState }) => {
  const crumbs = state.selectedBreadcrumbs

  return (
    <section
      className="box-border flex w-[520px] shrink-0 flex-col overflow-hidden border-l border-border bg-main px-5 py-4 min-w-0 max-[900px]:w-full max-[900px]:flex-[0_1_auto] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:overflow-visible"
      aria-label="Картка підрозділу"
    >
      <div className="mb-2.5">
        {crumbs.length ? (
          <Muted>{crumbs.map((x) => x.name || `#${x.code}`).join(' / ')}</Muted>
        ) : (
          <Muted>Оберіть підрозділ зліва</Muted>
        )}
      </div>

      <div className="flex items-center justify-between gap-3.5">
        <div>
          <h1 className="mb-1 text-[1.65rem] font-extrabold tracking-[-0.03em] text-ink">
            {state.selectedDetailsQuery.data?.name ||
              (state.selectedCode ? `Підрозділ #${state.selectedCode}` : 'Підрозділ')}
          </h1>
          <Muted className="text-sm">
            {state.selectedDetailsQuery.data?.city ? state.selectedDetailsQuery.data.city : '—'} ·{' '}
            {state.selectedDetailsQuery.data?.places
              ? `${state.selectedDetailsQuery.data.places.length} штатних одиниць`
              : '—'}
          </Muted>
        </div>
      </div>

      <hr className="my-3 h-0 shrink-0 border-0 border-t border-border" aria-hidden />

      {state.selectedCode == null ? (
        <Muted>Виберіть підрозділ, щоб побачити деталі.</Muted>
      ) : state.selectedDetailsQuery.isLoading ? (
        <Muted>Завантаження…</Muted>
      ) : state.selectedDetailsQuery.isError ? (
        <ErrorAlert>Не вдалося завантажити підрозділ</ErrorAlert>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-muted">Тип</span>
              <span className="text-right font-bold text-ink">
                {state.selectedDetailsQuery.data?.unitType?.val ?? '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-muted">Наказ</span>
              <span className="text-right font-bold text-ink">
                {state.selectedDetailsQuery.data?.createOrder
                  ? `№ ${state.selectedDetailsQuery.data.createOrder.orderNo} від ${fmtDate(state.selectedDetailsQuery.data.createOrder.orderDate)}`
                  : '—'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
              <span className="text-sm font-semibold text-muted">Дата створення</span>
              <span className="text-right font-bold text-ink">
                {fmtDate(state.selectedDetailsQuery.data?.validFrom)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
