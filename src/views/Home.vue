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
const now = () => new Date()
const todayKey = () => {
  const d = now()
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

function updateTodayGroupsFromAll() {
  const today = todayKey()
  groups.value = allGroups.value[today] || []
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
  localStorage.setItem('groups_' + todayKey(), JSON.stringify(groups.value))
}

async function increment() {
  const t = now().getTime()
  const today = todayKey()
  if (!allGroups.value[today]) allGroups.value[today] = []
  const todayGroups = allGroups.value[today]
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
  allGroups.value[today] = todayGroups
  saveTodayGroupsLocally()
  await saveGroupsToFirestore()
}

const router = useRouter()
const handleLogout = async () => {
  await signOut(auth)
  router.push('/auth')
}

onMounted(() => {
  loadGroupsFromFirestore()
})
</script>

<template>
  <main class="main-container" :style="{ background: gradientBg }">
    <BurgerMenu />
    <div class="counter" :class="{ animated: animateCounter }">{{ counter }}</div>
    <ClockGroups :groups="groups" />
    <button class="tap-btn" @click="increment">ЧІХ</button>
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
.counter {
  margin-bottom: 1.5rem;
  font-size: clamp(4.2rem, 6vw, 4rem);
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
}
.tap-btn {
  position: fixed;
  left: 50%;
  bottom: 2.5rem;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 100px;
  border-radius: 50px;
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  box-shadow: 0 0px 16px var(--primary, #E3DE61);
  cursor: pointer;
  margin-bottom: 0;
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
@media (max-width: 600px) {
  .main-container {
    padding: 1.2rem 0.2rem 1rem 0.2rem;
  }
  .groups-section {
    padding: 1rem 0.2rem 0.5rem 0.2rem;
  }
  .tap-btn {
    width: 96vw;
    font-size: 1rem;
    bottom: 1.2rem;
    padding: 1.1rem 0;
  }
  .fab {
    right: 1rem;
    bottom: 5.2rem;
    width: 56px;
    height: 56px;
    font-size: 1.7rem;
  }
}
@media (orientation: landscape) {
  .tap-btn {
    left: auto;
    right: 2.5rem;
    top: 50%;
    bottom: auto;
    transform: translateY(-50%);
    width: 80px;
    height: 80px;
    max-width: 80px;
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