import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="card">
      <h1>404</h1>
      <p className="muted">Такої сторінки немає.</p>
      <p>
        <Link to="/">Повернутися на головну</Link>
      </p>
    </section>
  )
}
