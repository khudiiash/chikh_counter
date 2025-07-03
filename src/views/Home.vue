<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import ClockGroups from '../components/ClockGroups.vue'
import BurgerMenu from '../components/BurgerMenu.vue'

const primary = ref(localStorage.getItem('color-primary'))

function hexToRgb(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  return [num >> 16, (num >> 8) & 255, num & 255]
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}
function shadeColor(hex, percent) {
  const [r, g, b] = hexToRgb(hex)
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent)
  return rgbToHex([
    Math.round((t - r) * p + r),
    Math.round((t - g) * p + g),
    Math.round((t - b) * p + b)
  ])
}
const gradientBg = computed(() => {
  const base = primary.value
  const light = shadeColor(base, 0.5)
  const dark = shadeColor(base, -0.3)
  return `linear-gradient(135deg, ${light} 0%, ${base} 50%, ${dark} 100%)`
})

const counter = ref(0)
const animateCounter = ref(false)
const groups = ref([])
const allGroups = ref({})
const loading = ref(true)
const today = ref(null)
const viewedDate = ref(new Date())
const isToday = computed(() => {
  if (!today.value) return false
  return (
    viewedDate.value.getFullYear() === today.value.getFullYear() &&
    viewedDate.value.getMonth() === today.value.getMonth() &&
    viewedDate.value.getDate() === today.value.getDate()
  )
})

