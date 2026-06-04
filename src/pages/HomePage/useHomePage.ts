import { useSession } from '../../app/authClient'
import { getDisplayFirstName } from '../../app/displayName'
import { useMe } from '../../hooks/useMe'

export const useHomePage = () => {
  const session = useSession()
  const me = useMe()
  const user = session.data?.user
  const firstName = user ? getDisplayFirstName(me.data?.name ?? user.name, user.email) : 'колега'

  return { firstName }
}
