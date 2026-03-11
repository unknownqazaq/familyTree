import { ref, watch } from 'vue'
import { safeGetItem, safeSetItem } from '../utils/storage'

// Default: dark (Apple style)
const saved = safeGetItem('theme')
const dark = ref(
  saved ? saved === 'dark' : true // dark by default
)

function applyTheme(isDark) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }
}

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
