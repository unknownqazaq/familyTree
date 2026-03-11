import { ref, watch } from 'vue'
import { safeGetItem, safeSetItem } from '../utils/storage'

// Singleton reactive state shared across all component instances
const dark = ref(
  safeGetItem('theme') === 'dark' ||
  (!safeGetItem('theme') && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
)

function applyTheme(isDark) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }
}

// Apply immediately on module load
applyTheme(dark.value)

watch(dark, (isDark) => {
  applyTheme(isDark)
  safeSetItem('theme', isDark ? 'dark' : 'light')
})

export function useTheme() {
  return {
    dark,
    toggle: () => { dark.value = !dark.value },
  }
}
