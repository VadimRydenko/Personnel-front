import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  createOrgUnit,
  createPlace,
  fetchOrgCatalog,
  fetchOrgUnit,
  fetchOrgUnitPlaces,
  fetchOrgUnits,
  type OrgPlace,
  type OrgUnit,
  type PlaceType,
  type UnitType,
} from '../../../app/orgStructureApi'
import { queryClient } from '../../../app/queryClient'
import {
  expandAllExpandable,
  flattenOrgTree,
  getAncestorCodes,
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

export type DetailCardTab = 'attributes' | 'positions' | 'documents' | 'history'

export type CreateOrgUnitFormState = {
  parentCode: string
  unitTypeCode: string
  name: string
  city: string
  orderNo: string
  orderDate: string
}

export type CreatePlaceFormState = {
  placeTypeCode: string
  orderNo: string
  orderDate: string
  validFrom: string
}

const emptyCreatePlaceForm = (): CreatePlaceFormState => ({
  placeTypeCode: '',
  orderNo: '',
  orderDate: dateInputValue(new Date()),
  validFrom: dateInputValue(new Date()),
})

const isStaffingPath = (pathname: string) =>
  pathname === '/staffing' || pathname.startsWith('/staffing/')

export const useOrgStructurePage = () => {
  const location = useLocation()
  const isStaffingPage = isStaffingPath(location.pathname)

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

  const [selectedCode, setSelectedCodeState] = useState<number | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set())
  const [detailCardOpen, setDetailCardOpen] = useState(false)
  const [detailCardTab, setDetailCardTab] = useState<DetailCardTab>('attributes')

  const selectedDetailsQuery = useQuery({
    queryKey: ['org-units', 'details', selectedCode],
    queryFn: () => fetchOrgUnit(selectedCode as number),
    enabled: selectedCode != null,
  })

  const tree = useMemo(
    () => normalizeOrgTree(unitsQuery.data?.items ?? []),
    [unitsQuery.data?.items],
  )

  const staffingPlaceUnitCodes = useMemo(() => {
    const codes = new Set<number>()

    for (const root of tree.roots) {
      codes.add(root.code)
    }

    for (const code of expanded) {
      codes.add(code)
    }

    if (selectedCode != null) {
      codes.add(selectedCode)
    }

    return [...codes].sort((a, b) => a - b)
  }, [expanded, selectedCode, tree.roots])

  const staffingPlacesQueries = useQueries({
    queries: staffingPlaceUnitCodes.map((orgUnitCode) => ({
      queryKey: ['org-units', 'places', orgUnitCode] as const,
      queryFn: () => fetchOrgUnitPlaces(orgUnitCode),
      enabled: isStaffingPage,
    })),
  })

  const placesByUnitCode = useMemo(() => {
    const map = new Map<number, OrgPlace[]>()

    staffingPlaceUnitCodes.forEach((orgUnitCode, index) => {
      const items = staffingPlacesQueries[index]?.data?.items

      if (items) map.set(orgUnitCode, items)
    })

    return map
  }, [staffingPlaceUnitCodes, staffingPlacesQueries])

  const selectedPlacesQueryIndex =
    selectedCode != null ? staffingPlaceUnitCodes.indexOf(selectedCode) : -1

  const selectedPlacesLoading =
    isStaffingPage &&
    selectedCode != null &&
    (selectedPlacesQueryIndex < 0 ||
      staffingPlacesQueries[selectedPlacesQueryIndex]?.isLoading === true)

  const selectedPlacesError =
    isStaffingPage &&
    selectedCode != null &&
    selectedPlacesQueryIndex >= 0 &&
    staffingPlacesQueries[selectedPlacesQueryIndex]?.isError === true

  const selectedPlaces = useMemo(() => {
    if (selectedCode == null) return undefined

    if (isStaffingPage) {
      return placesByUnitCode.get(selectedCode)
    }

    return selectedDetailsQuery.data?.places
  }, [isStaffingPage, placesByUnitCode, selectedCode, selectedDetailsQuery.data?.places])

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

  const selectedNode = useMemo(() => {
    if (selectedCode == null) return null

    return tree.byCode.get(selectedCode) ?? null
  }, [selectedCode, tree.byCode])

  const childUnits = useMemo(() => {
    if (!selectedNode) return []

    if (!typeFilter) return selectedNode.children

    return selectedNode.children.filter((c) => String(c.unitTypeCode) === typeFilter)
  }, [selectedNode, typeFilter])

  const closeDetailCard = useCallback(() => {
    setDetailCardOpen(false)
  }, [setDetailCardOpen])

  const openDetailCard = useCallback(() => {
    setDetailCardOpen(true)
  }, [setDetailCardOpen])

  const setSelectedCode = useCallback(
    (code: number | null) => {
      setTypeFilter('')
      setSelectedCodeState(code)

      if (code == null) {
        setDetailCardOpen(false)

        return
      }

      setDetailCardOpen(true)
      setDetailCardTab('attributes')

      setExpanded((prev) => {
        const next = new Set(prev)

        for (const anc of getAncestorCodes(code, tree.byCode)) {
          next.add(anc)
        }

        return next
      })
    },
    [
      tree.byCode,
      setTypeFilter,
      setSelectedCodeState,
      setDetailCardOpen,
      setDetailCardTab,
      setExpanded,
    ],
  )

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

  const [isCreatePlaceOpen, setIsCreatePlaceOpen] = useState(false)
  const [createPlaceErrorText, setCreatePlaceErrorText] = useState<string | null>(null)
  const [createPlaceForm, setCreatePlaceForm] = useState<CreatePlaceFormState>(emptyCreatePlaceForm)

  const createPlaceMutation = useMutation({
    mutationFn: ({
      orgUnitCode,
      payload,
    }: {
      orgUnitCode: number
      payload: Parameters<typeof createPlace>[1]
    }) => createPlace(orgUnitCode, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['org-units'] })
      await queryClient.invalidateQueries({ queryKey: ['org-units', 'places'] })
      setIsCreatePlaceOpen(false)
      setCreatePlaceErrorText(null)
      setCreatePlaceForm(emptyCreatePlaceForm())
    },
    onError: (e) =>
      setCreatePlaceErrorText(e instanceof Error ? e.message : 'Не вдалося створити посаду'),
  })

  const canSubmitCreatePlace = useMemo(() => {
    return Boolean(
      createPlaceForm.placeTypeCode &&
      createPlaceForm.orderNo.trim() &&
      createPlaceForm.orderDate &&
      createPlaceForm.validFrom,
    )
  }, [
    createPlaceForm.orderDate,
    createPlaceForm.orderNo,
    createPlaceForm.placeTypeCode,
    createPlaceForm.validFrom,
  ])

  const openCreatePlace = () => {
    if (selectedCode == null) return

    setCreatePlaceForm(emptyCreatePlaceForm())
    setCreatePlaceErrorText(null)
    setIsCreatePlaceOpen(true)
  }

  const closeCreatePlace = () => {
    setIsCreatePlaceOpen(false)
    setCreatePlaceErrorText(null)
  }

  const submitCreatePlace = () => {
    if (selectedCode == null) return

    setCreatePlaceErrorText(null)

    createPlaceMutation.mutate({
      orgUnitCode: selectedCode,
      payload: {
        placeTypeCode: Number(createPlaceForm.placeTypeCode),
        validFrom: createPlaceForm.validFrom,
        createOrder: {
          orderNo: createPlaceForm.orderNo.trim(),
          orderDate: createPlaceForm.orderDate,
        },
      },
    })
  }

  const setCreatePlaceFormField = <K extends keyof CreatePlaceFormState>(
    key: K,
    value: CreatePlaceFormState[K],
  ) => {
    setCreatePlaceForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectedUnitTitle =
    selectedDetailsQuery.data?.name ??
    (selectedCode != null ? `Підрозділ #${selectedCode}` : 'Підрозділ')

  return {
    isStaffingPage,
    staffing: {
      unitCodes: staffingPlaceUnitCodes,
      placesByUnitCode,
    },

    selectedPlaces,
    selectedPlacesLoading: isStaffingPage ? selectedPlacesLoading : selectedDetailsQuery.isLoading,
    selectedPlacesError: isStaffingPage ? selectedPlacesError : selectedDetailsQuery.isError,

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
    detailCardOpen,
    closeDetailCard,
    openDetailCard,
    detailCardTab,
    setDetailCardTab,
    selectedBreadcrumbs,
    selectedNode,
    selectedDetailsQuery,
    childUnits,
    typeFilter,
    setTypeFilter,

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

    createPlaceModal: {
      isOpen: isCreatePlaceOpen,
      open: openCreatePlace,
      close: closeCreatePlace,
      submit: submitCreatePlace,
      errorText: createPlaceErrorText,
      isSubmitting: createPlaceMutation.isPending,
      canSubmit: canSubmitCreatePlace,
      unitTitle: selectedUnitTitle,
      form: {
        value: createPlaceForm,
        setField: setCreatePlaceFormField,
      },
    },
  } as const
}

export type OrgStructurePageState = ReturnType<typeof useOrgStructurePage>

export type OrgCatalog = { unitTypes: UnitType[]; placeTypes: PlaceType[] }
export type OrgUnitSummary = OrgUnit
