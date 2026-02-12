<template>
  <div class="home">
    <div class="hero card">
      <h1>Family Tree</h1>
      <p>Explore and manage your family history. Add family members, build your tree, and discover connections.</p>

      <div class="hero-actions">
        <router-link to="/tree" class="btn-primary">View Tree</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn-success">Get Started</router-link>
        <router-link v-else to="/person/new" class="btn-success">Add Person</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature card">
        <h3>Visual Tree</h3>
        <p>Interactive family tree visualization with clickable nodes and hierarchical layout.</p>
      </div>
      <div class="feature card">
        <h3>Find Connections</h3>
        <p>Discover the path between any two family members through their common ancestors.</p>
      </div>
      <div class="feature card">
        <h3>Collaborative</h3>
        <p>Multiple users can contribute to the family tree with moderation and access control.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 48px 24px;
  margin-bottom: 32px;
}

.hero h1 {
  font-size: 36px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.hero p {
  font-size: 16px;
  color: #666;
  max-width: 500px;
  margin: 0 auto 24px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.hero-actions a {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 600;
  color: white;
  text-decoration: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.feature h3 {
  margin-bottom: 8px;
  color: #2c3e50;
}

.feature p {
  color: #666;
  font-size: 14px;
}
</style>
