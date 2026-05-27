import { Muted } from '../../../../components/ui'

export const TabPlaceholder = ({ title }: { title: string }) => (
  <Muted className="py-8 text-center">{title} (незабаром)</Muted>
)
