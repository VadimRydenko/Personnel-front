import { X } from 'lucide-react'
import {
  Button,
  ErrorAlert,
  Field,
  FieldInput,
  FieldLabel,
  FieldSelect,
} from '../../../components/ui'
import type { useCreateEmployee } from '../state/useCreateEmployee'

type Props = {
  hook: ReturnType<typeof useCreateEmployee>
  onClose: () => void
}

export const CreateEmployeeModal = ({ hook, onClose }: Props) => {
  const { form, setField, units, places, canSubmit, errorText, isSubmitting, submit } = hook

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Новий співробітник"
    >
      <div className="w-full max-w-110 overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between px-8 pb-3.5 pt-5">
          <h2 className="m-0 text-2xl font-bold tracking-[-0.02em] text-ink">Новий співробітник</h2>
          <button
            type="button"
            className="inline-flex h-9.5 w-9.5 cursor-pointer items-center justify-center rounded-xl border border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="mx-8 border-t border-border" />

        <form
          className="flex flex-col gap-4 px-8 pb-5 pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Field>
            <FieldLabel>Прізвище</FieldLabel>
            <FieldInput
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              placeholder="Іваненко"
              autoFocus
            />
          </Field>

          <Field>
            <FieldLabel>Ім'я</FieldLabel>
            <FieldInput
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              placeholder="Олексій"
            />
          </Field>

          <Field>
            <FieldLabel>По батькові</FieldLabel>
            <FieldInput
              value={form.middleName}
              onChange={(e) => setField('middleName', e.target.value)}
              placeholder="Михайлович"
            />
          </Field>

          <Field>
            <FieldLabel>Підрозділ</FieldLabel>
            <FieldSelect
              value={form.unitCode}
              onChange={(e) => setField('unitCode', e.target.value)}
            >
              <option value="">Оберіть...</option>
              {units.map((u) => (
                <option key={u.code} value={String(u.code)}>
                  {'  '.repeat(u.depth)}
                  {u.name}
                </option>
              ))}
            </FieldSelect>
          </Field>

          <Field>
            <FieldLabel>Посада</FieldLabel>
            <FieldSelect
              value={form.positionCode}
              onChange={(e) => setField('positionCode', e.target.value)}
              disabled={!form.unitCode}
            >
              <option value="">Оберіть...</option>
              {places.map((p) => (
                <option key={p.code} value={String(p.code)}>
                  {p.placeType?.val ?? `#${p.code}`}
                </option>
              ))}
            </FieldSelect>
          </Field>

          <Field>
            <FieldLabel>Дата прийняття</FieldLabel>
            <FieldInput
              type="date"
              value={form.hireDate}
              onChange={(e) => setField('hireDate', e.target.value)}
            />
          </Field>

          {errorText ? <ErrorAlert>{errorText}</ErrorAlert> : null}

          <div className="mx-[-32px] mt-1 border-t border-border" />

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Призначення…' : 'Призначити'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
