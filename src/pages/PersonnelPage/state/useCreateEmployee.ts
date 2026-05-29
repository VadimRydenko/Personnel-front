import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createEmployee } from '../../../app/employeesApi'
import { fetchOrgUnitPlaces, fetchOrgUnits } from '../../../app/orgStructureApi'
import { queryClient } from '../../../app/queryClient'

export type CreateEmployeeFormState = {
  lastName: string
  firstName: string
  middleName: string
  unitCode: string
  positionCode: string
  hireDate: string
}

const emptyForm = (): CreateEmployeeFormState => ({
  lastName: '',
  firstName: '',
  middleName: '',
  unitCode: '',
  positionCode: '',
  hireDate: '',
})

export function useCreateEmployee(onSuccess: () => void) {
  const [form, setFormState] = useState<CreateEmployeeFormState>(emptyForm)
  const [errorText, setErrorText] = useState<string | null>(null)

  const unitsQuery = useQuery({
    queryKey: ['org-units', 'list', { activeOnly: true }],
    queryFn: () => fetchOrgUnits({ activeOnly: true }),
  })

  const selectedUnitCode = form.unitCode ? Number(form.unitCode) : null

  const placesQuery = useQuery({
    queryKey: ['org-units', 'places', selectedUnitCode],
    queryFn: () => fetchOrgUnitPlaces(selectedUnitCode!),
    enabled: selectedUnitCode !== null,
  })

  function setField<K extends keyof CreateEmployeeFormState>(
    key: K,
    value: CreateEmployeeFormState[K],
  ) {
    setFormState((prev) => {
      const next = { ...prev, [key]: value }

      if (key === 'unitCode') next.positionCode = ''

      return next
    })
  }

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setFormState(emptyForm())
      setErrorText(null)
      onSuccess()
    },
    onError: (err: Error) => {
      setErrorText(err.message)
    },
  })

  const units = unitsQuery.data?.items ?? []

  const places = placesQuery.data?.items ?? []

  const canSubmit = form.lastName.trim().length > 0 && form.firstName.trim().length > 0

  function submit() {
    if (!canSubmit) return

    const unitCode = form.unitCode ? Number(form.unitCode) : undefined
    const positionCode = form.positionCode ? Number(form.positionCode) : undefined

    const selectedPlace = positionCode ? places.find((p) => p.code === positionCode) : undefined

    const title = selectedPlace?.placeType?.val

    mutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim() || undefined,
      title,
      unitCode,
      positionCode,
      hireDate: form.hireDate || undefined,
    })
  }

  return {
    form,
    setField,
    units,
    places,
    canSubmit,
    errorText,
    isSubmitting: mutation.isPending,
    submit,
  }
}
