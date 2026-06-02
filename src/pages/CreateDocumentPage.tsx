import { useQuery } from '@tanstack/react-query'
import { Check, ChevronLeft, ChevronRight, FileText, HelpCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEmployees } from '../app/employeesApi'
import { Button, Field, FieldInput, FieldLabel, FieldSelect, PageContent } from '../components/ui'
import { cn } from '../lib/cn'

const WIZARD_STEPS = [
  { id: 1, label: 'Категорія' },
  { id: 2, label: 'Тип' },
  { id: 3, label: 'Параметри' },
  { id: 4, label: "Прев'ю" },
] as const

function formatUkDate(date: Date) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()

  return `${d}.${m}.${y}`
}

export function CreateDocumentPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [personId, setPersonId] = useState('')
  const [basis, setBasis] = useState('')

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees({ pageSize: 100 }),
  })
  const employees = employeesQuery.data?.items ?? []

  const goBack = () => navigate('/documents')
  const canProceed = step === 1 ? personId !== '' && basis.trim() !== '' : true
  const selectedPerson = employees.find((e) => String(e.code) === personId)

  const nextStep = () => setStep((s) => Math.min(4, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  return (
    <PageContent flush className="relative flex min-h-0 flex-1 flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border bg-white text-muted transition-[background,color] hover:bg-slate-50 hover:text-ink"
            aria-label="Закрити"
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>

          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-slate-50 text-slate-700">
              <FileText size={22} strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="m-0 text-xl font-bold tracking-[-0.02em] text-ink">
                Новий документ: Документ
              </h1>
              <p className="m-0 mt-0.5 text-sm text-muted">Інше</p>
            </div>
          </div>
        </div>

        <nav
          className="mt-5 flex flex-wrap items-center gap-1"
          aria-label="Етапи створення документа"
        >
          {WIZARD_STEPS.map((s, index) => {
            const isActive = s.id === step
            const isPast = s.id < step

            return (
              <div key={s.id} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className="mx-0.5 shrink-0 text-slate-300"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold',
                    isActive ? 'text-ink' : 'text-muted',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : isPast
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {isPast ? <Check size={13} strokeWidth={2.5} aria-hidden /> : s.id}
                  </span>
                  {s.label}
                </span>
              </div>
            )
          })}
        </nav>
      </header>

      <div className="flex flex-1 flex-col px-6 py-8">
        {step === 1 && (
          <div className="mx-auto w-full max-w-[640px] rounded-lg border border-border bg-surface p-6 shadow-card">
            <h2 className="m-0 text-lg font-bold text-ink">Крок 1: Категорія</h2>

            <form
              className="mt-5 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Field>
                <FieldLabel>Особа</FieldLabel>
                <FieldSelect
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  disabled={employeesQuery.isLoading}
                >
                  <option value="">
                    {employeesQuery.isLoading ? 'Завантаження…' : '— Оберіть особу —'}
                  </option>
                  {employees.map((e) => {
                    const fullName = [e.lastName, e.firstName, e.middleName]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <option key={e.code} value={String(e.code)}>
                        {fullName}
                      </option>
                    )
                  })}
                </FieldSelect>
              </Field>

              <Field>
                <FieldLabel>Підстава</FieldLabel>
                <FieldInput
                  value={basis}
                  onChange={(e) => setBasis(e.target.value)}
                  placeholder="Введіть підставу…"
                />
              </Field>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto w-full max-w-[640px] rounded-lg border border-border bg-surface p-6 shadow-card">
            <h2 className="m-0 text-lg font-bold text-ink">Крок 2: Тип</h2>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto w-full max-w-[640px] rounded-lg border border-border bg-surface p-6 shadow-card">
            <h2 className="m-0 text-lg font-bold text-ink">Крок 3: Параметри</h2>
          </div>
        )}

        {step === 4 && (
          <div className="mx-auto w-full max-w-[640px] space-y-4">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
              <h2 className="m-0 text-lg font-bold text-ink">Крок 4: Прев'ю</h2>

              <div className="mt-5 rounded-lg border border-border bg-slate-50/60 px-8 py-6 text-center">
                <p className="m-0 text-xs font-semibold uppercase tracking-widest text-muted">
                  Адміністрація Держспецзв'язку України
                </p>
                <p className="m-0 mt-3 text-base font-bold text-ink">
                  Наказ Голова Держспецзв'язку
                </p>
                <p className="m-0 mt-1 text-sm text-muted">
                  від {formatUkDate(new Date())} (проект)
                </p>

                <p className="m-0 mt-4 text-sm font-medium underline decoration-slate-400 underline-offset-2 text-ink">
                  Про документ (
                  {selectedPerson
                    ? [selectedPerson.lastName, selectedPerson.firstName, selectedPerson.middleName]
                        .filter(Boolean)
                        .join(' ')
                    : 'особа не обрана'}
                  )
                </p>

                <p className="m-0 mt-4 text-sm text-muted">
                  [Текст наказу буде автоматично сформовано після заповнення всіх полів]
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="m-0 text-sm text-blue-800">
                ★ Після збереження документ потрапить до статусу «Чернетка» і буде доступний для
                подальшого погодження та підпису КЕП.
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-4 border-t border-border bg-surface px-6 py-4">
        <Button type="button" variant="secondary" onClick={goBack}>
          Скасувати
        </Button>

        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={prevStep} className="gap-1.5">
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
              Назад
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              className="gap-1.5 bg-slate-900 border-slate-900 hover:border-slate-800 hover:bg-slate-800"
              disabled={!canProceed}
              onClick={nextStep}
            >
              Далі
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              className="gap-1.5 bg-slate-900 border-slate-900 hover:border-slate-800 hover:bg-slate-800"
              onClick={() => navigate('/documents')}
            >
              <Check size={18} strokeWidth={2.5} aria-hidden />
              Зберегти як чернетку
            </Button>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-muted transition-[background,color] hover:bg-slate-50 hover:text-ink"
            aria-label="Довідка"
            title="Довідка"
          >
            <HelpCircle size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </footer>
    </PageContent>
  )
}
