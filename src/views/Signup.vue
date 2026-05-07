<template>
  <div class="auth-page">
    <section class="auth-visual" aria-hidden="true">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <div class="visual-copy">
        <h1>S'inscrire en quelques secondes</h1>
        <p>Une interface élégante pour suivre vos devis et vos séries.</p>
      </div>

      <div class="visual-illustration">
        <img src="/auth-hero-3d.svg" alt="" />
      </div>
    </section>

    <section class="auth-form-panel">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Inscription</h2>
          <p>Rejoignez BambuCalc et gérez vos projets 3D.</p>
        </div>

        <form @submit.prevent="onSubmit" class="auth-form">
          <div class="field-grid">
            <div class="field">
              <label for="signup-first-name">Prénom</label>
              <input
                id="signup-first-name"
                v-model="firstName"
                type="text"
                placeholder="Jean"
                required
              />
            </div>

            <div class="field">
              <label for="signup-last-name">Nom</label>
              <input
                id="signup-last-name"
                v-model="lastName"
                type="text"
                placeholder="Dupont"
                required
              />
            </div>
          </div>

          <div class="field">
            <label for="signup-email">E-mail</label>
            <input
              id="signup-email"
              v-model="email"
              type="email"
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div class="field">
            <label for="signup-password">Mot de passe</label>
            <input
              id="signup-password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="primary-btn">Créer un compte</button>
        </form>

        <p class="auth-switch">
          Vous avez déjà un compte ?
          <router-link to="/login">Se connecter</router-link>
        </p>

        <div class="auth-divider"><span>ou</span></div>

        <div class="social-grid">
          <button type="button" class="social-btn social-facebook">
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            S'inscrire avec Facebook
          </button>
          <button type="button" class="social-btn social-google">
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            S'inscrire avec Google
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import comp from './Signup.js'
export default comp
</script>

<style scoped src="./Signup.css"></style>
