<template>
  <div class="settings-container" :style="{ background: gradientBg }">
    <button class="back-btn" @click="$router.push('/')" aria-label="Back">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
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
  '#E3F0FF', // Soft Blue
  '#4cae4f', // Nature Green
  '#282828', // Modern Dark
  '#FFD6C0', // Peach Fuzz
  '#F8F9FA', // Minimalist Off-White
  '#E6E6FA', // Lavender
];
const accentPalette = [
  '#FFB74D', // Warm Orange
  '#121212', // Black
  '#FF654F', // Neon Flare
  '#71ADBA', // Retro Blue
  '#388E3C', // Emerald
  '#FFFFF0', // Ivory
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
  justify-content: center;
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
  font-family: 'Raleway', sans-serif;
  font-weight: 400;
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: var(--accent, #E3DE61);
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
    padding: 0.7rem 0.1rem 0.7rem 0.1rem;
    min-width: 100vw;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
  }
  .palette-section {
    max-width: 96vw;
    margin-bottom: 1.2rem;
    align-items: center;
  }
  .palette-label {
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }
  .palette-options button {
    width: 28px;
    height: 28px;
    margin-right: 0.4rem;
  }
  .back-btn {
    top: 0.5rem;
    left: 0.5rem;
    font-size: 1.1rem;
    padding: 0.3rem 0.7rem;
    border-radius: 0.9rem;
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