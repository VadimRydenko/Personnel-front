import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createEmployee } from '../../../app/employeesApi'
import {
  type OrgUnitTreeNode,
  assignEmployeeToPlace,
  fetchOrgUnitPlaces,
  fetchOrgUnits,
} from '../../../app/orgStructureApi'
import { queryClient } from '../../../app/queryClient'

const flattenTree = (
  nodes: OrgUnitTreeNode[],
  depth = 0,
): Array<OrgUnitTreeNode & { depth: number }> => {
  return nodes.flatMap((node) => [{ ...node, depth }, ...flattenTree(node.children, depth + 1)])
}

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

export const useCreateEmployee = (onSuccess: () => void) => {
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

  const setField = <K extends keyof CreateEmployeeFormState>(
    key: K,
    value: CreateEmployeeFormState[K],
  ) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value }

      if (key === 'unitCode') next.positionCode = ''

      return next
    })
  }

  const mutation = useMutation({
    mutationFn: async (values: CreateEmployeeFormState) => {
      const employee = await createEmployee({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        middleName: values.middleName.trim() || undefined,
      })

      const unitCode = Number(values.unitCode)
      const placeCode = Number(values.positionCode)

      await assignEmployeeToPlace(unitCode, placeCode, {
        employeeCode: (employee as unknown as { code: number }).code,
        validFrom: values.hireDate,
        createOrder: { orderNo: 'б/н', orderDate: values.hireDate },
      })

      return employee
    },
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

  const units = flattenTree(unitsQuery.data?.items ?? [])

  const places = placesQuery.data?.items ?? []

  const canSubmit = form.lastName.trim().length > 0 && form.firstName.trim().length > 0

  const submit = () => {
    if (!canSubmit) return

    if (!form.unitCode) {
      setErrorText('Оберіть підрозділ')

      return
    }

    if (!form.positionCode) {
      setErrorText('Оберіть посаду')

      return
    }

    if (!form.hireDate) {
      setErrorText('Вкажіть дату прийняття')

      return
    }

    setErrorText(null)
    mutation.mutate(form)
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
