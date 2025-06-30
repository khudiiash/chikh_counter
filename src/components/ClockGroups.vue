<template>
  <div class="clock-container">
    <svg class="clock-face" viewBox="-40 -40 280 280">
      <defs>
        <radialGradient id="clock-bg" cx="50%" cy="50%" r="100%">
          <stop offset="0%" :stop-color="getAccent()" stop-opacity="0.7" />
          <stop offset="100%" :stop-color="getPrimary()" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="dot-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="getAccent()" />
          <stop offset="100%" :stop-color="getPrimary()" />
        </linearGradient>
      </defs>
      <!-- Background circle -->
      <circle cx="100" cy="100" r="90" fill="url(#clock-bg)" />
      <!-- Clock outline -->
      <circle cx="100" cy="100" r="80" class="clock-outline" fill="none" />
      <!-- Hour marks -->
      <g>
        <line v-for="h in 12" :key="h" :x1="getMark(h, 120).x" :y1="getMark(h, 120).y" :x2="getMark(h, 120).x" :y2="getMark(h, 120).y" class="hour-mark" />
      </g>
      <!-- Dots for groups -->
      <g>
        <circle
          v-for="(g, i) in groups"
          :key="g.start + '-dot'"
          :cx="getMark(hourFromGroup(g), 120).x"
          :cy="getMark(hourFromGroup(g), 120).y"
          :r="dotRadius(g.count)"
          class="group-dot"
          :style="dotStyle(i)"
          @click="showCount(i, $event)"
          fill="url(#dot-gradient)"
        />
        <text
          v-for="(g, i) in groups"
          :key="g.start + '-text'"
          :x="getMark(hourFromGroup(g), 120).x"
          :y="getMark(hourFromGroup(g), 120).y"
          text-anchor="middle"
          dominant-baseline="central"
          font-size="12"
          font-weight="bold"
          :fill="getAccent()"
          style="pointer-events: none; user-select: none;"
        >
          {{ g.count }}
        </text>
      </g>
      <!-- Center dot -->
      <circle cx="100" cy="100" r="7" fill="#555555" filter="url(#centerShadow)" />
    </svg>
    <transition name="fade">
      <div v-if="showIdx !== null && groups[showIdx]" class="dot-count" :style="countPosStyle">
        {{ groups[showIdx]?.count }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
})

function hourFromGroup(g) {
  const d = new Date(g.start)
  let h = d.getHours() % 12
  let m = d.getMinutes()
  return h + m / 60
}

function getMark(hour, radius) {
  const angle = ((hour - 3) / 12) * 2 * Math.PI
  return {
    x: 100 + radius * Math.cos(angle),
    y: 100 + radius * Math.sin(angle)
  }
}

function dotRadius(count) {
  return 17;
}

const showIdx = ref(null)
const countPosStyle = ref({})

function showCount(idx, evt) {
  showIdx.value = idx
  // Position the count label near the dot
  const svgRect = evt.target.ownerSVGElement.getBoundingClientRect()
  const dotRect = evt.target.getBoundingClientRect()
  countPosStyle.value = {
    left: `${dotRect.left - svgRect.left + dotRect.width / 2}px`,
    top: `${dotRect.top - svgRect.top - 10}px`
  }
  setTimeout(() => { showIdx.value = null }, 1500)
}

function dotStyle(i) {
  return {
    transition: `r 0.5s cubic-bezier(.68,-0.55,.27,1.55) ${(i * 0.07).toFixed(2)}s`,
    filter: 'drop-shadow(0 2px 8px #43705788)'
  }
}

function getPrimary() {
  return getComputedStyle(document.documentElement).getPropertyValue('--primary')
}

function getAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent')
}

// Debug function: add a group at a given hour, minute, and count
if (typeof window !== 'undefined') {
  window.addDebugGroup = function(hour, minute = 0, count = 1) {
    const now = new Date()
    now.setHours(hour)
    now.setMinutes(minute)
    now.setSeconds(0)
    now.setMilliseconds(0)
    const group = { start: now.getTime(), count }
    // Try to mutate groups if possible (if it's a ref), otherwise emit event
    if (Array.isArray(props.groups)) {
      props.groups.push(group)
    } else {
      // If groups is not directly mutable, emit an event to parent
      const vm = getCurrentInstance()
      if (vm) vm.emit && vm.emit('add-debug-group', group)
    }
    return group
  }
}
</script>

<style scoped>
.clock-container {
  width: 280px;
  height: 280px;
  margin: 0 auto 1.5rem auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 32px var(--primary, #2F5249)55;
  filter: drop-shadow(0 0 64px #00000064)
          drop-shadow(0 0 4px var(--accent, #E3DE61));
  padding: 0;
}
.clock-face {
  width: 100%;
  height: 100%;
  background: none;
  display: block;
}
.clock-outline {
  stroke: var(--primary, #2F5249);
  stroke-width: 2.5;
  filter: drop-shadow(0 2px 8px var(--primary, #2F5249)88);
}
.hour-mark {
  stroke: var(--accent, #E3DE61);
  stroke-width: 2.5;
  stroke-linecap: round;
}
.group-dot {
  stroke: var(--accent, #E3DE61);
  stroke-width: 2;
  cursor: pointer;
  opacity: 0.95;
  transition: fill 0.2s, r 0.5s cubic-bezier(.68,-0.55,.27,1.55);
  filter: drop-shadow(0 2px 8px var(--primary, #2F5249)88);
}
.group-dot:hover {
  filter: drop-shadow(0 2px 8px var(--accent, #E3DE61)88);
  opacity: 1;
}
.dot-count {
  position: absolute;
  background: #fff;
  color: var(--primary, #2F5249);
  font-weight: bold;
  border-radius: 1rem;
  padding: 0.3rem 1.1rem;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px var(--primary, #2F5249)55;
  pointer-events: none;
  z-index: 10;
  left: 50%;
  top: 0;
  transform: translate(-50%, -100%);
  transition: opacity 0.2s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 