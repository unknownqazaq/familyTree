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

useTheme()
</script>

<style>
/* ── Apple Design Tokens — Dark (default) ────────────────────────────────── */
:root,
[data-theme="dark"] {
  color-scheme: dark;

  /* System font — SF Pro on Apple devices */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text',
               'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', Consolas, monospace;

  /* Backgrounds — layered depth */
  --c-bg:          #000000;
  --c-bg-2:        #1c1c1e;
  --c-bg-3:        #2c2c2e;
  --c-bg-4:        #3a3a3c;

  /* Labels */
  --c-text:        #ffffff;
  --c-text-2:      rgba(235, 235, 245, 0.60);
  --c-text-3:      rgba(235, 235, 245, 0.30);
  --c-text-4:      rgba(235, 235, 245, 0.18);

  /* Fills */
  --c-fill:        rgba(120, 120, 128, 0.36);
  --c-fill-2:      rgba(120, 120, 128, 0.28);
  --c-fill-3:      rgba(118, 118, 128, 0.20);

  /* Separator */
  --c-sep:         rgba(84, 84, 88, 0.65);
  --c-sep-opaque:  #38383a;

  /* Accent — Apple Blue dark */
  --c-primary:     #0a84ff;
  --c-primary-d:   #0070e0;
  --c-primary-glow: rgba(10, 132, 255, 0.25);

  /* System colors */
  --c-red:         #ff453a;
  --c-green:       #32d74b;
  --c-yellow:      #ffd60a;
  --c-orange:      #ff9f0a;

  /* Accent — Gold */
  --c-gold:        #d4a646;
  --c-gold-d:      #b8922e;

  /* Status badges */
  --c-badge-green-bg:  rgba(50, 215, 75, 0.18);
  --c-badge-green-text: #32d74b;
  --c-badge-yellow-bg: rgba(255, 214, 10, 0.18);
  --c-badge-yellow-text: #ffd60a;

  /* Indigo accent */
  --c-indigo:      #6366f1;
  --c-indigo-d:    #4f46e5;
  --c-indigo-glow: rgba(99, 102, 241, 0.25);

  /* Step / progress */
  --c-step-done:   #32d74b;
  --c-step-connector: rgba(120, 120, 128, 0.28);

  /* Surface / glass */
  --c-surface:     rgba(28, 28, 30, 0.80);
  --c-surface-2:   rgba(44, 44, 46, 0.85);
  --c-border:      rgba(255, 255, 255, 0.09);
  --c-border-2:    rgba(255, 255, 255, 0.05);
  --c-shadow:      rgba(0, 0, 0, 0.55);

  /* Inputs */
  --c-input-bg:    rgba(118, 118, 128, 0.18);
  --c-input-border: rgba(84, 84, 88, 0.55);
  --c-input-focus: #0a84ff;
  --c-input-shadow: rgba(10, 132, 255, 0.22);
}

/* ── Apple Design Tokens — Light ─────────────────────────────────────────── */
[data-theme="light"] {
  color-scheme: light;

  --c-bg:          #f2f2f7;
  --c-bg-2:        #ffffff;
  --c-bg-3:        #f2f2f7;
  --c-bg-4:        #e5e5ea;

  --c-text:        #000000;
  --c-text-2:      rgba(60, 60, 67, 0.60);
  --c-text-3:      rgba(60, 60, 67, 0.30);
  --c-text-4:      rgba(60, 60, 67, 0.18);

  --c-fill:        rgba(120, 120, 128, 0.20);
  --c-fill-2:      rgba(120, 120, 128, 0.14);
  --c-fill-3:      rgba(118, 118, 128, 0.10);

  --c-sep:         rgba(60, 60, 67, 0.29);
  --c-sep-opaque:  #c6c6c8;

  --c-primary:     #007aff;
  --c-primary-d:   #0062cc;
  --c-primary-glow: rgba(0, 122, 255, 0.20);

  --c-red:         #ff3b30;
  --c-green:       #34c759;
  --c-yellow:      #ffcc00;
  --c-orange:      #ff9500;

  --c-gold:        #C9A96E;
  --c-gold-d:      #b8922e;

  --c-badge-green-bg:  #d5f5e3;
  --c-badge-green-text: #1e8449;
  --c-badge-yellow-bg: #fef9e7;
  --c-badge-yellow-text: #b7950b;

  --c-indigo:      #6366f1;
  --c-indigo-d:    #4f46e5;
  --c-indigo-glow: rgba(99, 102, 241, 0.18);

  --c-step-done:   #34c759;
  --c-step-connector: rgba(120, 120, 128, 0.20);

  --c-surface:     rgba(255, 255, 255, 0.82);
  --c-surface-2:   rgba(242, 242, 247, 0.88);
  --c-border:      rgba(60, 60, 67, 0.14);
  --c-border-2:    rgba(60, 60, 67, 0.08);
  --c-shadow:      rgba(0, 0, 0, 0.08);

  --c-input-bg:    rgba(118, 118, 128, 0.10);
  --c-input-border: rgba(60, 60, 67, 0.22);
  --c-input-focus: #007aff;
  --c-input-shadow: rgba(0, 122, 255, 0.18);
}

