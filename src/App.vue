<template>
  <div :class="styles.app">
    <header v-if="showHeader" :class="styles.header">
      <div :class="styles.headerContent">

        <router-link :to="isAdminUser ? '/admin' : '/calculator/1'" :class="styles.logo" aria-label="Accueil" title="Accueil">
          <Home :class="styles.logoIcon" aria-hidden="true" />
        </router-link>

        <nav :class="styles.nav">
          <!-- Liens non connecté -->
          <router-link v-if="!isAuth" to="/login"  :class="styles.navLink">Connexion</router-link>
          <router-link v-if="!isAuth" to="/signup" :class="[styles.navLink, styles.highlight]">Créer un compte</router-link>

          <!-- Utilisateur connecté -->
          <div v-if="isAuth" :class="styles.userBar">
            <router-link v-if="isAdminUser" to="/admin" :class="styles.adminBtn" title="Administration">
              <ShieldCheck :class="styles.adminIcon" aria-hidden="true" />
              <span :class="styles.adminText">Admin</span>
            </router-link>

            <router-link to="/dashboard" :class="styles.userPill">
              <span :class="styles.userAvatar">
                <User :class="styles.userAvatarIcon" aria-hidden="true" />
              </span>
              <span :class="styles.userName">{{ displayName }}</span>
            </router-link>

            <button :class="styles.logoutBtn" @click="logout" title="Déconnexion" aria-label="Se déconnecter">
              <LogOut :class="styles.logoutIcon" aria-hidden="true" />
              <span :class="styles.logoutText">Déconnexion</span>
            </button>
          </div>
        </nav>

      </div>
    </header>
    <router-view />
  </div>
</template>

<script>
import { Home, User, LogOut, ShieldCheck } from 'lucide-vue-next'
import { supabase } from './lib/supabase'
import { logout as authLogout } from './utils/auth'

export default {
  name: 'App',
  components: { Home, User, LogOut, ShieldCheck },
  data() {
    return { isAuth: false, displayName: '', isAdminUser: false }
  },
  async created() {
    await this.checkAuth()
    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.isAuth = !!session
      this.displayName = session ? this.extractName(session.user) : ''
      this.isAdminUser = session ? await this.checkAdmin() : false
    })
  },
  computed: {
    showHeader() {
      return !['landing', 'login', 'signup'].includes(this.$route.name)
    },
  },
  methods: {
    async checkAuth() {
      const { data } = await supabase.auth.getSession()
      this.isAuth = !!data.session
      this.displayName = data.session ? this.extractName(data.session.user) : ''
      this.isAdminUser = data.session ? await this.checkAdmin() : false
    },
    async checkAdmin() {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) return false
      return !!data
    },
    extractName(user) {
      if (!user) return ''
      const meta = user.user_metadata || {}
      const full = meta.full_name || meta.name || ''
      return full.split(' ')[0] || user.email?.split('@')[0] || ''
    },
    async logout() {
      await authLogout()
      this.isAuth = false
      this.displayName = ''
      this.isAdminUser = false
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>

<style module="styles">

.app {
  min-height: 100vh;
  background: #f0f4f8;
}

/* ── Header ── */
.header {
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 100;
  pointer-events: none;
}

.headerContent {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  pointer-events: none;
}

/* ── Logo — bouton rond style ctrl-home ── */
.logo {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 20px rgba(29, 18, 43, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #1f7f97;
  text-decoration: none;
  pointer-events: auto;
  transition: transform 0.2s ease, background 0.2s ease;
}

.logo:hover {
  transform: translateY(-1px);
  background: #fff;
}

.logoIcon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.logoText { display: none; }

/* ── Nav ── */
.nav {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  pointer-events: auto;
}

.navLink {
  text-decoration: none;
  color: #2e9cab;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(29, 18, 43, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.navLink:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(29, 18, 43, 0.14);
}

.highlight {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(46, 156, 171, 0.35);
}

.highlight:hover {
  color: #fff;
  filter: brightness(1.06);
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
}

/* ── Barre utilisateur connecté ── */
.userBar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Bouton Admin */
.adminBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff;
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(124,58,237,0.38);
  transition: filter 0.2s ease, transform 0.2s ease;
}
.adminBtn:hover { filter: brightness(1.08); transform: translateY(-1px); }
.adminIcon { width: 0.85rem; height: 0.85rem; }
.adminText { white-space: nowrap; }

/* Pill : avatar + prénom */
.userPill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.28rem 0.85rem 0.28rem 0.28rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(29, 18, 43, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.userPill:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(29, 18, 43, 0.14);
}

.userAvatar {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(46, 156, 171, 0.3);
}

.userAvatarIcon {
  width: 1rem;
  height: 1rem;
  color: #fff;
}

.userName {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1b2f39;
  white-space: nowrap;
}

/* Bouton déconnexion */
.logoutBtn {
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.82);
  color: #2e9cab;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(29, 18, 43, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  font-family: inherit;
}

.logoutBtn:hover {
  transform: translateY(-1px);
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
}

.logoutIcon {
  width: 0.95rem;
  height: 0.95rem;
  flex-shrink: 0;
}

.logoutText { display: none; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .headerContent { padding: 0.75rem 1rem; }
  .logoText { font-size: 0.95rem; }
  .userName { display: none; }
}
</style>
