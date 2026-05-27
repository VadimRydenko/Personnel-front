import { ChevronRight, FileText, HelpCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, FieldInput, FieldLabel, FieldSelect, PageContent } from '../components/ui'
import { cn } from '../lib/cn'

const WIZARD_STEPS = [
  { id: 1, label: 'Категорія' },
  { id: 2, label: 'Тип' },
  { id: 3, label: 'Параметри' },
  { id: 4, label: "Прев'ю" },
] as const

const MOCK_PERSONS = [
  { id: 'p1', label: 'Іваненко Олексій Миколайович' },
  { id: 'p2', label: 'Литвин Михайло Сергійович' },
  { id: 'p3', label: 'Шевченко Дмитро Степанович' },
  { id: 'p4', label: 'Коваль Петро Миколайович' },
  { id: 'p5', label: 'Романюк Ігор Іванович' },
]

export function CreateDocumentPage() {
  const navigate = useNavigate()
  const [step] = useState(1)
  const [personId, setPersonId] = useState('')
  const [basis, setBasis] = useState('')

  const goBack = () => navigate('/documents')

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
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {s.id}
                  </span>
                  {s.label}
                </span>
              </div>
            )
          })}
        </nav>
      </header>

      <div className="flex flex-1 flex-col px-6 py-8">
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
              <FieldSelect value={personId} onChange={(e) => setPersonId(e.target.value)}>
                <option value="">— Оберіть особу —</option>
                {MOCK_PERSONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
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
      </div>

      <footer className="mt-auto flex items-center justify-between gap-4 border-t border-border bg-surface px-6 py-4">
        <Button type="button" variant="secondary" onClick={goBack}>
          Скасувати
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="gap-1.5 bg-slate-900 border-slate-900 hover:border-slate-800 hover:bg-slate-800"
            disabled
            title="Наступні кроки ще не реалізовані"
          >
            Далі
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          </Button>

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
