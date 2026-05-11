<template>
  <div :class="styles.app">
    <header v-if="showHeader" :class="styles.header">
      <div :class="styles.headerContent">
        <router-link to="/" :class="styles.logo">🖨️ BambuCalc</router-link>
        <nav :class="styles.nav">
          <span v-if="currentUser" :class="styles.userInfo"> Bonjour, {{ currentUser.name }} </span>
          <router-link v-if="!isAuth" to="/login" :class="styles.navLink">Connexion</router-link>
          <router-link v-if="!isAuth" to="/signup" :class="[styles.navLink, styles.highlight]">
            Créer un compte
          </router-link>
          <button v-if="isAuth" @click="logout" :class="[styles.navLink, styles.logoutBtn]">
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script>
import { isAuthenticated, getCurrentUser, logout as authLogout } from './utils/auth'

export default {
  name: 'App',
  data() {
    return {
      isAuth: false,
      currentUser: null,
    }
  },
  created() {
    this.checkAuth()
  },
  computed: {
    showHeader() {
      return !['landing', 'login', 'signup'].includes(this.$route.name)
    },
  },
  methods: {
    checkAuth() {
      this.isAuth = isAuthenticated()
      this.currentUser = getCurrentUser()
    },
    logout() {
      authLogout()
      this.isAuth = false
      this.currentUser = null
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>

<style module="styles">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app {
  min-height: 100vh;
}

.header {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.headerContent {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.7;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.userInfo {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

.navLink {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.navLink:hover {
  color: #667eea;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.highlight:hover {
  color: white;
  opacity: 0.9;
}

.logoutBtn {
  background: none;
  border: none;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.logoutBtn:hover {
  background: #f7fafc;
  color: #667eea;
}

@media (max-width: 768px) {
  .headerContent {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