/* ── Reset ───────────────────────────────────────────────────────────────── */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  background: var(--c-bg);
  color: var(--c-text);
  min-height: 100vh;
  transition: background 0.25s ease, color 0.25s ease;
}

/* ── Layout ──────────────────────────────────────────────────────────────── */
#app, .app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 32px 24px 48px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* ── Typography ──────────────────────────────────────────────────────────── */
h1 { font-size: 34px; font-weight: 700; letter-spacing: -0.022em; line-height: 1.12; }
h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.018em; line-height: 1.16; }
h3 { font-size: 22px; font-weight: 600; letter-spacing: -0.012em; }
h4 { font-size: 17px; font-weight: 600; letter-spacing: -0.008em; }

h1, h2, h3, h4 { color: var(--c-text); }

/* ── Links ───────────────────────────────────────────────────────────────── */
a {
  color: var(--c-primary);
  text-decoration: none;
  transition: opacity 0.15s ease;
}
a:hover { opacity: 0.75; }

/* ── Buttons ─────────────────────────────────────────────────────────────── */
button {
  cursor: pointer;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--font-sans);
  letter-spacing: -0.01em;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
button:hover  { opacity: 0.88; transform: none; }
button:active { opacity: 0.70; transform: scale(0.98); }

.btn-primary {
  background: var(--c-primary);
  color: #fff;
  box-shadow: 0 0 0 0 var(--c-primary-glow);
  transition: background 0.15s, box-shadow 0.2s, opacity 0.15s;
}
.btn-primary:hover {
  background: var(--c-primary-d);
  box-shadow: 0 4px 20px var(--c-primary-glow);
  opacity: 1;
}

.btn-danger {
  background: var(--c-red);
  color: #fff;
}

.btn-success {
  background: var(--c-green);
  color: #fff;
}

.btn-secondary {
  background: var(--c-fill);
  color: var(--c-text);
  border: 1px solid var(--c-border);
}
.btn-secondary:hover {
  background: var(--c-fill-2);
  opacity: 1;
}

/* ── Form elements ───────────────────────────────────────────────────────── */
input, textarea, select {
  padding: 10px 14px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  font-size: 15px;
  font-family: var(--font-sans);
  width: 100%;
  background: var(--c-input-bg);
  color: var(--c-text);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  -webkit-font-smoothing: antialiased;
}

input::placeholder, textarea::placeholder {
  color: var(--c-text-3);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--c-input-focus);
  background: var(--c-surface);
  box-shadow: 0 0 0 3px var(--c-input-shadow);
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 32px var(--c-shadow);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  margin-bottom: 16px;
}

/* ── Messages ────────────────────────────────────────────────────────────── */
.error-msg   { color: var(--c-red);   font-size: 13px; margin-top: 4px; }
.success-msg { color: var(--c-green); font-size: 13px; margin-top: 4px; }

/* ── Page transition ─────────────────────────────────────────────────────── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── Scrollbar (dark themed) ─────────────────────────────────────────────── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--c-fill); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: var(--c-fill-2); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1024px) { .main-content { padding: 24px 16px 40px; } }
@media (max-width: 768px)  { .main-content { padding: 20px 14px 32px; }
  .card { border-radius: 16px; padding: 18px; } }
@media (max-width: 480px)  { .main-content { padding: 16px 12px 24px; }
  button { padding: 9px 14px; font-size: 14px; }
  .card  { border-radius: 14px; padding: 14px; } }
</style>
