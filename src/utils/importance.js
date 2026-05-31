export const IMPORTANCE_LEVELS = [
  { value: 'critical',     label: 'Critical',     emoji: '🚨', color: 'var(--red)' },
  { value: 'important',    label: 'Important',    emoji: '🔥', color: 'var(--orange)' },
  { value: 'moderate',     label: 'Moderate',     emoji: '📌', color: 'var(--amber)' },
  { value: 'aspirational', label: 'Aspirational', emoji: '💫', color: 'var(--green)' },
]

export const DEFAULT_IMPORTANCE = 'moderate'

export function getImportance(value) {
  return IMPORTANCE_LEVELS.find((l) => l.value === value) ?? IMPORTANCE_LEVELS[2]
}
