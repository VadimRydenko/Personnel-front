import { PageContent, PageTitle } from '../components/ui'

type PlaceholderPageProps = {
  title: string
}

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <PageContent>
      <PageTitle>{title}</PageTitle>
    </PageContent>
  )
}
