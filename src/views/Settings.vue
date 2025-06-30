<template>
  <div class="settings-container" :style="{ background: gradientBg }">
    <button class="back-btn" @click="$router.push('/')" aria-label="Back">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <h2>Налаштування кольорів</h2>
    <div class="palette-section">
      <div class="palette-label">Основний колір:</div>
      <div class="palette-scroll-mask">
        <div class="palette-options">
          <button v-for="color in basePalette" :key="color" :style="{background: color}" :class="{selected: color === primary}" @click="setPrimary(color)"></button>
        </div>
      </div>
    </div>
    <div class="palette-section">
      <div class="palette-label">Акцент:</div>
      <div class="palette-scroll-mask">
        <div class="palette-options">
          <button v-for="color in accentPalette" :key="color" :style="{background: color}" :class="{selected: color === accent}" @click="setAccent(color)"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const basePalette = [
  '#ffffff', // white
  '#2F5249', // green dark
  '#1976D2', // blue dark
  '#D32F2F', // red dark
  '#7B1FA2', // purple dark
  '#F57C00', // orange dark
  '#388E3C', // green
  '#455A64', // blue-grey
  '#212121', // blackish
]
const accentPalette = [
  '#ffffff', // white
  '#E3DE61', // yellow
  '#64B5F6', // blue
  '#F44336', // red
  '#BA68C8', // purple
  '#FFB74D', // orange
  '#81C784', // green
  '#90A4AE', // blue-grey
  '#FFF176', // bright yellow
]
const primary = ref(basePalette[0])
const accent = ref(accentPalette[0])

function setPrimary(color) {
  primary.value = color
  updateColors()
}
function setAccent(color) {
  accent.value = color
  updateColors()
}
function updateColors() {
  document.documentElement.style.setProperty('--primary', primary.value)
  document.documentElement.style.setProperty('--accent', accent.value)
  localStorage.setItem('color-primary', primary.value)
  localStorage.setItem('color-accent', accent.value)
}
onMounted(() => {
  const p = localStorage.getItem('color-primary')
  const a = localStorage.getItem('color-accent')
  if (p && basePalette.includes(p)) primary.value = p
  if (a && accentPalette.includes(a)) accent.value = a
  updateColors()
})

// --- Gradient helpers ---
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
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1rem 1.5rem 1rem;
  color: #fff;
  box-sizing: border-box;
}
.settings-container h2 {
  margin-bottom: 2rem;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--accent, #E3DE61);
  padding-top: 3.5rem;
}
.palette-section {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.palette-label {
  margin-bottom: 0.7rem;
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: #fff;
  text-align: center;
}
.palette-scroll-mask {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100vw;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  overscroll-behavior-x: contain;
  padding: 0 1.2rem;
  box-sizing: border-box;
}
.palette-options {
  display: block;
  white-space: nowrap;
  min-width: max-content;
  padding-bottom: 0.2rem;
  margin-bottom: 0.2rem;
}
.palette-options button {
  display: inline-block;
  margin-right: 0.7rem;
  margin-bottom: 0;
  width: 40px;
  height: 40px;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: 2.5px solid #fff;
  outline: none;
  cursor: pointer;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px #0002;
  flex: 0 0 auto;
  padding: 0;
}
.palette-options button.selected {
  border: 3.5px solid var(--accent, #E3DE61);
  box-shadow: 0 2px 12px var(--accent, #E3DE61)55;
}
@media (max-width: 600px) {
  .settings-container {
    padding: 1.2rem 0.2rem 1rem 0.2rem;
  }
  .palette-section {
    max-width: 98vw;
  }
  .palette-options button {
    width: 32px;
    height: 32px;
    aspect-ratio: 1/1;
  }
}
.back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
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
.back-btn:active {
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
}
.back-btn svg {
  display: block;
  width: 1em;
  height: 1em;
}
</style> 