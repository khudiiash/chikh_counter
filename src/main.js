import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Statistics from './components/Statistics.vue'
import Auth from './views/Auth.vue'
import Settings from './views/Settings.vue'
import Calendar from './views/Calendar.vue'
import { auth } from './firebase'

const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/stats', component: Statistics, meta: { requiresAuth: true } },
  { path: '/calendar', component: Calendar, meta: { requiresAuth: true } },
  { path: '/auth', component: Auth },
  { path: '/settings', component: Settings, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const user = auth.currentUser
  if (requiresAuth && !user) {
    // Wait for Firebase to init
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      if (user) next()
      else next('/auth')
    })
  } else {
    next()
  }
})

// Load color preferences on startup
const primary = localStorage.getItem('color-primary') || '#2F5249'
const accent = localStorage.getItem('color-accent') || '#E3DE61'
document.documentElement.style.setProperty('--primary', primary)
document.documentElement.style.setProperty('--accent', accent)

createApp(App).use(router).mount('#app')
