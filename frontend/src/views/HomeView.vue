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

    <section class="features" aria-labelledby="features-heading">
      <h2 id="features-heading" class="sr-only">{{ t('home.featuresHeading') }}</h2>
      <div class="feature card">
        <div class="feature-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3>{{ t('home.features.visual.title') }}</h3>
        <p>{{ t('home.features.visual.body') }}</p>
      </div>
      <div class="feature card">
        <div class="feature-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </div>
        <h3>{{ t('home.features.connections.title') }}</h3>
        <p>{{ t('home.features.connections.body') }}</p>
      </div>
      <div class="feature card">
        <div class="feature-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <h3>{{ t('home.features.collab.title') }}</h3>
        <p>{{ t('home.features.collab.body') }}</p>
      </div>
    </section>
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
  color: var(--c-primary);
  margin-bottom: 10px;
}

.hero h1 {
  font-size: clamp(34px, 5vw, 48px);
  margin-bottom: 12px;
  color: var(--c-text);
  letter-spacing: -0.03em;
}

.hero p {
  font-size: 17px;
  color: var(--c-text-2);
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
  box-shadow: 0 22px 44px var(--c-shadow);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--c-fill-3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--c-primary);
}

.feature h3 {
  margin-bottom: 8px;
  color: var(--c-text);
}

.feature p {
  color: var(--c-text-2);
  font-size: 14px;
}
</style>
