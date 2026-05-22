import { Muted, PageContent } from '../../../components/ui'
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
          className="box-border flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-border bg-main max-[900px]:hidden"
          aria-label="Картка підрозділу"
        >
          <div className="flex min-h-[200px] flex-1 items-center justify-center px-5 py-4">
            <Muted className="text-center text-sm">Картка підрозділу (незабаром)</Muted>
          </div>
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
