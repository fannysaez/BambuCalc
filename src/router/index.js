import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import { isAuthenticated } from '../utils/auth'

const routes = [
  { path: '/', name: 'landing', component: Landing, meta: { layout: 'landing' } },
  { path: '/calculator', name: 'home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated()

  // Redirection si authentifié et essaie d'accéder aux pages d'auth
  if (isAuth && (to.name === 'login' || to.name === 'signup')) {
    return next({ name: 'home' })
  }

  // Redirection si non authentifié et essaie d'accéder à une page protégée
  if (to.meta && to.meta.requiresAuth && !isAuth) {
    return next({ name: 'login' })
  }

  return next()
})

export default router
