import { Card, CardTitle } from '../components/ui'

export function AboutPage() {
  return (
    <Card>
      <CardTitle>About</CardTitle>
      <ul>
        <li>Vite + React + TypeScript</li>
        <li>React Router</li>
        <li>TanStack React Query</li>
        <li>ESLint + Prettier</li>
      </ul>
    </Card>
  )
}
