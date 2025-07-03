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
        @dayclick="onDayClick"
      />
    </div>
    <div class="day-info-box">
      <span v-if="selectedDay && selectedDayCount !== null">Чіхів: {{ selectedDayCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Calendar } from 'v-calendar'
import 'v-calendar/style.css'
import { getAllGroupsForCurrentUser } from '../firebase'

const allData = ref({})
const attrs = ref([])
const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDay = ref(null)

function pad(n) { return n.toString().padStart(2, '0') }

function onDayClick(day) {
  // Fix timezone issue: use local date instead of UTC
  const d = day.date
  const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const record = allData.value[dateStr]
  selectedDay.value = dateStr
}

async function getAllGroupData() {
  // Fetch from Firestore
  const groups = await getAllGroupsForCurrentUser()
  const data = {}
  for (const dateStr in groups) {
    const groupArr = groups[dateStr] || []
    const count = groupArr.reduce((sum, g) => sum + g.count, 0)
    // Format dateStr to YYYY-MM-DD (pad month/day)
    const [year, month, day] = dateStr.split('-').map(Number)
    const formatted = `${year}-${pad(month)}-${pad(day)}`
    data[formatted] = count
  }
  return data
}

async function updateMonthData() {
  await nextTick()
  allData.value = await getAllGroupData()
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
    updateMonthData()
    monthTitle = currentMonthTitle;
  }
}

const selectedDayCount = computed(() => {
  if (!selectedDay.value) return null
  return allData.value[selectedDay.value] || 0
})

const paintHighlights = () => {
  const days = document.querySelectorAll('.vc-day')
  const monthMaximumCount = Math.max(...Object.values(allData.value)) || 1;
  days.forEach(cell => {
    const dateStr = [...cell.classList].find(cls => cls.includes('id-')).replace('id-', '')
    if (!dateStr) return;
    const count = allData.value[dateStr] || 0
    if (count === 0) return;
    const highlight = cell.querySelector('.vc-highlight')
    if (!highlight) return;
    const opacity = count / monthMaximumCount;
    highlight.style.opacity = opacity;
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
.themed-calendar :deep(.vc-nav-arrow),
.themed-calendar :deep(.vc-nav-item),
.themed-calendar :deep(.vc-nav-title),
.themed-calendar :deep(.vc-weekday) {
  background: transparent !important;
  color: var(--accent, #E3DE61) !important;
}
.themed-calendar :deep(.vc-popover-content) {
  background: var(--primary, #2F5249) !important;
}
.themed-calendar :deep(.vc-highlights) {
  mix-blend-mode: soft-light;
}

.themed-calendar :deep(.vc-highlight-bg-solid) {
  border-radius: 5px !important;
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
  color: var(--primary, #2F5249);
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.2rem; /* Reserve space to prevent layout shift */
}

</style> 