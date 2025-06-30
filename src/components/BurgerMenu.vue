<template>
  <div>
    <button class="burger-btn" @click="openMenu = !openMenu">
      <span></span><span></span><span></span>
    </button>
    <transition name="slide">
      <div v-if="openMenu" class="menu-overlay" @click.self="openMenu = false">
        <nav class="menu-panel">
          <router-link to="/stats" class="menu-link" @click="openMenu = false" aria-label="Статистика">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M4 18V10M9 18V6M15 18V14M20 18V2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </router-link>
          <router-link to="/calendar" class="menu-link" @click="openMenu = false" aria-label="Календар">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 3v4M8 3v4M3 9h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </router-link>
          <router-link to="/settings" class="menu-link" @click="openMenu = false" aria-label="Налаштування">
            <svg viewBox="0 0 45.973 45.973" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.454,18.443h-2.437c-0.453-1.766-1.16-3.42-2.082-4.933l1.752-1.756c0.473-0.473,0.733-1.104,0.733-1.774 c0-0.669-0.262-1.301-0.733-1.773l-2.92-2.917c-0.947-0.948-2.602-0.947-3.545-0.001l-1.826,1.815 C30.9,6.232,29.296,5.56,27.529,5.128V2.52c0-1.383-1.105-2.52-2.488-2.52h-4.128c-1.383,0-2.471,1.137-2.471,2.52v2.607 c-1.766,0.431-3.38,1.104-4.878,1.977l-1.825-1.815c-0.946-0.948-2.602-0.947-3.551-0.001L5.27,8.205 C4.802,8.672,4.535,9.318,4.535,9.978c0,0.669,0.259,1.299,0.733,1.772l1.752,1.76c-0.921,1.513-1.629,3.167-2.081,4.933H2.501 C1.117,18.443,0,19.555,0,20.935v4.125c0,1.384,1.117,2.471,2.501,2.471h2.438c0.452,1.766,1.159,3.43,2.079,4.943l-1.752,1.763 c-0.474,0.473-0.734,1.106-0.734,1.776s0.261,1.303,0.734,1.776l2.92,2.919c0.474,0.473,1.103,0.733,1.772,0.733 s1.299-0.261,1.773-0.733l1.833-1.816c1.498,0.873,3.112,1.545,4.878,1.978v2.604c0,1.383,1.088,2.498,2.471,2.498h4.128 c1.383,0,2.488-1.115,2.488-2.498v-2.605c1.767-0.432,3.371-1.104,4.869-1.977l1.817,1.812c0.474,0.475,1.104,0.735,1.775,0.735 c0.67,0,1.301-0.261,1.774-0.733l2.92-2.917c0.473-0.472,0.732-1.103,0.734-1.772c0-0.67-0.262-1.299-0.734-1.773l-1.75-1.77 c0.92-1.514,1.627-3.179,2.08-4.943h2.438c1.383,0,2.52-1.087,2.52-2.471v-4.125C45.973,19.555,44.837,18.443,43.454,18.443z M22.976,30.85c-4.378,0-7.928-3.517-7.928-7.852c0-4.338,3.55-7.85,7.928-7.85c4.379,0,7.931,3.512,7.931,7.85 C30.906,27.334,27.355,30.85,22.976,30.85z" fill="currentColor"/></svg>
          </router-link>
          <button class="menu-link logout-link" @click="logout" aria-label="Logout">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </nav>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
const openMenu = ref(false)
const router = useRouter()
const logout = async () => {
  await signOut(auth)
  openMenu.value = false
  router.push('/auth')
}
</script>

<style scoped>
.burger-btn {
  position: absolute;
  top: 1.2rem;
  left: 1.2rem;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  z-index: 300;
  box-shadow: 0 2px 8px var(--primary, #2F5249)33;
  cursor: pointer;
}
.burger-btn span {
  display: block;
  width: 24px;
  height: 3px;
  background: var(--accent, #E3DE61);
  border-radius: 2px;
  transition: background 0.2s;
  box-shadow: 0 2px 6px #0004, 0 1px 2px #0002;
}
.menu-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 299;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
}
.menu-panel {
  width: 64px;
  max-height: 90vh;
  background: linear-gradient(135deg, var(--primary, #2F5249) 0%, var(--accent, #E3DE61) 100%);
  box-shadow: 2px 0 16px var(--primary, #2F5249)33;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0.5rem 1.2rem 0.5rem;
  gap: 1.2rem;
  border-top-right-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
  position: relative;
  margin: 3vh 0 3vh 0;
  overflow: hidden;
}
.menu-link {
  color: var(--accent, #E3DE61);
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 1rem;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.menu-link:hover, .menu-link.router-link-exact-active {
  background: var(--accent, #E3DE61)22;
  color: var(--primary, #2F5249);
}
.menu-link svg {
  display: block;
  width: 28px;
  height: 28px;
  color: var(--accent, #E3DE61);
  filter: drop-shadow(0 2px 6px #0002) drop-shadow(0 1px 2px #0001);
}
.menu-panel > .menu-link:last-child {
  margin-bottom: 0.5rem;
}
.logout-link {
  margin-top: auto;
  flex-shrink: 0;
  background: var(--accent, #E3DE61)cc;
  color: var(--primary, #2F5249);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 1.2rem;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px var(--primary, #2F5249)33;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}
.logout-link:hover {
  background: var(--primary, #2F5249);
  color: var(--accent, #E3DE61);
}
.logout-link svg {
  color: var(--accent, #E3DE61);
}
.slide-enter-active, .slide-leave-active {
  transition: opacity 0.2s;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
}
.menu-spacer {
  flex: 1 1 auto;
  width: 100%;
}
@media (max-height: 500px) {
  .menu-panel {
    gap: 0.5rem;
    padding: 0.7rem 0.2rem 0.7rem 0.2rem;
  }
  .menu-link svg {
    width: 22px;
    height: 22px;
  }
  .logout-link {
    font-size: 1rem;
    padding: 0.5rem 0.7rem;
  }
}
</style> 