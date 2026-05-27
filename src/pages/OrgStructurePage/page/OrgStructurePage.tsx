import { PageContent } from '../../../components/ui'
import { useOrgStructurePage } from '../state/useOrgStructurePage'
import { CreateOrgUnitModal } from '../components/CreateOrgUnitModal'
import { CreatePlaceModal } from '../components/CreatePlaceModal'
import { OrgTreePanel } from '../components/OrgTreePanel'
import { UnitCardPanel } from '../components/UnitCardPanel'
import { PlaceDetailCardRail } from '../components/PlaceDetailCardRail'
import { PlaceDetailSidePanel } from '../components/PlaceDetailSidePanel'
import { UnitDetailCardRail } from '../components/UnitDetailCardRail'
import { UnitDetailSidePanel } from '../components/UnitDetailSidePanel'

export const OrgStructurePage = () => {
  const state = useOrgStructurePage()

  return (
    <PageContent flush className="min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 overflow-hidden max-[900px]:flex-col max-[900px]:overflow-visible">
        <OrgTreePanel state={state} />
        <UnitCardPanel state={state} />
        {state.placeDetailCardOpen && state.selectedPlaceCode != null ? (
          <PlaceDetailSidePanel state={state} />
        ) : state.selectedPlaceCode != null ? (
          <PlaceDetailCardRail onOpen={state.openPlaceDetailCard} />
        ) : state.detailCardOpen && state.selectedCode != null ? (
          <UnitDetailSidePanel state={state} />
        ) : state.selectedCode != null ? (
          <UnitDetailCardRail onOpen={state.openDetailCard} />
        ) : null}
      </div>

      {state.createModal.isOpen ? (
        <CreateOrgUnitModal
          catalogQuery={state.catalogQuery}
          parents={state.parents}
          form={state.createModal.form}
          canSubmit={state.createModal.canSubmit}
          errorText={state.createModal.errorText}
          isSubmitting={state.createModal.isSubmitting}
          onClose={state.createModal.close}
          onSubmit={state.createModal.submit}
        />
      ) : null}

      {state.createPlaceModal.isOpen ? (
        <CreatePlaceModal
          unitTitle={state.createPlaceModal.unitTitle}
          catalogQuery={state.catalogQuery}
          form={state.createPlaceModal.form}
          canSubmit={state.createPlaceModal.canSubmit}
          errorText={state.createPlaceModal.errorText}
          isSubmitting={state.createPlaceModal.isSubmitting}
          onClose={state.createPlaceModal.close}
          onSubmit={state.createPlaceModal.submit}
        />
      ) : null}
    </PageContent>
  )
}
