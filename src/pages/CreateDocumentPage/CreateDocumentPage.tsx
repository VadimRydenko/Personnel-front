import { Check, ChevronLeft, ChevronRight, FileText, HelpCircle, Search, X } from 'lucide-react'
import { formatUkDate } from '../../lib/dateUtils'
import { cn } from '../../lib/cn'
import {
  Button,
  Field,
  FieldInput,
  FieldLabel,
  FieldSelect,
  PageContent,
} from '../../components/ui'
import { DOC_TYPES, WIZARD_STEPS } from './constants'
import { useCreateDocumentPage } from './useCreateDocumentPage'

export const CreateDocumentPage = () => {
  const {
    step,
    personId,
    setPersonId,
    basis,
    setBasis,
    docType,
    setDocType,
    placeCode,
    setPlaceCode,
    placeSearch,
    setPlaceSearch,
    employeesQuery,
    employees,
    vacantPlacesQuery,
    filteredPlaces,
    selectedType,
    selectedPlace,
    personFullName,
    canProceed,
    goBack,
    nextStep,
    prevStep,
    saveMutation,
  } = useCreateDocumentPage()

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
                Новий документ{selectedType ? `: ${selectedType.label}` : ''}
              </h1>
              <p className="m-0 mt-0.5 text-sm text-muted">
                {selectedType?.category ?? 'Оберіть тип документа'}
              </p>
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
                      isActive || isPast
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
            <form className="mt-5 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
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
          <div className="mx-auto w-full max-w-[640px]">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
              <h2 className="m-0 text-lg font-bold text-ink">Крок 2: Тип документа</h2>
              <p className="m-0 mt-1 text-sm text-muted">
                Оберіть тип документа, який потрібно створити
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDocType(t.id)}
                    className={cn(
                      'flex flex-col gap-1 rounded-lg border p-4 text-left transition-[background,border-color,box-shadow]',
                      docType === t.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-border bg-white text-ink hover:border-slate-400 hover:bg-slate-50',
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        docType === t.id ? 'text-slate-300' : 'text-muted',
                      )}
                    >
                      {t.category}
                    </span>
                    <span className="text-sm font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto w-full max-w-[640px]">
            <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
              <h2 className="m-0 text-lg font-bold text-ink">Крок 3: Параметри</h2>
              <p className="m-0 mt-1 text-sm text-muted">
                Оберіть вакантну посаду для прив'язки документа
              </p>

              <label className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3">
                <Search size={15} strokeWidth={2} className="shrink-0 text-muted" aria-hidden />
                <input
                  type="search"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  placeholder="Пошук посади або підрозділу…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </label>

              <div className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-border">
                {vacantPlacesQuery.isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted">Завантаження…</div>
                ) : filteredPlaces.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted">
                    {placeSearch ? 'Нічого не знайдено' : 'Вакантних посад немає'}
                  </div>
                ) : (
                  filteredPlaces.map((p) => {
                    const posName = p.placeType?.val?.trim() || `Посада #${p.code}`
                    const unitName = p.orgUnit?.name?.trim() || `Підрозділ #${p.orgUnitCode}`
                    const isSelected = p.code === placeCode

                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => setPlaceCode(p.code)}
                        className={cn(
                          'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 transition-colors',
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-ink hover:bg-slate-50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                            isSelected ? 'border-white' : 'border-slate-300',
                          )}
                        >
                          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{posName}</div>
                          <div
                            className={cn(
                              'truncate text-xs',
                              isSelected ? 'text-slate-300' : 'text-muted',
                            )}
                          >
                            {unitName}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {selectedPlace && (
                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="m-0 text-sm font-semibold text-emerald-800">
                    Обрано:{' '}
                    {selectedPlace.placeType?.val?.trim() ?? `Посада #${selectedPlace.code}`}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-emerald-700">
                    {selectedPlace.orgUnit?.name?.trim() ?? ''}
                  </p>
                </div>
              )}
            </div>
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
                  від {formatUkDate(new Date().toISOString())} (проект)
                </p>

                <p className="m-0 mt-4 text-sm font-medium underline decoration-slate-400 underline-offset-2 text-ink">
                  {selectedType?.label ?? 'Документ'} ({personFullName})
                </p>

                {selectedPlace && (
                  <p className="m-0 mt-2 text-sm text-muted">
                    Посада:{' '}
                    <span className="font-medium text-ink">
                      {selectedPlace.placeType?.val?.trim()}
                    </span>
                    {selectedPlace.orgUnit?.name && ` — ${selectedPlace.orgUnit.name.trim()}`}
                  </p>
                )}

                {basis && (
                  <p className="m-0 mt-2 text-sm text-muted">
                    Підстава: <span className="font-medium text-ink">{basis}</span>
                  </p>
                )}

                <p className="m-0 mt-4 text-sm text-muted">
                  [Текст наказу буде автоматично сформовано після заповнення всіх полів]
                </p>
              </div>
            </div>

            {saveMutation.isError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4">
                <p className="m-0 text-sm font-semibold text-rose-800">
                  Помилка збереження: {(saveMutation.error as Error).message}
                </p>
              </div>
            )}

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
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                'Збереження…'
              ) : (
                <>
                  <Check size={18} strokeWidth={2.5} aria-hidden />
                  Зберегти як чернетку
                </>
              )}
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
