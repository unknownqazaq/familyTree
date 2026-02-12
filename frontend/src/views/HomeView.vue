<template>
  <div class="home">
    <div class="hero card">
      <p class="hero-kicker">Welcome to your digital ancestry space</p>
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
.home {
  display: grid;
  gap: 20px;
}

.hero {
  text-align: center;
  padding: 56px 24px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top center, rgba(79, 70, 229, 0.12), transparent 55%);
  pointer-events: none;
}

.hero > * {
  position: relative;
}

.hero-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 10px;
}

.hero h1 {
  font-size: clamp(34px, 5vw, 48px);
  margin-bottom: 12px;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.hero p {
  font-size: 17px;
  color: #475569;
  max-width: 640px;
  margin: 0 auto 28px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-actions a {
  display: inline-block;
  padding: 11px 26px;
  border-radius: 12px;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.feature {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.11);
}

.feature h3 {
  margin-bottom: 8px;
  color: #0f172a;
}

.feature p {
  color: #475569;
  font-size: 14px;
}
</style>
