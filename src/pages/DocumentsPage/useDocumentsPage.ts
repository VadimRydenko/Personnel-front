import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type DocStatus, fetchDocuments, updateDocumentStatus } from '../../app/documentsApi'
import { queryClient } from '../../app/queryClient'
import { type Category, STATUS_LABEL } from './constants'
import { startOfWeekMonday, toDateISO } from './utils'

export const useDocumentsPage = () => {
  const navigate = useNavigate()

  const [tab, setTab] = useState<'all' | DocStatus>('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Усі категорії')
  const [preset, setPreset] = useState<'none' | 'thisWeek' | 'vacationOrders'>('none')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const docsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocuments({ pageSize: 200 }),
  })

  const docs = useMemo(() => docsQuery.data?.items ?? [], [docsQuery.data?.items])
  const selectedDoc = docs.find((d) => d.id === selectedDocId) ?? null

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), [])
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)

    d.setDate(d.getDate() + 7)

    return d
  }, [weekStart])

  const normalizedQuery = query.trim().toLowerCase()

  const baseFiltered = useMemo(() => {
    return docs.filter((row) => {
      if (normalizedQuery) {
        const hay = `${row.number} ${row.typeLabel} ${row.title}`.toLowerCase()

        if (!hay.includes(normalizedQuery)) return false
      }

      if (category !== 'Усі категорії' && row.category !== category) return false

      if (preset === 'vacationOrders') {
        if (row.category !== 'Відпустки' && !row.typeLabel.toLowerCase().includes('відпуст'))
          return false
      }

      if (preset === 'thisWeek') {
        const dt = new Date(`${toDateISO(row.date)}T00:00:00`)

        if (dt < weekStart || dt >= weekEnd) return false
      }

      return true
    })
  }, [docs, category, normalizedQuery, preset, weekEnd, weekStart])

  const tabCounts = useMemo(() => {
    const counts: Record<'all' | DocStatus, number> = {
      all: baseFiltered.length,
      draft: 0,
      review: 0,
      sign: 0,
      done: 0,
      cancelled: 0,
    }

    for (const r of baseFiltered) counts[r.status] += 1

    return counts
  }, [baseFiltered])

  const visibleRows = useMemo(() => {
    const rows = tab === 'all' ? baseFiltered : baseFiltered.filter((r) => r.status === tab)

    return [...rows].sort((a, b) => {
      const av = toDateISO(a.date)
      const bv = toDateISO(b.date)

      if (av === bv) return a.number.localeCompare(b.number, 'uk')

      return sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
    })
  }, [baseFiltered, sortDir, tab])

  const tabs: Array<{ id: 'all' | DocStatus; label: string }> = useMemo(
    () => [
      { id: 'all', label: 'Усі' },
      { id: 'draft', label: STATUS_LABEL.draft },
      { id: 'review', label: STATUS_LABEL.review },
      { id: 'sign', label: STATUS_LABEL.sign },
      { id: 'done', label: STATUS_LABEL.done },
      { id: 'cancelled', label: STATUS_LABEL.cancelled },
    ],
    [],
  )

  const signMutation = useMutation({
    mutationFn: (id: string) => updateDocumentStatus(id, 'done'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const togglePreset = (p: 'thisWeek' | 'vacationOrders') =>
    setPreset((prev) => (prev === p ? 'none' : p))

  const toggleSort = () => setSortDir((p) => (p === 'desc' ? 'asc' : 'desc'))

  const selectDoc = (id: string) => setSelectedDocId((prev) => (prev === id ? null : id))

  const clearSelection = () => setSelectedDocId(null)

  return {
    docsQuery,
    tabs,
    tab,
    setTab,
    query,
    setQuery,
    category,
    setCategory,
    preset,
    togglePreset,
    sortDir,
    toggleSort,
    tabCounts,
    visibleRows,
    selectedDoc,
    selectDoc,
    clearSelection,
    navigate,
    signMutation,
  }
}
