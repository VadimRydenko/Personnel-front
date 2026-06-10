import type { UseQueryResult } from '@tanstack/react-query'
import {
  Button,
  ErrorAlert,
  Field,
  FieldInput,
  FieldLabel,
  FieldSelect,
} from '../../../components/ui'
import type { CreatePlaceFormState, OrgCatalog } from '../state/useOrgStructurePage'

export const CreatePlaceModal = (props: {
  unitTitle: string
  catalogQuery: UseQueryResult<OrgCatalog, Error>
  form: {
    value: CreatePlaceFormState
    setField: <K extends keyof CreatePlaceFormState>(key: K, value: CreatePlaceFormState[K]) => void
  }
  canSubmit: boolean
  errorText: string | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}) => {
  const { unitTitle, catalogQuery, form, canSubmit, errorText, isSubmitting, onClose, onSubmit } =
    props

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Нова посада"
    >
      <div className="w-full max-w-[720px] overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between px-[22px] pb-3.5 pt-5">
          <div className="min-w-0">
            <h2 className="m-0 text-2xl font-bold tracking-[-0.02em] text-ink">Нова посада</h2>
            <p className="m-0 mt-1 truncate text-sm text-muted">{unitTitle}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-transparent text-2xl leading-none text-muted hover:bg-slate-100 hover:text-ink"
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
          <Field>
            <FieldLabel>Найменування посади</FieldLabel>
            <FieldSelect
              value={form.value.placeTypeCode}
              onChange={(e) => form.setField('placeTypeCode', e.target.value)}
              disabled={catalogQuery.isLoading || catalogQuery.isError}
            >
              <option value="">Оберіть найменування…</option>
              {(catalogQuery.data?.placeTypes ?? []).map((t) => (
                <option key={t.code} value={String(t.code)}>
                  {t.val}
                </option>
              ))}
            </FieldSelect>
          </Field>

          <Field>
            <FieldLabel>Категорія посади</FieldLabel>
            <FieldSelect
              value={form.value.posTypeCode}
              onChange={(e) => form.setField('posTypeCode', e.target.value)}
              disabled={catalogQuery.isLoading || catalogQuery.isError}
            >
              <option value="">Оберіть категорію…</option>
              {(catalogQuery.data?.posTypes ?? []).map((t) => (
                <option key={t.code} value={String(t.code)}>
                  {t.val}
                </option>
              ))}
            </FieldSelect>
          </Field>

          <div className="flex gap-3.5 max-[900px]:flex-col">
            <Field className="min-w-0 flex-1">
              <FieldLabel>№ наказу</FieldLabel>
              <FieldInput
                value={form.value.orderNo}
                onChange={(e) => form.setField('orderNo', e.target.value)}
                placeholder="Напр. 123/к"
              />
            </Field>

            <Field className="min-w-0 flex-1">
              <FieldLabel>Дата наказу</FieldLabel>
              <FieldInput
                type="date"
                value={form.value.orderDate}
                onChange={(e) => form.setField('orderDate', e.target.value)}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel>Дійсна з</FieldLabel>
            <FieldInput
              type="date"
              value={form.value.validFrom}
              onChange={(e) => form.setField('validFrom', e.target.value)}
            />
          </Field>

          {errorText ? <ErrorAlert>{errorText}</ErrorAlert> : null}

          <div className="flex justify-end gap-3 pt-1.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Створення…' : 'Створити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
