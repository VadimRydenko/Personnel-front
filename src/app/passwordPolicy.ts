export const MIN_PASSWORD_LENGTH = 8

/** Пароль діє не довше цього терміну від моменту встановлення (політика). */
export const PASSWORD_MAX_VALIDITY_DAYS = 180
/** Мінімальна частка позицій, де новий пароль відрізняється від поточного (0–1). */
export const MIN_PASSWORD_NOVELTY_RATIO = 0.5

export type PasswordComplexityIssue =
  | 'length'
  | 'upper'
  | 'lower'
  | 'digit'
  | 'special'

export function getPasswordComplexityIssues(password: string): PasswordComplexityIssue[] {
  const issues: PasswordComplexityIssue[] = []

  if (password.length < MIN_PASSWORD_LENGTH) {
    issues.push('length')
  }

  if (!/[\p{Lu}]/u.test(password)) {
    issues.push('upper')
  }

  if (!/[\p{Ll}]/u.test(password)) {
    issues.push('lower')
  }

  if (!/\p{N}/u.test(password)) {
    issues.push('digit')
  }

  if (!/[^\p{L}\p{N}\s]/u.test(password)) {
    issues.push('special')
  }

  return issues
}

export function isPasswordComplexityOk(password: string): boolean {
  return getPasswordComplexityIssues(password).length === 0
}

/**
 * Частка позицій (0–1), де символи відрізняються, з нормалізацією по max довжині.
 * Додаткові символи в довшому рядку вважаються відмінними від «відсутнього» в коротшому.
 */
export function passwordNoveltyRatio(currentPassword: string, newPassword: string): number {
  const L = Math.max(currentPassword.length, newPassword.length, 1)
  let diff = 0

  for (let i = 0; i < L; i++) {
    if (currentPassword[i] !== newPassword[i]) {
      diff++
    }
  }

  return diff / L
}

export function isPasswordNovelEnough(currentPassword: string, newPassword: string): boolean {
  return passwordNoveltyRatio(currentPassword, newPassword) >= MIN_PASSWORD_NOVELTY_RATIO
}

export function complexityIssueLabel(issue: PasswordComplexityIssue): string {
  switch (issue) {
    case 'length':
      return `щонайменше ${MIN_PASSWORD_LENGTH} символів`
    case 'upper':
      return 'щонайменше одна велика літера'
    case 'lower':
      return 'щонайменше одна мала літера'
    case 'digit':
      return 'щонайменше одна цифра'
    case 'special':
      return 'щонайменше один спецсимвол (не літера й не цифра)'
  }
}

/** Дата закінчення дії пароля (180 днів від останньої зміни), якщо відома дата зміни. */
export function passwordValidUntil(changedAtIso: string): Date {
  const changed = new Date(changedAtIso)

  if (Number.isNaN(changed.getTime())) {
    return new Date(NaN)
  }

  const until = new Date(changed)

  until.setDate(until.getDate() + PASSWORD_MAX_VALIDITY_DAYS)

  return until
}

export function isPasswordExpiredByMaxAge(changedAtIso: string | null | undefined, now = new Date()): boolean {
  if (changedAtIso == null || changedAtIso === '') {
    return false
  }

  const until = passwordValidUntil(changedAtIso)

  if (Number.isNaN(until.getTime())) {
    return false
  }

  return now > until
}
