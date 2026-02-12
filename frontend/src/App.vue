<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style>
:root {
  font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: inherit;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.14), transparent 42%),
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.14), transparent 35%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
}

#app {
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

a {
  color: #4f46e5;
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: #4338ca;
}

button {
  cursor: pointer;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 10px 22px rgba(79, 70, 229, 0.28);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.28);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 18px rgba(5, 150, 105, 0.28);
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-secondary {
  background: #e2e8f0;
  color: #334155;
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 10px rgba(51, 65, 85, 0.12);
}

.btn-secondary:hover {
  background: #cbd5e1;
}

input,
textarea,
select {
  padding: 10px 12px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  font-size: 14px;
  width: 100%;
  background: #f8fafc;
  color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #818cf8;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18);
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(7px);
  margin-bottom: 16px;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 4px;
}

.success-msg {
  color: #27ae60;
  font-size: 13px;
  margin-top: 4px;
}
</style>
