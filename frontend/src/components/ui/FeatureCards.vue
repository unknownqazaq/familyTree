<template>
  <section class="feature-cards">
    <div class="section-header">
      <span class="overline">PLATFORM FEATURES</span>
      <h2>How It Works</h2>
    </div>
    <div class="cards-grid">
      <div class="feature-card" v-for="feature in features" :key="feature.title">
        <div class="icon-wrap" v-html="feature.icon"></div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A5276" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    title: 'Visual Tree Explorer',
    description: 'Interactive hierarchical tree with zoom & pan. Navigate thousands of family records visually.',
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    title: 'Find Connections',
    description: 'Trace the path between any two people. Discover shared ancestors and family linkages.',
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A5276" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    title: 'Collaborative Editing',
    description: 'Community-driven with a structured moderation workflow to ensure data accuracy.',
  },
]
</script>

<style scoped>
.feature-cards { padding: 48px 0; }

.section-header { text-align: center; margin-bottom: 32px; }

.overline {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #C9A96E;
  margin-bottom: 8px;
}

h2 { font-size: 24px; font-weight: 600; color: var(--c-text); }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;
}

.feature-card {
  background: var(--c-bg-2);
  border: 1px solid var(--c-border);
  border-top: 3px solid #C9A96E;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.feature-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

.icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--c-fill-3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

h3 { font-size: 16px; font-weight: 600; color: var(--c-text); margin-bottom: 8px; }
p  { font-size: 14px; color: var(--c-text-2); line-height: 1.6; }

@media (max-width: 700px) { .cards-grid { grid-template-columns: 1fr; } }
</style>
