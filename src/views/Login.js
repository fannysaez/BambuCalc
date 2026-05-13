import { defineComponent } from 'vue'
import { Home, Lock, UserPlus, UserX } from 'lucide-vue-next'
import { login, loginWithGoogle, resetPasswordForEmail, checkIsAdmin } from '../utils/auth'
import { supabase } from '../lib/supabase'

export default defineComponent({
  name: 'Login',
  components: { Home, Lock, UserPlus, UserX },
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false,
      // Mot de passe oublié
      forgotMode: false,
      forgotEmail: '',
      forgotSent: false,
      forgotLoading: false,
      forgotError: null,
    }
  },
  methods: {
    async onSubmit() {
      this.error = null
      this.loading = true
      try {
        await login({ email: this.email, password: this.password })
        const isAdmin = await checkIsAdmin()
        this.$router.push(isAdmin ? '/admin' : '/dashboard')
      } catch (err) {
        this.error = 'Email ou mot de passe incorrect.'
      } finally {
        this.loading = false
      }
    },
    async onGoogle() {
      try {
        await loginWithGoogle()
      } catch (err) {
        this.error = 'Connexion Google impossible. Réessaie.'
      }
    },
    async onForgot() {
      this.forgotError = null
      this.forgotLoading = true
      try {
        await resetPasswordForEmail(this.forgotEmail)
        this.forgotSent = true
      } catch (err) {
        this.forgotError = 'Adresse introuvable ou erreur. Vérifie ton email.'
      } finally {
        this.forgotLoading = false
      }
    },
    backToLogin() {
      this.forgotMode = false
      this.forgotSent = false
      this.forgotEmail = ''
      this.forgotError = null
    },
    async onGuest() {
      try {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        this.$router.push('/dashboard')
      } catch {
        this.error = 'Impossible de démarrer en mode invité. Réessaie.'
      }
    },
  },
})
