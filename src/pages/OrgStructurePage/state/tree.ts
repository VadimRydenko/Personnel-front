import type { OrgUnit, OrgUnitTreeNode } from '../../../app/orgStructureApi'

export type TreeNode = OrgUnit & { children: TreeNode[] }

const sortTree = (nodes: TreeNode[]) => {
  nodes.sort((a, b) => a.sortOrder - b.sortOrder)
  nodes.forEach((n) => sortTree(n.children))
}

/** Нормалізує вкладену відповідь API в дерево та індекс code → вузол */
export const normalizeOrgTree = (roots: OrgUnitTreeNode[]) => {
  const byCode = new Map<number, TreeNode>()

  const toTreeNode = (u: OrgUnitTreeNode): TreeNode => {
    const cached = byCode.get(u.code)

    if (cached) return cached

    const node: TreeNode = {
      ...u,
      children: (u.children ?? []).map(toTreeNode),
    }

    byCode.set(u.code, node)

    return node
  }

  const treeRoots = roots.map(toTreeNode)

  sortTree(treeRoots)

  return { roots: treeRoots, byCode }
}

export const flattenOrgTree = (roots: OrgUnitTreeNode[]): OrgUnit[] => {
  const out: OrgUnit[] = []

  const walk = (nodes: OrgUnitTreeNode[]) => {
    for (const { children, ...unit } of nodes) {
      out.push(unit)

      if (children.length) walk(children)
    }
  }

  walk(roots)

  return out
}

export const matchesQuery = (node: TreeNode, q: string): boolean => {
  const own = (node.name || '').toLowerCase().includes(q)

  if (own) return true

  return node.children.some((c) => matchesQuery(c, q))
}

/** Коди предків від кореня до батька (для розгортання гілки в акордеоні) */
export const getAncestorCodes = (code: number, byCode: Map<number, TreeNode>) => {
  const ancestors: number[] = []
  let cur = byCode.get(code) ?? null

  while (cur?.parentCode != null) {
    ancestors.push(cur.parentCode)
    cur = byCode.get(cur.parentCode) ?? null
  }

  return ancestors
}

export const getBreadcrumbs = (code: number, byCode: Map<number, TreeNode>) => {
  const out: OrgUnit[] = []
  const seen = new Set<number>()
  let cur = byCode.get(code) ?? null

  while (cur && !seen.has(cur.code)) {
    seen.add(cur.code)
    out.unshift(cur)
    cur = cur.parentCode == null ? null : (byCode.get(cur.parentCode) ?? null)
  }

  return out
}

export const expandAllExpandable = (byCode: Map<number, TreeNode>) => {
  const next = new Set<number>()

  for (const n of byCode.values()) {
    if (n.children.length) next.add(n.code)
  }

  return next
}
