import { PageContent } from '../../components/ui'
import { useHomePage } from './useHomePage'

export const HomePage = () => {
  const { firstName } = useHomePage()

  return (
    <PageContent>
      <h1 className="m-0 mb-6 text-[clamp(1.5rem,2.5vw,2rem)] font-bold tracking-[-0.03em] text-ink">
        Доброго ранку, {firstName} 👋
      </h1>
      <div
        className="-m-2.5 flex min-h-[calc(100svh-160px)] flex-wrap max-[900px]:min-h-0"
        aria-hidden
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="m-2.5 min-h-[220px] flex-[1_1_calc(50%-20px)] rounded-lg border border-border bg-surface shadow-card max-[900px]:flex-[1_1_100%]"
          />
        ))}
      </div>
    </PageContent>
  )
}
