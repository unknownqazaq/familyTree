<template>
  <div class="home">
    <div class="hero card">
      <p class="hero-kicker">{{ t('home.kicker') }}</p>
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>

      <div class="hero-actions">
        <router-link to="/tree" class="btn-primary">{{ t('home.viewTree') }}</router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn-success">
          {{ t('home.getStarted') }}
        </router-link>
        <router-link v-else to="/person/new" class="btn-success">{{ t('home.addPerson') }}</router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature card">
        <h3>{{ t('home.features.visual.title') }}</h3>
        <p>{{ t('home.features.visual.body') }}</p>
      </div>
      <div class="feature card">
        <h3>{{ t('home.features.connections.title') }}</h3>
        <p>{{ t('home.features.connections.body') }}</p>
      </div>
      <div class="feature card">
        <h3>{{ t('home.features.collab.title') }}</h3>
        <p>{{ t('home.features.collab.body') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const { t } = useI18n()
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
