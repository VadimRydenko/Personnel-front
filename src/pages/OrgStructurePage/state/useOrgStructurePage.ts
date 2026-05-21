import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  createOrgUnit,
  fetchOrgCatalog,
  fetchOrgUnit,
  fetchOrgUnits,
  type OrgUnit,
  type UnitType,
} from '../../../app/orgStructureApi'
import { queryClient } from '../../../app/queryClient'
import {
  expandAllExpandable,
  flattenOrgTree,
  getBreadcrumbs,
  matchesQuery,
  normalizeOrgTree,
} from './tree'

const dateInputValue = (d: Date) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

export type CreateOrgUnitFormState = {
  parentCode: string
  unitTypeCode: string
  name: string
  city: string
  orderNo: string
  orderDate: string
}

export const useOrgStructurePage = () => {
  const catalogQuery = useQuery({
    queryKey: ['org-units', 'catalog'],
    queryFn: fetchOrgCatalog,
  })

  const unitsQuery = useQuery({
    queryKey: ['org-units', 'list', { activeOnly: true }],
    queryFn: () => fetchOrgUnits({ activeOnly: true }),
  })

  const [searchQuery, setSearchQuery] = useState('')
  const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery])

  const [selectedCode, setSelectedCode] = useState<number | null>(null)
  const selectedDetailsQuery = useQuery({
    queryKey: ['org-units', 'details', selectedCode],
    queryFn: () => fetchOrgUnit(selectedCode as number),
    enabled: selectedCode != null,
  })

  const tree = useMemo(
    () => normalizeOrgTree(unitsQuery.data?.items ?? []),
    [unitsQuery.data?.items],
  )

  const visibleRoots = useMemo(() => {
    if (!normalizedQuery) return tree.roots

    return tree.roots.filter((r) => matchesQuery(r, normalizedQuery))
  }, [normalizedQuery, tree.roots])

  const selectedBreadcrumbs = useMemo(() => {
    if (selectedCode == null) return []

    return getBreadcrumbs(selectedCode, tree.byCode)
  }, [selectedCode, tree.byCode])

  const parents = useMemo(() => {
    const items = flattenOrgTree(unitsQuery.data?.items ?? [])

    return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'uk'))
  }, [unitsQuery.data?.items])

  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())

  const collapseAll = () => {
    setExpanded(new Set())
  }

  const expandAll = () => {
    setExpanded(expandAllExpandable(tree.byCode))
  }

  const toggleExpanded = (code: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)

      if (next.has(code)) next.delete(code)
      else next.add(code)

      return next
    })
  }

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createErrorText, setCreateErrorText] = useState<string | null>(null)
  const [form, setForm] = useState<CreateOrgUnitFormState>({
    parentCode: '',
    unitTypeCode: '',
    name: '',
    city: '',
    orderNo: '',
    orderDate: dateInputValue(new Date()),
  })

  const createMutation = useMutation({
    mutationFn: createOrgUnit,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['org-units'] })
      setIsCreateOpen(false)
      setCreateErrorText(null)
      setForm({
        parentCode: '',
        unitTypeCode: '',
        name: '',
        city: '',
        orderNo: '',
        orderDate: dateInputValue(new Date()),
      })
      setSelectedCode(created.code)
    },
    onError: (e) =>
      setCreateErrorText(e instanceof Error ? e.message : 'Не вдалося створити підрозділ'),
  })

  const canSubmit = useMemo(() => {
    return Boolean(form.unitTypeCode && form.name.trim() && form.orderNo.trim() && form.orderDate)
  }, [form.name, form.orderDate, form.orderNo, form.unitTypeCode])

  const openCreate = () => {
    setIsCreateOpen(true)
  }

  const closeCreate = () => {
    setIsCreateOpen(false)
    setCreateErrorText(null)
  }

  const submitCreate = () => {
    setCreateErrorText(null)

    const city = form.city.trim()

    createMutation.mutate({
      parentCode: form.parentCode ? Number(form.parentCode) : null,
      unitTypeCode: Number(form.unitTypeCode),
      name: form.name.trim(),
      validFrom: form.orderDate,
      ...(city ? { city } : {}),
      createOrder: { orderNo: form.orderNo.trim(), orderDate: form.orderDate },
    })
  }

  const setFormField = <K extends keyof CreateOrgUnitFormState>(
    key: K,
    value: CreateOrgUnitFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return {
    catalogQuery,
    unitsQuery,

    searchQuery,
    setSearchQuery,
    normalizedQuery,

    tree,
    visibleRoots,

    expanded,
    toggleExpanded,
    collapseAll,
    expandAll,

    selectedCode,
    setSelectedCode,
    selectedBreadcrumbs,
    selectedDetailsQuery,

    parents,

    createModal: {
      isOpen: isCreateOpen,
      open: openCreate,
      close: closeCreate,
      submit: submitCreate,
      errorText: createErrorText,
      isSubmitting: createMutation.isPending,
      canSubmit,
      form: {
        value: form,
        setField: setFormField,
      },
    },
  } as const
}

export type OrgStructurePageState = ReturnType<typeof useOrgStructurePage>

export type OrgCatalog = { unitTypes: UnitType[] }
export type OrgUnitSummary = OrgUnit
