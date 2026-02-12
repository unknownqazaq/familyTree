<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">Family Tree</router-link>

      <div class="navbar-links">
        <router-link to="/tree">Tree</router-link>
        <template v-if="authStore.isAuthenticated">
          <router-link to="/person/new">Add Person</router-link>
          <router-link v-if="authStore.isStaff" to="/moderation">Moderation</router-link>
          <router-link v-if="authStore.isAdmin" to="/admin">Admin</router-link>
          <router-link to="/settings">Settings</router-link>
          <span class="user-email">{{ authStore.user?.email }}</span>
          <button class="btn-secondary" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.navbar-brand {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.navbar-brand:hover {
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-links a {
  color: #555;
  font-size: 14px;
}

.navbar-links a.router-link-active {
  color: #3498db;
  font-weight: 600;
}

.user-email {
  font-size: 13px;
  color: #888;
}
</style>
