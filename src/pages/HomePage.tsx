import { useQuery } from '@tanstack/react-query'

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function fetchHello() {
  await wait(250)
  return { message: 'Hello from React Query' }
}

export function HomePage() {
  const helloQuery = useQuery({
    queryKey: ['hello'],
    queryFn: fetchHello,
  })

  return (
    <section className="card">
      <h1>Home</h1>
      <p className="muted">Готовий старт: маршрути, провайдери, лінт/формат.</p>

      <div className="divider" />

      <h2>React Query demo</h2>
      {helloQuery.isLoading ? (
        <p>Loading…</p>
      ) : helloQuery.isError ? (
        <p className="error">Failed to load demo data</p>
      ) : (
        <p>
          <code>{helloQuery.data?.message ?? 'OK'}</code>
        </p>
      )}
    </section>
  )
}
