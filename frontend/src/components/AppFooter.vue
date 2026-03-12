<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <span class="footer-copy">&copy; {{ year }} Family Tree</span>
      <nav class="footer-links" aria-label="Footer">
        <a href="#">{{ t('footer.privacy') }}</a>
        <a href="#">{{ t('footer.terms') }}</a>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<style scoped>
.app-footer {
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
  padding: 16px 24px;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.footer-copy {
  font-size: 13px;
  color: var(--c-text-2);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  font-size: 13px;
  color: var(--c-text-2);
  text-decoration: none;
  transition: color 0.15s;
}

.footer-links a:hover {
  color: var(--c-indigo-d);
}
</style>
