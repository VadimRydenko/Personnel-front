import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAdminCatalog, getAdminUser, searchAdminUsers } from '../../app/meApi'
import { useMe } from '../../hooks/useMe'

export const useAdminUserDirectoryPage = () => {
  const queryClient = useQueryClient()
  const me = useMe()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('user') ?? ''

  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const catalog = useQuery({ queryKey: ['admin-catalog'], queryFn: fetchAdminCatalog })
  const list = useQuery({
    queryKey: ['admin-users', q, page],
    queryFn: () => searchAdminUsers({ q: q || undefined, page, pageSize: 15 }),
    enabled: catalog.isSuccess,
  })

  const detail = useQuery({
    queryKey: ['admin-user', selectedId],
    queryFn: () => getAdminUser(selectedId),
    enabled: Boolean(selectedId),
  })

  const isSelf = useMemo(
    () => Boolean(me.data?.id && selectedId && me.data.id === selectedId),
    [me.data?.id, selectedId],
  )

  const invalidateList = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  }, [queryClient])

  const selectUser = useCallback(
    (id: string) => setSearchParams(id ? { user: id } : {}),
    [setSearchParams],
  )

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQ(qInput.trim())
    setPage(1)
  }

  const resetSearch = () => {
    setQInput('')
    setQ('')
    setPage(1)
  }

  return {
    selectedId,
    qInput,
    setQInput,
    page,
    setPage,
    catalog,
    list,
    detail,
    isSelf,
    invalidateList,
    selectUser,
    onSearch,
    resetSearch,
  }
}
