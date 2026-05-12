<template>
  <div class="reset-page">
    <div class="reset-card">
      <div class="reset-icon-wrap">
        <Lock class="reset-icon" />
      </div>

      <!-- Succès -->
      <div v-if="success" class="state-block">
        <div class="state-emoji">✓</div>
        <h2>Mot de passe mis à jour !</h2>
        <p>Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
        <router-link to="/login" class="btn-primary">Se connecter</router-link>
      </div>

      <!-- Formulaire -->
      <form v-else @submit.prevent="onSubmit">
        <h2 class="reset-title">Nouveau mot de passe</h2>
        <p class="reset-sub">Choisis un mot de passe sécurisé.</p>

        <div class="field">
          <label for="new-password">Nouveau mot de passe</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            minlength="8"
            required
          />
        </div>

        <div class="field">
          <label for="confirm-password">Confirmer</label>
          <input
            id="confirm-password"
            v-model="confirm"
            type="password"
            placeholder="••••••••"
            minlength="8"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { Lock } from 'lucide-vue-next'
import { updatePassword } from '../utils/auth'

export default {
  name: 'ResetPassword',
  components: { Lock },
  data() {
    return {
      password: '',
      confirm: '',
      error: null,
      loading: false,
      success: false,
    }
  },
  methods: {
    async onSubmit() {
      this.error = null
      if (this.password !== this.confirm) {
        this.error = 'Les mots de passe ne correspondent pas.'
        return
      }
      this.loading = true
      try {
        await updatePassword(this.password)
        this.success = true
      } catch {
        this.error = 'Erreur lors de la mise à jour. Le lien est peut-être expiré.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.reset-page {
  min-height: 100dvh;
  background: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.reset-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.reset-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
}
.reset-icon { width: 1.4rem; height: 1.4rem; color: #fff; }

.reset-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.3rem;
  text-align: center;
  letter-spacing: -0.02em;
}
.reset-sub {
  font-size: 0.88rem;
  color: #718096;
  text-align: center;
  margin: 0 0 1.5rem;
}

.field {
  display: grid;
  gap: 0.38rem;
  margin-bottom: 1rem;
}
.field label {
  font-size: 0.72rem;
  color: #5b5a61;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-weight: 600;
}
.field input {
  width: 100%;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  min-height: 2.9rem;
  padding: 0.72rem 0.95rem;
  font: inherit;
  color: #1f1e23;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.field input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46,154,171,0.16);
}

.auth-error {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(220,53,69,0.08);
  border: 1px solid rgba(220,53,69,0.25);
  color: #c0392b;
  font-size: 0.85rem;
}

.btn-primary {
  width: 100%;
  min-height: 2.95rem;
  border: 0;
  border-radius: 0.55rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 18px rgba(46,156,171,0.28);
  transition: filter 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.06); }

/* Succès */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}
.state-emoji { font-size: 2.5rem; color: #2e9cab; }
.state-block h2 { font-size: 1.3rem; font-weight: 800; color: #1b2f39; margin: 0; }
.state-block p  { font-size: 0.88rem; color: #718096; margin: 0 0 0.5rem; }
</style>
