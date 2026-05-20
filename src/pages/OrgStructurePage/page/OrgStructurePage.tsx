import { PageContent } from '../../../components/ui'
import { useOrgStructurePage } from '../state/useOrgStructurePage'
import { CreateOrgUnitModal } from '../ui/CreateOrgUnitModal'
import { OrgTreePanel } from '../ui/OrgTreePanel'
import { UnitCardPanel } from '../ui/UnitCardPanel'

export const OrgStructurePage = () => {
  const state = useOrgStructurePage()

  return (
    <PageContent flush className="min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 overflow-hidden max-[900px]:flex-col max-[900px]:overflow-visible">
        <OrgTreePanel state={state} />
        <UnitCardPanel state={state} />
        <section
          className="box-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-l border-border bg-main px-5 py-4 max-[900px]:w-full max-[900px]:flex-[0_1_auto] max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:overflow-visible"
          aria-label="Контент підрозділу"
        >
          <div className="min-h-[200px] flex-1" />
        </section>
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
