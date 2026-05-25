import { PageContent } from '../../../components/ui'
import { useOrgStructurePage } from '../state/useOrgStructurePage'
import { CreateOrgUnitModal } from '../ui/CreateOrgUnitModal'
import { OrgTreePanel } from '../ui/OrgTreePanel'
import { UnitCardPanel } from '../ui/UnitCardPanel'
import { UnitDetailCardRail } from '../ui/UnitDetailCardRail'
import { UnitDetailSidePanel } from '../ui/UnitDetailSidePanel'

export const OrgStructurePage = () => {
  const state = useOrgStructurePage()

  return (
    <PageContent flush className="min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 overflow-hidden max-[900px]:flex-col max-[900px]:overflow-visible">
        <OrgTreePanel state={state} />
        <UnitCardPanel state={state} />
        {state.detailCardOpen && state.selectedCode != null ? (
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
    </PageContent>
  )
}
