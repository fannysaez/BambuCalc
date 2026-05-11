import { defineComponent } from 'vue'
import { Home, Lock, UserPlus } from 'lucide-vue-next'
import { login } from '../utils/auth'

export default defineComponent({
  name: 'Login',
  components: {
    Home,
    Lock,
    UserPlus,
  },
  data() {
    return {
      email: '',
      password: '',
      error: null,
    }
  },
  methods: {
    onSubmit() {
      const res = login({ email: this.email, password: this.password })
      if (res) {
        this.$router.push('/calculator')
      } else {
        this.error = 'Utilisateur non trouvé. Créez un compte.'
        alert(this.error)
      }
    },
  },
})
