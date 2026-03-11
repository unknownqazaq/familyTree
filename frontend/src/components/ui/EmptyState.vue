<template>
  <div class="empty-state">
    <div class="empty-illustration">
      <!-- Search / no results -->
      <svg v-if="type === 'search'" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="#eef2ff" stroke="#c7d2fe" stroke-width="2"/>
        <circle cx="36" cy="35" r="14" stroke="#818cf8" stroke-width="3" fill="none"/>
        <line x1="46.5" y1="46.5" x2="58" y2="58" stroke="#818cf8" stroke-width="3" stroke-linecap="round"/>
        <line x1="30" y1="35" x2="42" y2="35" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round"/>
        <line x1="36" y1="29" x2="36" y2="41" stroke="#a5b4fc" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <!-- Moderation / all clear -->
      <svg v-else-if="type === 'moderation'" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
        <path d="M40 14c-5 0-14 3.5-14 3.5V42c0 10 14 18 14 18s14-8 14-18V17.5S45 14 40 14z" fill="#d1fae5" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/>
        <polyline points="30,41 37,48 52,33" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>

      <!-- Backup / no data -->
      <svg v-else-if="type === 'backup'" width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="#f0f9ff" stroke="#bae6fd" stroke-width="2"/>
        <rect x="22" y="26" width="36" height="28" rx="4" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2.5"/>
        <rect x="28" y="32" width="10" height="8" rx="2" fill="#bae6fd"/>
        <rect x="42" y="32" width="10" height="2" rx="1" fill="#7dd3fc"/>
        <rect x="42" y="36" width="7" height="2" rx="1" fill="#7dd3fc"/>
        <path d="M32 54 L32 62 M40 54 L40 62 M48 54 L48 62" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <path d="M26 62 L54 62" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <!-- General / empty -->
      <svg v-else width="80" height="80" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="38" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <path d="M24 50 L24 36 L32 28 L56 28 L56 50 L24 50Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/>
        <path d="M24 36 L32 36 L32 28" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round" fill="none"/>
        <line x1="32" y1="41" x2="48" y2="41" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
        <line x1="32" y1="46" x2="43" y2="46" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>

    <h3 class="empty-title">
      <template v-if="query">{{ noResultsLabel }} "{{ query }}"</template>
      <template v-else>{{ message || defaultMessage }}</template>
    </h3>

    <p class="empty-body">
      <template v-if="query">{{ queryDescription }}</template>
      <template v-else>{{ description || defaultDescription }}</template>
    </p>

    <slot name="action">
      <router-link v-if="actionTo" :to="actionTo" class="btn-primary empty-action">
        {{ actionLabel || defaultActionLabel }}
      </router-link>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  type:        { type: String, default: 'general' }, // 'search' | 'moderation' | 'backup' | 'general'
  query:       { type: String, default: '' },
  message:     { type: String, default: '' },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  actionTo:    { type: String, default: '' },
})

const { locale } = useI18n()

const isRu = computed(() => locale.value === 'ru')
const isKk = computed(() => locale.value === 'kk')

const noResultsLabel = computed(() => {
  if (isRu.value) return 'Ничего не найдено по запросу'
  if (isKk.value) return 'Сұрау бойынша нәтиже жоқ'
  return 'No results for'
})

const queryDescription = computed(() => {
  if (isRu.value) return 'Попробуйте другое написание, меньше слов, или просмотрите всё дерево.'
  if (isKk.value) return 'Басқа жазылуды қолданып көріңіз немесе бүкіл ағашты шолыңыз.'
  return 'Try a different spelling, fewer words, or browse the full tree.'
})

const defaultMessage = computed(() => {
  if (props.type === 'moderation') {
    if (isRu.value) return 'Всё проверено!'
    if (isKk.value) return 'Бәрі тексерілді!'
    return 'All clear!'
  }
  if (props.type === 'backup') {
    if (isRu.value) return 'Резервных копий нет'
    if (isKk.value) return 'Сақтық көшірмелер жоқ'
    return 'No backups yet'
  }
  if (isRu.value) return 'Здесь пока ничего нет'
  if (isKk.value) return 'Мұнда әлі ештеңе жоқ'
  return 'Nothing here yet'
})

const defaultDescription = computed(() => {
  if (props.type === 'moderation') {
    if (isRu.value) return 'Нет записей, ожидающих модерации. Когда пользователи добавят новых людей, они появятся здесь.'
    if (isKk.value) return 'Модерация күтетін жазбалар жоқ. Пайдаланушылар жаңа адамдар қосқанда, олар осында пайда болады.'
    return 'No entries awaiting moderation. When users add new people, they will appear here for review.'
  }
  if (props.type === 'backup') {
    if (isRu.value) return 'Резервные копии ещё не создавались. Создайте первую, чтобы защитить данные.'
    if (isKk.value) return 'Сақтық көшірмелер әлі жасалған жоқ. Деректерді қорғау үшін алғашқысын жасаңыз.'
    return 'No backups have been created yet. Create your first backup to protect your data.'
  }
  if (isRu.value) return 'Загляните позже или попробуйте другой поиск.'
  if (isKk.value) return 'Кейінірек қараңыз немесе басқа іздеуді қолданып көріңіз.'
  return 'Check back later or try a different search.'
})

const defaultActionLabel = computed(() => {
  if (isRu.value) return 'Просмотреть дерево'
  if (isKk.value) return 'Ағашты шолу'
  return 'Browse Full Tree'
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 24px;
  max-width: 420px;
  margin: 0 auto;
  gap: 14px;
}

.empty-illustration {
  margin-bottom: 8px;
  filter: drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08));
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin: 0;
}

.empty-body {
  font-size: 14px;
  color: #64748b;
  line-height: 1.65;
  margin: 0;
  max-width: 340px;
}

.empty-action {
  display: inline-block;
  margin-top: 6px;
  text-decoration: none;
}
</style>
