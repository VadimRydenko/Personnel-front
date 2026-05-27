import type { OrgPlaceDetails } from '../../../../app/orgStructureApi'

export type PlaceDetails = OrgPlaceDetails

export type PlaceDetailsTabProps = {
  details: PlaceDetails | undefined
  isLoading: boolean
}
