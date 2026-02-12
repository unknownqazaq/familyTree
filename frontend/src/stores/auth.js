import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStaff = computed(() => ['admin', 'staff'].includes(user.value?.role))

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    token.value = data.access_token
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    await fetchUser()
  }

  async function register(email, password, firstName, lastName) {
    await api.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await api.get('/auth/me')
      user.value = data
    } catch {
      logout()
    }
  }

  async function updateProfile(profileData) {
    await api.put('/auth/settings', profileData)
    await fetchUser()
  }

  async function deleteAccount() {
    await api.delete('/auth/account')
    logout()
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  // Initialize: fetch user if token exists
  if (token.value) {
    fetchUser()
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isStaff,
    login,
    register,
    fetchUser,
    updateProfile,
    deleteAccount,
    logout,
  }
})
