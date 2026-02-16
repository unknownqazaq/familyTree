const memoryStore = new Map()

function canUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

export function safeGetItem(key) {
  if (canUseLocalStorage()) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      // fall back to in-memory storage for restricted environments
    }
  }
  return memoryStore.has(key) ? memoryStore.get(key) : null
}

export function safeSetItem(key, value) {
  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(key, value)
      return
    } catch {
      // fall back to in-memory storage for restricted environments
    }
  }
  memoryStore.set(key, value)
}

export function safeRemoveItem(key) {
  if (canUseLocalStorage()) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore and clear in-memory fallback below
    }
  }
  memoryStore.delete(key)
}
