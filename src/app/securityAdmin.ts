import type { MeResponse } from './meApi'

export const SECURITY_ADMIN_ROLE_NAME = 'SECURITY_ADMIN'

export function hasSecurityAdminRole(profile: MeResponse | undefined): boolean {
  return (profile?.roles ?? []).some((r) => r.roleName === SECURITY_ADMIN_ROLE_NAME)
}
