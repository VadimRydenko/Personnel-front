import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../../app/authClient'
import { fetchMe } from '../../app/meApi'
import { queryClient } from '../../app/queryClient'
import { hasSecurityAdminRole } from '../../app/securityAdmin'

export const useLoginPage = () => {
  const navigate = useNavigate()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const canSubmit = useMemo(() => email.trim() && password, [email, password])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorText(null)
    setIsSubmitting(true)

    try {
      const trimmedEmail = email.trim()
      const result = await authClient.signIn.email({ email: trimmedEmail, password })

      if (result.error) {
        setErrorText(result.error.message ?? 'Не вдалося увійти')

        return
      }

      await session.refetch()

      let meData: Awaited<ReturnType<typeof fetchMe>>

      try {
        meData = await fetchMe()
      } catch {
        void queryClient.invalidateQueries({ queryKey: ['me'] })
        navigate('/', { replace: true })

        return
      }

      void queryClient.setQueryData(['me', meData.id], meData)
      navigate(hasSecurityAdminRole(meData) ? '/admin/users' : '/', { replace: true })
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Не вдалося увійти')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { email, setEmail, password, setPassword, isSubmitting, errorText, canSubmit, onSubmit }
}
