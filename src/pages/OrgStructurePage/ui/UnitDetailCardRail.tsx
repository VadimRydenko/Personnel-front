import { ChevronRight } from 'lucide-react'

export const UnitDetailCardRail = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    className="box-border flex w-10 shrink-0 cursor-pointer items-center justify-center self-stretch border-l border-border bg-surface text-muted transition hover:bg-slate-50 hover:text-ink max-[900px]:hidden"
    aria-label="Відкрити картку підрозділу"
    title="Картка підрозділу"
  >
    <ChevronRight size={20} strokeWidth={2} aria-hidden />
  </button>
)
