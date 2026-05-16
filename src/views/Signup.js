import { defineComponent } from 'vue'
import { Home, Lock, UserPlus, UserX } from 'lucide-vue-next'
import { signup, loginWithGoogle } from '../utils/auth'
import { supabase } from '../lib/supabase'
import PasswordField from '../components/PasswordField.vue'

function sendWelcomeEmail(email, firstName, lastName) {
  supabase.functions.invoke('send-welcome-email', {
    body: { email, firstName, lastName, appUrl: window.location.origin },
  }).catch(() => {})
}

export default defineComponent({
  name: 'Signup',
  components: { Home, Lock, UserPlus, UserX, PasswordField },
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      gdprAccepted: false,
      error: null,
      loading: false,
    }
  },
  methods: {
    async onSubmit() {
      this.error = null
      if (!this.gdprAccepted) {
        this.error = 'Vous devez accepter la politique de confidentialité pour continuer.'
        return
      }
      this.loading = true
      try {
        await signup({
          email: this.email,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
        })
        sendWelcomeEmail(this.email, this.firstName, this.lastName)
        this.$router.push('/calculator')
      } catch (err) {
        this.error = err.message ?? 'Une erreur est survenue.'
      } finally {
        this.loading = false
      }
    },
    async onGoogle() {
      try {
        await loginWithGoogle()
      } catch {
        this.error = 'Connexion Google impossible. Réessaie.'
      }
    },
    async onGuest() {
      try {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        this.$router.push('/calculator')
      } catch {
        this.error = 'Impossible de démarrer en mode invité. Réessaie.'
      }
    },
  },
})
