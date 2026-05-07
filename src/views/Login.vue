<template>
  <div class="auth-wrapper">
    <section class="hero-panel">
      <div class="hero-card">
        <div class="hero-top">
          <div class="hero-label">BambuCalc</div>
          <div class="hero-copy">
            <h1 class="hero-title">Reprenez vos devis</h1>
            <p class="hero-text">Connectez-vous pour gérer vos projets 3D.</p>
          </div>
        </div>
        <div class="hero-image-frame">
          <div class="hero-image-card">
            <img
              class="hero-image"
              src="/auth-printing-hero.svg"
              alt="Illustration d'impression 3D"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-card">
        <div class="form-header">
          <h2 class="form-title">Connexion</h2>
          <p class="form-subtitle">Entrez vos identifiants</p>
        </div>

        <div class="social-buttons">
          <button class="social-btn google" type="button"><span>G</span> Google</button>
          <button class="social-btn facebook" type="button"><span>f</span> Facebook</button>
        </div>

        <div class="divider">
          <span>Ou connectez-vous avec email</span>
        </div>

        <form @submit.prevent="onSubmit" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-input"
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <div class="forgot-link">
            <a href="#" class="link-forgot">Mot de passe oublié ?</a>
          </div>

          <button type="submit" class="btn-submit">Se connecter</button>
        </form>

        <div class="form-footer">
          <p>Pas encore de compte ?</p>
          <router-link to="/signup" class="link-signup">Créer un compte</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { login } from '../utils/auth'

export default {
  name: 'Login',
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
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  height: 100dvh;
  overflow: hidden;
  background: #f3efe8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.hero-panel {
  padding: 0.85rem;
}

.hero-card {
  height: 100%;
  min-height: 0;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), #8d7ae6;
  color: white;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 50px rgba(66, 54, 140, 0.18);
}

.hero-card::before,
.hero-card::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(2px);
}

.hero-card::before {
  width: 10rem;
  height: 10rem;
  top: -3rem;
  left: -2rem;
}

.hero-card::after {
  width: 14rem;
  height: 14rem;
  right: -4rem;
  bottom: 4rem;
}

.hero-label {
  align-self: flex-start;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(12px);
}

.hero-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  z-index: 1;
}

.hero-copy {
  margin-left: auto;
  width: min(32rem, 100%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.hero-title {
  max-width: none;
  margin: 0;
  font-size: clamp(1.75rem, 2.7vw, 2.35rem);
  line-height: 1.02;
  font-weight: 800;
  position: relative;
  z-index: 1;
  text-align: right;
  white-space: nowrap;
}

.hero-text {
  width: 100%;
  max-width: none;
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 1;
  text-align: center;
  white-space: nowrap;
}

.hero-image-frame {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0 0;
}

.hero-image-card {
  width: min(58%, 360px);
  max-width: 360px;
  min-width: 250px;
  aspect-ratio: 0.72;
  border-radius: 1.15rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 30px 46px rgba(48, 36, 110, 0.32);
}

.hero-image {
  width: 88%;
  max-height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 28px 42px rgba(42, 24, 92, 0.35));
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.75rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
}

.form-card {
  width: 100%;
  max-width: 440px;
}

.form-header {
  margin-bottom: 1rem;
  text-align: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f1f1f;
  margin: 0 0 0.5rem;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #6d6d74;
  margin: 0;
}

/* Social Buttons */
.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
  margin-bottom: 0.85rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  border: 1px solid #ded8eb;
  border-radius: 14px;
  background: white;
  color: #2a2a2f;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #ccc;
  background: #f9f9f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.social-btn span {
  font-weight: 700;
  font-size: 1.1rem;
}

.social-btn.google {
  color: #1f2937;
}

