import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { createManagedUser, fetchAdminCatalog } from '../../app/meApi'
import { queryClient } from '../../app/queryClient'
import { toggleNumber, toggleString } from './utils'

export const useAdminUsersPage = () => {
  const catalog = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: fetchAdminCatalog,
  })

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [permissionIds, setPermissionIds] = useState<string[]>([])
  const [created, setCreated] = useState<{ email: string; temporaryPassword: string } | null>(null)

  const createMutation = useMutation({
    mutationFn: createManagedUser,
    onSuccess: (data) => {
      setCreated({ email: data.email, temporaryPassword: data.temporaryPassword })
      void queryClient.invalidateQueries({ queryKey: ['admin-catalog'] })
    },
  })

  const canSubmit = useMemo(() => email.trim().length > 3 && roleIds.length > 0, [email, roleIds])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreated(null)
    await createMutation.mutateAsync({
      email: email.trim(),
      name: name.trim() || undefined,
      roleIds,
      groupIds,
      permissionIds,
    })
  }

  return {
    catalog,
    email,
    setEmail,
    name,
    setName,
    roleIds,
    setRoleIds: (id: number) => setRoleIds((prev) => toggleNumber(prev, id)),
    groupIds,
    setGroupIds: (id: string) => setGroupIds((prev) => toggleString(prev, id)),
    permissionIds,
    setPermissionIds: (id: string) => setPermissionIds((prev) => toggleString(prev, id)),
    created,
    createMutation,
    canSubmit,
    onSubmit,
  }
}
