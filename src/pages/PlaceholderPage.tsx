import { PageContent, PageTitle } from '../components/ui'

type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <PageContent>
      <PageTitle>{title}</PageTitle>
    </PageContent>
  )
}