.social-btn.facebook {
  color: #1877f2;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.85rem;
  color: #8b8698;
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-input {
  padding: 0.8rem 0.95rem;
  border: 1px solid #ddd7e9;
  border-radius: 14px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fafafa;
  color: #1a1a1a;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #6f68d8;
  background: white;
  box-shadow: 0 0 0 4px rgba(111, 104, 216, 0.12);
}

.forgot-link {
  text-align: right;
  margin-bottom: 0.5rem;
}

.forgot-link {
  text-align: right;
}

.link-forgot {
  font-size: 0.85rem;
  color: #6f68d8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-forgot:hover {
  color: #5a4bcf;
  text-decoration: underline;
}

/* Submit Button */
.btn-submit {
  padding: 0.9rem;
  margin-top: 0;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #6678f2 0%, #7f56d9 100%);
  color: white;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  box-shadow: 0 10px 22px rgba(96, 85, 188, 0.24);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:active {
  transform: translateY(0px);
}

/* Form Footer */
.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.85rem;
  font-size: 0.9rem;
  color: #666;
}

.form-footer p {
  margin: 0;
}

.link-signup {
  color: #6f68d8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  cursor: pointer;
}

.link-signup:hover {
  color: #5a4bcf;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .auth-wrapper {
    grid-template-columns: 1fr;
    background: #f3efe8;
    height: auto;
    overflow: auto;
  }

  .hero-panel {
    padding: 0.75rem 0.75rem 0;
  }

  .hero-card {
    min-height: 320px;
    border-radius: 1.5rem;
    padding: 1rem;
  }

  .hero-top {
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-label {
    align-self: flex-start;
  }

  .hero-title {
    max-width: 100%;
    font-size: 1.35rem;
  }

  .hero-text {
    white-space: normal;
    font-size: 0.86rem;
  }

  .hero-image-card {
    width: min(70%, 300px);
    min-width: 200px;
  }

  .form-panel {
    padding: 1rem 0.9rem 1.25rem;
    background: rgba(255, 255, 255, 0.96);
  }

  .form-title {
    font-size: 1.35rem;
  }

  .social-buttons {
    grid-template-columns: 1fr;
  }

  .form-group {
    gap: 0.3rem;
  }
}

@media (max-width: 900px) {
  .auth-wrapper {
    grid-template-columns: 1fr;
    height: auto;
    overflow: auto;
  }

  .hero-panel {
    padding: 0.75rem 0.75rem 0;
  }

  .hero-card {
    min-height: 320px;
    border-radius: 1.35rem;
    padding: 0.95rem;
    justify-content: flex-start;
    gap: 0.7rem;
  }

  .hero-top {
    flex-direction: column;
    gap: 0.4rem;
  }

  .hero-title {
    font-size: clamp(1.15rem, 3.2vw, 1.5rem);
    max-width: 100%;
  }

  .hero-text {
    max-width: 100%;
    margin-top: 0.15rem;
    white-space: normal;
    font-size: 0.86rem;
  }

  .hero-image-card {
    width: min(68%, 280px);
    min-width: 190px;
  }

  .form-panel {
    padding: 0.7rem 0.9rem 0.95rem;
  }

  .social-buttons {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

  .social-btn {
    padding: 0.62rem;
  }

  .divider,
  .form-footer {
    margin-bottom: 0.45rem;
  }

  .auth-form {
    gap: 0.55rem;
  }
}

@media (max-height: 760px) {
  .hero-card {
    min-height: 280px;
  }

  .form-panel {
    padding-top: 0.55rem;
    padding-bottom: 0.75rem;
  }

  .form-header {
    margin-bottom: 0.7rem;
  }

  .auth-form {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .hero-panel {
    padding: 0.75rem 0.75rem 0;
  }

  .hero-card {
    min-height: 280px;
    padding: 0.9rem;
    border-radius: 1.25rem;
  }

  .hero-title {
    font-size: 1.2rem;
  }

  .hero-text {
    font-size: 0.8rem;
  }

  .hero-image {
    max-height: 86%;
  }

  .form-panel {
    padding: 0.85rem 0.75rem 1rem;
  }

  .form-card {
    max-width: 100%;
  }

  .form-title {
    font-size: 1.3rem;
  }

  .social-buttons {
    gap: 0.75rem;
  }

  .social-btn {
    font-size: 0.8rem;
    padding: 0.7rem;
  }

  .auth-form {
    gap: 0.75rem;
  }
}

@media (max-height: 820px) {
  .hero-card {
    padding: 1rem;
  }

  .hero-title {
    font-size: 1.4rem;
  }

  .hero-text {
    margin-top: 0.35rem;
  }

  .hero-image {
    max-height: 32vh;
  }

  .form-panel {
    padding: 0.9rem 1.25rem;
  }

  .form-header {
    margin-bottom: 0.9rem;
  }

  .social-buttons,
  .divider,
  .form-footer {
    margin-bottom: 0.75rem;
  }
}
</style>