function formatKey(date) {
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

function setViewedDate(date) {
  viewedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const slideDirection = ref('') // 'left' or 'right' for animation

function handleSwipeRight() {
  // Swipe right (left-to-right): show previous day, slide-right
  const prev = new Date(viewedDate.value)
  prev.setDate(prev.getDate() - 1)
  slideDirection.value = 'right'
  requestAnimationFrame(() => {
    setViewedDate(prev)
  })
}
function handleSwipeLeft() {
  // Swipe left (right-to-left): show next day, slide-left
  if (!isToday.value) {
    const next = new Date(viewedDate.value)
    next.setDate(next.getDate() + 1)
    // Don't go past today
    if (
      next.getFullYear() > today.value.getFullYear() ||
      (next.getFullYear() === today.value.getFullYear() && next.getMonth() > today.value.getMonth()) ||
      (next.getFullYear() === today.value.getFullYear() && next.getMonth() === today.value.getMonth() && next.getDate() > today.value.getDate())
    ) {
      return
    }
    slideDirection.value = 'left'
    requestAnimationFrame(() => {
      setViewedDate(next)
    })
  }
}

function returnToToday() {
  if (!today.value) return;
  if (isToday.value) return
  slideDirection.value = 'left';
  requestAnimationFrame(() => {
    setViewedDate(new Date(today.value.getFullYear(), today.value.getMonth(), today.value.getDate()));
  });
}

function updateTodayGroupsFromAll() {
  const key = formatKey(viewedDate.value)
  groups.value = allGroups.value[key] || []
  const newCount = groups.value.reduce((sum, g) => sum + g.count, 0)
  if (counter.value !== newCount) {
    animateCounter.value = true
    setTimeout(() => { animateCounter.value = false }, 250)
  }
  counter.value = newCount
}

async function loadGroupsFromFirestore() {
  loading.value = true
  const user = auth.currentUser
  if (!user) { loading.value = false; return }
  const userDoc = doc(db, 'users', user.uid)
  const snap = await getDoc(userDoc)
  if (snap.exists()) {
    allGroups.value = snap.data().groups || {}
  } else {
    allGroups.value = {}
  }
  updateTodayGroupsFromAll()
  loading.value = false
}

async function saveGroupsToFirestore() {
  const user = auth.currentUser
  if (!user) return
  const userDoc = doc(db, 'users', user.uid)
  await setDoc(userDoc, { groups: allGroups.value }, { merge: true })
}

function saveTodayGroupsLocally() {
  // Optional: keep localStorage for offline use
  localStorage.setItem('groups_' + formatKey(viewedDate.value), JSON.stringify(groups.value))
}

async function increment() {
  const t = new Date().getTime()
  const key = formatKey(viewedDate.value)
  if (!allGroups.value[key]) allGroups.value[key] = []
  const todayGroups = allGroups.value[key]
  if (todayGroups.length === 0) {
    todayGroups.push({ start: t, count: 1 })
  } else {
    const last = todayGroups[todayGroups.length - 1]
    const time = 30 * 60 * 1000; // 30 minutes
    if (t - last.start < time) {
      last.count++
    } else {
      todayGroups.push({ start: t, count: 1 })
    }
  }
  groups.value = todayGroups
  counter.value = groups.value.reduce((sum, g) => sum + g.count, 0)
  allGroups.value[key] = todayGroups
  saveTodayGroupsLocally()
  await saveGroupsToFirestore()
}

const router = useRouter()
const handleLogout = async () => {
  await signOut(auth)
  router.push('/auth')
}

const todayLabel = computed(() => {
  const d = viewedDate.value
  // Format: Friday, June 7 (localized)
  return d.toLocaleDateString('uk-UA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
    .replace(/^./, c => c.toUpperCase()) // capitalize first letter
})

watch(viewedDate, updateTodayGroupsFromAll)

const grayscaleAmount = computed(() => isToday.value ? 0 : 1)

onMounted(() => {
  const d = new Date()
  today.value = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  setViewedDate(new Date(today.value))
  loadGroupsFromFirestore()
})
</script>

<template>
  <main
    class="main-container"
    :style="{ background: gradientBg, filter: `grayscale(${grayscaleAmount})`, transition: 'filter 0.4s' }"
    v-touch:swipe.right="handleSwipeRight"
    v-touch:swipe.left="handleSwipeLeft"
  >
    <BurgerMenu />
    <div class="today-label-fixed">{{ todayLabel }}</div>
    <div class="slide-parent">
      <transition :name="slideDirection === 'left' ? 'slide-left' : slideDirection === 'right' ? 'slide-right' : ''" mode="out-in" @after-enter="slideDirection = ''">
        <div class="swipe-content" :key="formatKey(viewedDate)">
          <div class="spacer-top"></div>
          <div class="center-content">
            <div class="counter" :class="{ animated: animateCounter }">{{ counter }}</div>
            <ClockGroups :groups="groups" />
          </div>
          <div class="spacer-bottom"></div>
          <button class="tap-btn" @click="isToday ? increment() : returnToToday()">{{ isToday ? 'ЧІХ' : 'Назад' }}</button>
        </div>
      </transition>
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@700;900&display=swap');
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  padding: 0;
}
.slide-parent {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.swipe-content {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  box-sizing: border-box;
  padding: 0 0 0 0;
}
/* Slide transition animations for content */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(.55,0,.1,1);
  will-change: transform;
}
.slide-left-enter-from {
  transform: translateX(100vw);
}
.slide-left-leave-to {
  transform: translateX(-100vw);
}
.slide-right-enter-from {
  transform: translateX(-100vw);
}
.slide-right-leave-to {
  transform: translateX(100vw);
}
.today-label-fixed {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 110;
  width: max-content;
  min-width: 120px;
  max-width: 90vw;
  pointer-events: none;
  text-align: center;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 500;
  color: var(--accent, #E3DE61);
  letter-spacing: 0.01em;
  text-shadow: 0 1px 8px #0003;
  user-select: none;
}
.spacer-top {
  flex: 1 1 0;
}
.spacer-bottom {
  flex: 1 1 0;
}
.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}
.counter {
  font-size: clamp(4.2rem, 10vw, 4rem);
  font-weight: 400;
  color: #fff;
  text-align: center;
  background: var(--accent, #E3DE61);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 4px #0002) drop-shadow(0 0 16px var(--accent, #E3DE61));
  will-change: filter;
  transition: transform 0.2s cubic-bezier(.68,-0.55,.27,1.55), text-shadow 0.3s;
  perspective: 80px;
  transform-style: preserve-3d;
  margin-bottom: 0;
}
.counter.animated {
  transform: scale(1.18) rotateX(8deg);
  text-shadow:
    0 0 32px var(--accent, #E3DE61)cc,
    0 2px 16px #000a,
    0 8px 32px var(--primary, #2F5249)66;
}
.ClockGroups, .clock-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  width: min(70vw, 60vh, 400px);
  height: min(70vw, 60vh, 400px);
  aspect-ratio: 1/1;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  box-sizing: border-box;
}
.tap-btn {
  width: 100px;
  height: 60px;
  border-radius: 20px;
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  box-shadow: 0 0px 16px var(--primary, #E3DE61);
  cursor: pointer;
  margin-bottom: 2.5rem;
  margin-top: 2.5rem;
  align-self: center;
  position: static;
  left: unset;
  bottom: unset;
  transform: none;
  z-index: 110;
}
.logout-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
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
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logout-btn:active {
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
}
.logout-btn svg {
  display: block;
  width: 1.7em;
  height: 1.7em;
}
.groups-section {
  width: min(90vw, 400px);
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px var(--primary, #2F5249)11;
  padding: 1.5rem 1rem 1rem 1rem;
  margin-bottom: 1rem;
  max-height: 40vh;
  display: flex;
  flex-direction: column;
}
.groups-section h3 {
  text-align: center;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: var(--accent, #E3DE61);
  margin-bottom: 1.2rem;
  font-weight: 700;
}
.groups-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
}
.groups-section li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--primary, #2F5249)11;
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  margin-bottom: 0.8rem;
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: var(--primary, #2F5249);
}
.group-count {
  font-weight: bold;
  font-size: clamp(1.1rem, 2vw, 1.2rem);
  color: var(--accent, #E3DE61);
}
.fab {
  position: fixed;
  right: 2.2rem;
  bottom: 6.5rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent, #E3DE61) 60%, var(--primary, #2F5249) 100%);
  color: var(--primary, #2F5249);
  font-size: 2.2rem;
  border: none;
  box-shadow: 0 4px 16px var(--primary, #2F5249)33;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  transition: background 0.2s, box-shadow 0.2s;
}
.fab:active {
  background: linear-gradient(135deg, var(--primary, #2F5249) 60%, var(--accent, #E3DE61) 100%);
  box-shadow: 0 2px 8px var(--accent, #E3DE61)55;
}
/* Portrait */
@media (orientation: portrait) {
  .main-container {
    padding: 1.2rem 0.2rem 1rem 0.2rem;
  }
  .tap-btn {
    margin-bottom: 4rem;
  }
  .groups-section {
    padding: 1rem 0.2rem 0.5rem 0.2rem;
  }
  .fab {
    right: 1rem;
    bottom: 5.2rem;
    width: 56px;
    height: 56px;
    font-size: 1.7rem;
  }
}
/* Landscape */
@media (orientation: landscape) {
  .swipe-content {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .spacer-top, .spacer-bottom {
    display: none;
  }
  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex: 1 1 auto;
    gap: 0rem;
    margin-top: 2.0rem;
    margin-bottom: 0;
    min-width: 0;
    min-height: 0;
  }
  .tap-btn {
    position: fixed;
    right: 4vw;
    top: 50%;
    left: auto;
    bottom: auto;
    transform: translateY(-50%);
    margin: 0;
    z-index: 120;
  }
  .fab {
    right: 2.5vw;
    bottom: 6.5vw;
    width: 56px;
    height: 56px;
    font-size: 1.7rem;
  }
}
* {
  user-select: none;
}
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  user-select: none;
}
.clock-container {
  will-change: filter;
}
</style> 