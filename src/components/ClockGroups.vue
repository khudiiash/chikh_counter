<template>
  <div class="clock-container">
    <svg class="clock-face" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="clock-bg" cx="50%" cy="50%" r="100%">
          <stop offset="0%" :stop-color="getAccent()" stop-opacity="0.4" />
          <stop offset="100%" :stop-color="getPrimary()" stop-opacity="1.0" />
        </radialGradient>
        <linearGradient id="dot-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="getAccent()" />
          <stop offset="100%" :stop-color="getPrimary()" />
        </linearGradient>
      </defs>
      <!-- Background circle -->
      <circle cx="50" cy="50" r="20" fill="url(#clock-bg)" />
      <!-- Clock outline -->
      <circle cx="50" cy="50" r="30" class="clock-outline" fill="none" />
      <!-- Hour marks -->
      <g>
        <line v-for="h in 12" :key="h" :x1="getMark(h, 40).x" :y1="getMark(h, 40).y" :x2="getMark(h, 40).x" :y2="getMark(h, 40).y" class="hour-mark" />
      </g>
      <!-- Dots for groups -->
      <g>
        <g v-for="(g, i) in groups" :key="g.start">
          <circle
            :cx="getMark(hourFromGroup(g), 40).x"
            :cy="getMark(hourFromGroup(g), 40).y"
            :r="dotRadius(g.count)"
            class="group-dot"
            :style="dotStyle(i)"
            fill="url(#dot-gradient)"
          />
          <text
            :x="getMark(hourFromGroup(g), 40).x"
            :y="getMark(hourFromGroup(g), 40).y"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="10"
            font-weight="bold"
            :fill="getAccent()"
            style="pointer-events: none; user-select: none; text-shadow: 0 2px 8px #00000025;"
          >
            {{ g.count }}
          </text>
        </g>
      </g>
      <!-- Center dot -->
      <circle cx="50" cy="50" r="3" fill="#555555" />
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
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle)
  }
}

function dotRadius(count) {
  return 8;
}

const showIdx = ref(null)
const countPosStyle = ref({})


function dotStyle(i) {
  return {
    transition: `r 0.5s cubic-bezier(.68,-0.55,.27,1.55) ${(i * 0.07).toFixed(2)}s`,
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
  width: min(90vw, 90vh);
  height: min(90vw, 90vh);
  aspect-ratio: 1 / 1;
  margin: 0 auto 1.5rem auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 32px var(--primary, #2F5249)55;
  filter: drop-shadow(0 0 4px var(--accent, #E3DE61));
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
  stroke-width: 1;
  filter: drop-shadow(0 2px 8px var(--primary, #2F5249)88);
}
.hour-mark {
  stroke: var(--accent, #E3DE61);
  stroke-width: 2;
  stroke-linecap: round;
}
.group-dot {
  stroke: var(--accent, #E3DE61);
  stroke-width: 0.5;
  cursor: pointer;
  opacity: 0.95;
  transition: fill 0.2s, r 0.5s cubic-bezier(.68,-0.55,.27,1.55);
  filter: drop-shadow(0 2px 8px var(--primary, #2F5249)88);
  background-color: var(--primary, #2F5249);
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