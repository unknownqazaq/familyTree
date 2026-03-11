<template>
  <div class="app-layout">
    <NavBar />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme'
import NavBar from './components/NavBar.vue'
import AppFooter from './components/AppFooter.vue'

// Initialize theme on app load (applies data-theme to <html>)
useTheme()
</script>

<style>
/* ── Design tokens ─────────────────────────────────────────────────────────── */
:root {
  /* Fonts */
  --font-sans:   'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  --font-serif:  Georgia, 'Times New Roman', 'Playfair Display', serif;

  /* Brand — warm amber */
  --c-primary:        #d97706;
  --c-primary-dark:   #b45309;
  --c-primary-light:  #fde68a;
  --c-primary-glow:   rgba(217, 119, 6, 0.22);

  /* Semantic */
  --c-danger:         #ef4444;
  --c-danger-dark:    #dc2626;
  --c-success:        #10b981;
  --c-success-dark:   #059669;

  /* Backgrounds */
  --c-bg-1:           #fefce8;
  --c-bg-2:           #fff7ed;
  --c-bg-radial-1:    rgba(217, 119, 6, 0.12);
  --c-bg-radial-2:    rgba(194, 65, 12, 0.09);

  /* Surface */
  --c-surface:        rgba(255, 253, 245, 0.92);
  --c-surface-solid:  #fffdf5;
  --c-border:         rgba(231, 219, 200, 0.85);
  --c-shadow:         rgba(28, 25, 23, 0.08);

  /* Text */
  --c-text:           #1c1917;
  --c-muted:          #78716c;

  /* Inputs */
  --c-input-bg:       #faf7f0;
  --c-input-border:   #e7ddd0;
  --c-input-focus:    #d97706;
  --c-input-shadow:   rgba(217, 119, 6, 0.18);

  /* Secondary button */
  --c-secondary-bg:   #f5f0e8;
  --c-secondary-text: #44403c;
  --c-secondary-border: #e7ddd0;
}

/* ── Dark mode tokens ──────────────────────────────────────────────────────── */
[data-theme="dark"] {
  color-scheme: dark;

  --c-primary:        #f59e0b;
  --c-primary-dark:   #d97706;
  --c-primary-light:  #78350f;
  --c-primary-glow:   rgba(245, 158, 11, 0.20);

  --c-bg-1:           #1c1917;
  --c-bg-2:           #0c0a09;
  --c-bg-radial-1:    rgba(245, 158, 11, 0.07);
  --c-bg-radial-2:    rgba(217, 119, 6, 0.05);

  --c-surface:        rgba(41, 37, 36, 0.95);
  --c-surface-solid:  #292524;
  --c-border:         rgba(87, 83, 78, 0.75);
  --c-shadow:         rgba(0, 0, 0, 0.35);

  --c-text:           #fef3c7;
  --c-muted:          #a8a29e;

  --c-input-bg:       #292524;
  --c-input-border:   #57534e;
  --c-input-focus:    #f59e0b;
  --c-input-shadow:   rgba(245, 158, 11, 0.18);

  --c-secondary-bg:   #3c3837;
  --c-secondary-text: #d6d3d1;
  --c-secondary-border: #57534e;
}

/* ── Global reset & base ───────────────────────────────────────────────────── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  font-family: var(--font-sans);
  line-height: 1.5;
  font-weight: 400;
}

body {
  font-family: var(--font-sans);
  color: var(--c-text);
  background:
    radial-gradient(circle at top right, var(--c-bg-radial-1), transparent 42%),
    radial-gradient(circle at top left,  var(--c-bg-radial-2), transparent 35%),
    linear-gradient(180deg, var(--c-bg-1) 0%, var(--c-bg-2) 100%);
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease;
}

/* ── Typography: serif for headings ───────────────────────────────────────── */
h1, h2, h3, h4 {
  font-family: var(--font-serif);
  color: var(--c-text);
}

/* ── Layout ────────────────────────────────────────────────────────────────── */
#app, .app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 32px 24px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* ── Links ─────────────────────────────────────────────────────────────────── */
a {
  color: var(--c-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover { color: var(--c-primary-dark); }

/* ── Buttons ───────────────────────────────────────────────────────────────── */
button {
  cursor: pointer;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-sans);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s;
}

button:hover  { transform: translateY(-1px); }
button:active { transform: translateY(0); }

.btn-primary {
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
  color: #fff;
  box-shadow: 0 8px 20px var(--c-primary-glow);
}
.btn-primary:hover {
  background: linear-gradient(135deg, var(--c-primary-dark) 0%, #92400e 100%);
}

.btn-danger {
  background: linear-gradient(135deg, var(--c-danger) 0%, var(--c-danger-dark) 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.28);
}
.btn-danger:hover {
  background: linear-gradient(135deg, var(--c-danger-dark) 0%, #b91c1c 100%);
}

.btn-success {
  background: linear-gradient(135deg, var(--c-success) 0%, var(--c-success-dark) 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(5, 150, 105, 0.28);
}
.btn-success:hover {
  background: linear-gradient(135deg, var(--c-success-dark) 0%, #047857 100%);
}

.btn-secondary {
  background: var(--c-secondary-bg);
  color: var(--c-secondary-text);
  border: 1px solid var(--c-secondary-border);
  box-shadow: 0 3px 8px var(--c-shadow);
}
.btn-secondary:hover { background: var(--c-input-border); }

/* ── Form elements ─────────────────────────────────────────────────────────── */
input, textarea, select {
  padding: 10px 12px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: var(--font-sans);
  width: 100%;
  background: var(--c-input-bg);
  color: var(--c-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--c-input-focus);
  background: var(--c-surface-solid);
  box-shadow: 0 0 0 4px var(--c-input-shadow);
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 16px 38px var(--c-shadow);
  backdrop-filter: blur(7px);
  margin-bottom: 16px;
}

/* ── Messages ──────────────────────────────────────────────────────────────── */
.error-msg   { color: var(--c-danger);  font-size: 13px; margin-top: 4px; }
.success-msg { color: var(--c-success); font-size: 13px; margin-top: 4px; }

/* ── Page transition ───────────────────────────────────────────────────────── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .main-content { padding: 24px 16px 32px; }
}

@media (max-width: 768px) {
  .main-content { padding: 18px 12px 24px; }
  .card { border-radius: 16px; padding: 18px; margin-bottom: 12px; }
}

@media (max-width: 480px) {
  .main-content { padding: 14px 10px 20px; }
  button { padding: 9px 12px; font-size: 13px; }
  .card  { border-radius: 14px; padding: 14px; }
}
</style>
