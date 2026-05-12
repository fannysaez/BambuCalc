import { defineComponent } from 'vue'
import { Home, Lock, UserPlus } from 'lucide-vue-next'
import { signup, loginWithGoogle } from '../utils/auth'

export default defineComponent({
  name: 'Signup',
  components: { Home, Lock, UserPlus },
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
      } catch (err) {
        this.error = 'Connexion Google impossible. Réessaie.'
      }
    },
  },
})
