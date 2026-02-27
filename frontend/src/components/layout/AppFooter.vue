<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-col footer-brand">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="brand-name">Шежіре</span>
        </div>
        <p class="brand-tagline">Genealogy Platform — Preserving family heritage across generations.</p>
      </div>
      <div class="footer-col">
        <h5 class="col-heading">NAVIGATION</h5>
        <ul class="footer-links">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/tree">Tree</router-link></li>
          <li><router-link to="/search">Search</router-link></li>
          <li><router-link to="/register">Register</router-link></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 class="col-heading">RESOURCES</h5>
        <ul class="footer-links">
          <li><router-link to="/about">About</router-link></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Guidelines</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h5 class="col-heading">CONTACT</h5>
        <ul class="footer-links">
          <li><a href="mailto:info@shezhire.kz">info@shezhire.kz</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Genealogy Platform</span>
      <div class="footer-legal">
        <a href="#">Privacy</a>
        <span>·</span>
        <a href="#">Terms</a>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background: #1C2833;
  color: rgba(255,255,255,0.6);
  font-size: 13px;
  margin-top: auto;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 24px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.brand-name { font-size: 18px; font-weight: 700; color: #fff; }

.brand-tagline { font-size: 13px; line-height: 1.6; max-width: 260px; }

.col-heading {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  margin-bottom: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
.footer-links a:hover { color: #fff; }

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-legal { display: flex; gap: 12px; align-items: center; }
.footer-legal a { color: rgba(255,255,255,0.6); text-decoration: none; }
.footer-legal a:hover { color: #fff; }

@media (max-width: 768px) {
  .footer-content { grid-template-columns: 1fr 1fr; }
  .footer-brand { grid-column: 1 / -1; }
}
</style>
