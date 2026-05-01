import { useQuery } from '@tanstack/react-query'
import { healthCheck } from '../app/api'

export function HomePage() {
  const healthQuery = useQuery({
    queryKey: ['backend-health'],
    queryFn: healthCheck,
    retry: 1,
  })

  return (
    <section className="card">
      <h1>Home</h1>

      <div className="divider" />

      <h2>Backend health</h2>
      {healthQuery.isLoading ? (
        <p>Loading…</p>
      ) : healthQuery.isError ? (
        <p className="error">Backend is not reachable</p>
      ) : (
        <p>
          <code>
            Alive (HTTP {healthQuery.data?.status}) — {healthQuery.data?.url}
          </code>
        </p>
      )}
    </section>
  )
}
