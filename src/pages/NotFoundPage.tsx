import { Card, CardTitle, Muted, PageContent } from '../components/ui'

export function NotFoundPage() {
  return (
    <PageContent>
      <Card>
        <CardTitle>Сторінку не знайдено</CardTitle>
        <Muted>Такої сторінки немає.</Muted>
      </Card>
    </PageContent>
  )
}
