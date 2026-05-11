import { defineComponent } from 'vue'
import { Home, Lock, UserPlus } from 'lucide-vue-next'
import { signup } from '../utils/auth'

export default defineComponent({
  name: 'Signup',
  components: {
    Home,
    Lock,
    UserPlus,
  },
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    }
  },
  methods: {
    onSubmit() {
      const res = signup({
        name: `${this.firstName} ${this.lastName}`.trim(),
        email: this.email,
        password: this.password,
      })
      if (res) {
        this.$router.push('/calculator')
      }
    },
  },
})
