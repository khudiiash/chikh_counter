<template>
  <div class="statistics-container">
    <button class="back-btn" @click="$router.push('/')" aria-label="Back">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="toggle-segment">
      <button
        :class="['toggle-btn', { active: selected === 'week' }]"
        @click="selected = 'week'"
      >
         Тиждень 
      </button>
      <button
        :class="['toggle-btn', { active: selected === 'month' }]"
        @click="selected = 'month'"
      >
        Місяць
      </button>
    </div>
    <div class="stats-chart">
      <LineChart ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend)

const selected = ref('week')
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру']

function getAllGroupData() {
  // Scan localStorage for all keys matching groups_YYYY-M-D
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('groups_')) {
      const dateStr = key.replace('groups_', '')
      const [year, month, day] = dateStr.split('-').map(Number)
      const groups = JSON.parse(localStorage.getItem(key) || '[]')
      const count = groups.reduce((sum, g) => sum + g.count, 0)
      data[dateStr] = { year, month, day, count }
    }
  }
  return data
}

const allData = ref({})
const chartRef = ref(null)

onMounted(() => {
  allData.value = getAllGroupData()
  nextTick(() => {
    if (chartRef.value && chartRef.value.chart) {
      chartRef.value.chart.update()
    }
  })
})

const chartData = computed(() => {
  const now = new Date()
  if (selected.value === 'week') {
    // Get last 7 days
    const labels = []
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const label = weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1] // JS: 0=Sun
      labels.push(label)
      const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
      const entry = allData.value[key]
      data.push(entry ? entry.count : 0)
    }
    return {
      labels,
      datasets: [
        {
          label: 'Чіхи',
          data,
          fill: true,
          borderColor: '#fff',
          backgroundColor: (ctx) => {
            const chart = ctx.chart
            const {ctx: canvasCtx, chartArea} = chart
            if (!chartArea) {
              // Fallback to accent color if chartArea is not ready
              return getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61'
            }
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61'
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#2F5249'
            gradient.addColorStop(0, accent)
            gradient.addColorStop(1, primary)
            return gradient
          },
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61',
          pointHoverRadius: 7
        }
      ]
    }
  } else {
    // Monthly: sum by month for current year
    const year = now.getFullYear()
    const monthSums = Array(12).fill(0)
    Object.values(allData.value).forEach(entry => {
      if (entry.year === year) {
        monthSums[entry.month-1] += entry.count
      }
    })
    return {
      labels: months,
      datasets: [
        {
          label: 'Clicks',
          data: monthSums,
          fill: true,
          borderColor: '#fff',
          backgroundColor: (ctx) => {
            const chart = ctx.chart
            const {ctx: canvasCtx, chartArea} = chart
            console.log('Chart backgroundColor ctx:', ctx)
            if (!chartArea) {
              // Fallback to accent color if chartArea is not ready
              return getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61'
            }
            const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61'
            const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#2F5249'
            gradient.addColorStop(0, accent)
            gradient.addColorStop(1, primary)
            return gradient
          },
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#42b883',
          pointHoverRadius: 7
        }
      ]
    }
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61', font: { size: 14 } }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.15)' },
      ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#E3DE61', font: { size: 14 } }
    }
  }
}

const LineChart = Line

</script>

<style scoped>
.statistics-container {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  background: linear-gradient(180deg, var(--primary, #2F5249) 0%, var(--accent, #E3DE61) 100%);
}
.back-btn {
  position: fixed;
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
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
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
.toggle-segment {
  display: flex;
  background: var(--primary, #181818)cc;
  border-radius: 2rem;
  padding: 2px;
  width: 160px;
  margin: 0 auto 1.2rem auto;
  border: 1.5px solid var(--accent, #E3DE61);
  box-sizing: border-box;
  justify-content: center;
  position: fixed;
  top: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 250;
  backdrop-filter: blur(8px);
}
.toggle-btn {
  flex: 1 1 0;
  border: none;
  background: transparent;
  color: var(--accent, #E3DE61);
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 2rem;
  padding: 0.5rem 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  outline: none;
  z-index: 1;
}
.toggle-btn.active {
  background: var(--accent, #E3DE61);
  color: var(--primary, #2F5249);
  box-shadow: 0 2px 8px var(--accent, #E3DE61)33;
  z-index: 2;
}
.stats-chart {
  flex: 1 1 auto;
  width: 90vw;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0 1.2rem 0 1.2rem;
}
@media (orientation: landscape) {
  .statistics-container {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 2vw;
    gap: 3vw;
  }
  .toggle-segment {
    top: 1.2rem;
    left: 50%;
    bottom: auto;
    transform: translateX(-50%);
    margin: 0;
    z-index: 250;
  }
  .back-btn {
    top: 1.2rem;
    left: 1.2rem;
    bottom: auto;
    z-index: 300;
  }
  .stats-chart {
    flex: 1 1 0;
    width: 70vw;
    max-width: 1000px;
    height: 80vh;
    min-height: 320px;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    padding: 0 2vw;
  }
}
</style> 