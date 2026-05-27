import type { OrgStructurePageState } from '../state/useOrgStructurePage'
import { AccNode } from './TreeNode'

export const OrgTree = ({ state }: { state: OrgStructurePageState }) => {
  return (
    <ul className="m-0 flex list-none flex-col space-y-1.5 p-0 pr-4">
      {state.visibleRoots.map((r) => (
        <AccNode
          key={r.code}
          node={r}
          depth={0}
          expanded={state.expanded}
          onToggle={state.toggleExpanded}
          selectedCode={state.selectedCode}
          onSelect={state.setSelectedCode}
          query={state.normalizedQuery}
        />
      ))}
    </ul>
  )
}
