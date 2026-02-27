import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Global loading overlay
  const globalLoading = ref(false)

  // Toast notifications
  const toasts = ref([])

  // Side panel (tree page)
  const sidePanelOpen  = ref(false)
  const sidePanelPerson = ref(null)

  // Modal (add/edit person)
  const modalOpen = ref(false)
  const modalMode = ref('create') // 'create' | 'edit'
  const modalPersonId = ref(null)

  function openSidePanel(person) {
    sidePanelPerson.value = person
    sidePanelOpen.value   = true
  }

  function closeSidePanel() {
    sidePanelOpen.value   = false
    sidePanelPerson.value = null
  }

  function openModal(mode = 'create', personId = null) {
    modalMode.value     = mode
    modalPersonId.value = personId
    modalOpen.value     = true
  }

  function closeModal() {
    modalOpen.value     = false
    modalPersonId.value = null
  }

  function showToast(message, type = 'info', duration = 3500) {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => dismissToast(id), duration)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    globalLoading,
    toasts,
    sidePanelOpen,
    sidePanelPerson,
    modalOpen,
    modalMode,
    modalPersonId,
    openSidePanel,
    closeSidePanel,
    openModal,
    closeModal,
    showToast,
    dismissToast,
  }
})
