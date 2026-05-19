import { useSession } from '../app/authClient'
import { getDisplayFirstName } from '../app/displayName'
import { useMe } from '../hooks/useMe'

export function HomePage() {
  const session = useSession()
  const me = useMe()
  const user = session.data?.user
  const firstName = user
    ? getDisplayFirstName(me.data?.name ?? user.name, user.email)
    : 'колега'

  return (
    <div className="pageContent">
      <h1 className="homeGreeting">Доброго ранку, {firstName} 👋</h1>
      <div className="homeGrid" aria-hidden>
        <div className="homeTile" />
        <div className="homeTile" />
        <div className="homeTile" />
        <div className="homeTile" />
      </div>
    </div>
  )
}
