import type { OrgUnit } from '../../../app/orgStructureApi'

export type TreeNode = OrgUnit & { children: TreeNode[] }

export const buildTree = (items: OrgUnit[]) => {
  const byCode = new Map<number, TreeNode>()

  for (const u of items) byCode.set(u.code, { ...u, children: [] })

  const roots: TreeNode[] = []

  for (const node of byCode.values()) {
    if (node.parentCode == null) {
      roots.push(node)
      continue
    }

    const parent = byCode.get(node.parentCode)

    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const sortRec = (n: TreeNode) => {
    n.children.sort((a, b) => a.sortOrder - b.sortOrder)
    n.children.forEach(sortRec)
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder)
  roots.forEach(sortRec)

  return { roots, byCode }
}

export const matchesQuery = (node: TreeNode, q: string): boolean => {
  const own = (node.name || '').toLowerCase().includes(q)

  if (own) return true

  return node.children.some((c) => matchesQuery(c, q))
}

export const getBreadcrumbs = (code: number, byCode: Map<number, TreeNode>) => {
  const out: OrgUnit[] = []
  const seen = new Set<number>()
  let cur = byCode.get(code) ?? null

  while (cur && !seen.has(cur.code)) {
    seen.add(cur.code)
    out.unshift(cur)
    cur = cur.parentCode == null ? null : byCode.get(cur.parentCode) ?? null
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
