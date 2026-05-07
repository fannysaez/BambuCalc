import { defineComponent } from 'vue'
import { signup } from '../utils/auth'

export default defineComponent({
  name: 'Signup',
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
