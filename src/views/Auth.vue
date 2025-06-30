<template>
  <div class="auth-container" :style="{ background: gradientBg }">
    <h2>Sign In / Register</h2>
    <form @submit.prevent="onSubmit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <div class="auth-actions">
        <button type="button" @click="login">Login</button>
        <button type="button" @click="register">Register</button>
      </div>
      <div v-if="error" class="auth-error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const basePalette = [
  '#2F5249', '#1976D2', '#D32F2F', '#7B1FA2', '#F57C00', '#388E3C', '#455A64', '#212121',
]
const primary = ref(localStorage.getItem('color-primary') && basePalette.includes(localStorage.getItem('color-primary')) ? localStorage.getItem('color-primary') : basePalette[0])
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

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}

const register = async () => {
  error.value = ''
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  }
}

const onSubmit = () => {
  login()
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--primary, #2F5249);
}
.auth-container h2 {
  color: var(--accent, #E3DE61);
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}
.auth-container form {
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 2px 12px var(--primary, #2F5249)22;
  padding: 2rem 2rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 280px;
  max-width: 90vw;
}
.auth-container input {
  width: 90%;
  margin-bottom: 1.2rem;
  padding: 0.9rem 1.2rem;
  border-radius: 1rem;
  border: 1px solid var(--primary, #2F5249)44;
  font-size: 1.1rem;
  outline: none;
}
.auth-actions {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 1rem;
}
.auth-actions button {
  background: var(--accent, #E3DE61);
  color: var(--primary, #2F5249);
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.7rem 2.2rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.auth-actions button:hover {
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
}
.auth-error {
  color: #e74c3c;
  font-size: 1rem;
  margin-top: 0.5rem;
  text-align: center;
}
</style> 