import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createDocument } from '../../app/documentsApi'
import { fetchEmployees } from '../../app/employeesApi'
import { fetchVacantPlaces } from '../../app/orgStructureApi'
import { queryClient } from '../../app/queryClient'
import { DOC_TYPES, type DocTypeId, WIZARD_STEPS } from './constants'
import { todayISO } from './utils'

export const useCreateDocumentPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [personId, setPersonId] = useState('')
  const [basis, setBasis] = useState('')
  const [docType, setDocType] = useState<DocTypeId | ''>('')
  const [placeCode, setPlaceCode] = useState<number | null>(null)
  const [placeSearch, setPlaceSearch] = useState('')

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => fetchEmployees({ pageSize: 100 }),
  })
  const employees = employeesQuery.data?.items ?? []

  const vacantPlacesQuery = useQuery({
    queryKey: ['places', 'vacant'],
    queryFn: fetchVacantPlaces,
    enabled: step >= 3,
  })
  const allVacantPlaces = useMemo(
    () => vacantPlacesQuery.data?.items ?? [],
    [vacantPlacesQuery.data],
  )

  const filteredPlaces = useMemo(() => {
    const q = placeSearch.trim().toLowerCase()

    if (!q) return allVacantPlaces

    return allVacantPlaces.filter((p) => {
      const typeName = p.placeType?.val?.toLowerCase() ?? ''
      const unitName = (p.orgUnit?.name ?? '').toLowerCase()

      return typeName.includes(q) || unitName.includes(q)
    })
  }, [allVacantPlaces, placeSearch])

  const selectedType = DOC_TYPES.find((t) => t.id === docType)
  const selectedPerson = employees.find((e) => String(e.code) === personId)
  const selectedPlace = allVacantPlaces.find((p) => p.code === placeCode)

  const personFullName = selectedPerson
    ? [selectedPerson.lastName, selectedPerson.firstName, selectedPerson.middleName]
        .filter(Boolean)
        .join(' ')
    : 'особа не обрана'

  const canProceed =
    step === 1
      ? personId !== '' && basis.trim() !== ''
      : step === 2
        ? docType !== ''
        : step === 3
          ? placeCode !== null
          : true

  const goBack = () => navigate('/documents')
  const nextStep = () => setStep((s) => Math.min(WIZARD_STEPS.length, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const saveMutation = useMutation({
    mutationFn: () =>
      createDocument({
        number: `draft-${Date.now()}`,
        date: todayISO(),
        category: selectedType?.category ?? 'Інше',
        typeLabel: selectedType?.label ?? 'Документ',
        title: `${selectedType?.label ?? 'Документ'}${selectedPerson ? ': ' + personFullName : ''}`,
        status: 'draft',
        basis: basis.trim() || undefined,
        employeeCode: selectedPerson!.code,
        placeCode: placeCode ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      navigate('/documents')
    },
  })

  return {
    step,
    personId,
    setPersonId,
    basis,
    setBasis,
    docType,
    setDocType,
    placeCode,
    setPlaceCode,
    placeSearch,
    setPlaceSearch,
    employeesQuery,
    employees,
    vacantPlacesQuery,
    filteredPlaces,
    selectedType,
    selectedPerson,
    selectedPlace,
    personFullName,
    canProceed,
    goBack,
    nextStep,
    prevStep,
    saveMutation,
  }
}
