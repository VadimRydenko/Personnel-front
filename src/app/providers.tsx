import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'

export function AppProviders(props: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}
