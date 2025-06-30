<template>
  <div class="calendar-container">
    <button class="back-btn" @click="$router.push('/')" aria-label="Back">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="calendar-heatmap themed-calendar">
      <Calendar
        v-model="currentMonth"
        :attributes="attrs"
        :show-months="1"
        :title-position="'left'"
        :max-date="today"
        borderless
        transparent
        @update:pages="onUpdate"
      />
    </div>
    <div v-if="selectedDay" class="day-info-box">
      <span>День: {{ selectedDay }}</span>
      <span v-if="selectedDayCount !== null">Чіхів: {{ selectedDayCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Calendar } from 'v-calendar'
import 'v-calendar/style.css'

const allData = ref({})
const attrs = ref([])
const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDay = ref(null)

function pad(n) { return n.toString().padStart(2, '0') }

function getAllGroupData() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('groups_')) {
      const dateStr = key.replace('groups_', '')
      const [year, month, day] = dateStr.split('-').map(Number)
      const groups = JSON.parse(localStorage.getItem(key) || '[]')
      const count = groups.reduce((sum, g) => sum + g.count, 0)
      const formatted = `${year}-${pad(month)}-${pad(day)}`
      data[formatted] = count
    }
  }
  return data
}

async function updateMonthData() {
  await nextTick()
  allData.value = getAllGroupData()
  attrs.value = Object.entries(allData.value).map(([dateStr, count]) => ({
    key: dateStr,
    highlight: true,
    dates: dateStr,
  }))
  nextTick(() => paintHighlights())
}

onMounted(() => {
  updateMonthData()
})

watch(currentMonth, () => {
  updateMonthData()
})

let monthTitle = null;

function onUpdate(e) {
  const currentMonthTitle = e[0].monthTitle
  if (currentMonthTitle !== monthTitle) {
    allData.value = getAllGroupData()
    monthTitle = currentMonthTitle;
  }
}

const selectedDayCount = computed(() => {
  if (!selectedDay.value) return null
  return allData.value[selectedDay.value] || 0
})

const paintHighlights = () => {
  const days = document.querySelectorAll('.vc-day')
  days.forEach(cell => {
    const dateStr = [...cell.classList].find(cls => cls.includes('id-')).replace('id-', '')
    if (!dateStr) return;
    const count = allData.value[dateStr] || 0
    if (count === 0) return;
    const highlights = cell.querySelector('.vc-highlights')
    if (!highlights) return;
    const scale = 0.7 + 0.7 * Math.min(count / 10, 1);
    highlights.style.transform = `scale(${scale})`

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').split(',').map(Number)
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').split(',').map(Number)
    const t = Math.max(0, Math.min(1, (scale - 0.7) / 0.7));
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);
    const r = lerp(accent[0], primary[0], t);
    const g = lerp(accent[1], primary[1], t);
    const b = lerp(accent[2], primary[2], t);
    const color = `rgb(${r},${g},${b})`;
    highlights.style.backgroundColor = color;
  })
}

</script>

<style scoped>
.calendar-container {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--primary, #2F5249) 0%, var(--accent, #E3DE61) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem 1.5rem 1rem;
  box-sizing: border-box;
  width: 100vw;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}
.back-btn {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  background: var(--accent, #E3DE61);
  color: var(--primary, #2F5249);
  border: none;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  box-shadow: 0 2px 8px var(--primary, #2F5249)33;
  transition: background 0.2s, color 0.2s;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.themed-calendar :deep(.vc-blue) {
  --vc-accent-50: var(--accent, #E3DE61);
  --vc-accent-100: var(--accent, #E3DE61);
  --vc-accent-200: var(--accent, #E3DE61);
  --vc-accent-300: var(--accent, #E3DE61);
  --vc-accent-400: var(--accent, #E3DE61);
  --vc-accent-500: var(--accent, #E3DE61);
  --vc-accent-600: var(--accent, #E3DE61);
  color: var(--primary, #2F5249);
}
.themed-calendar :deep(.vc-title),
.themed-calendar :deep(.vc-arrow),
.themed-calendar :deep(.vc-weekday) {
  background: transparent !important;
  color: var(--accent, #E3DE61) !important;
}
.themed-calendar :deep(.vc-highlights) {
  filter: blur(1px);
  border-radius: 10rem;
  mix-blend-mode: soft-light;
}

.themed-calendar :deep(.vc-highlight) {
  filter: blur(1px);
  mix-blend-mode: hard-light;
  border-radius: 10rem;
}

.back-btn:active {
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
}
.back-btn svg {
  display: block;
  width: 1em;
  height: 1em;
}
.day-info-box {
  margin-top: 1.5rem;
  background: var(--accent, #E3DE61);
  color: var(--primary, #2F5249);
  border-radius: 1.2rem;
  padding: 1.1rem 2.2rem;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 2px 12px var(--primary, #2F5249)22;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
</style> 