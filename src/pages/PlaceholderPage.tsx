type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="pageContent">
      <h1 className="pageTitle">{title}</h1>
    </div>
  )
}
