import { useQuery } from '@tanstack/react-query'
import { useSession } from '../app/authClient'
import { fetchMe, type MeResponse } from '../app/meApi'

export function useMe() {
  const session = useSession()

  return useQuery<MeResponse>({
    queryKey: ['me', session.data?.user?.id],
    queryFn: fetchMe,
    enabled: Boolean(session.data?.user),
    staleTime: 30_000,
  })
}
