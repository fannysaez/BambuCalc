<template>
  <div class="nf-page">
    <div class="nf-card">
      <div class="nf-icon-wrap">
        <span class="nf-code">404</span>
      </div>
      <h1 class="nf-title">Page introuvable</h1>
      <p class="nf-sub">
        Cette page n'existe pas ou a été déplacée.<br />
        Retournez à l'accueil pour continuer.
      </p>
      <div class="nf-actions">
        <router-link to="/" class="btn-home">← Accueil</router-link>
        <router-link v-if="isAuth" to="/dashboard" class="btn-dash">Mon tableau de bord</router-link>
      </div>
    </div>
    <p class="nf-brand">🖨️ BambuCalc</p>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase'

export default {
  name: 'NotFound',
  data() {
    return { isAuth: false }
  },
  async created() {
    const { data } = await supabase.auth.getSession()
    this.isAuth = !!data.session
  },
}
</script>

<style scoped>
.nf-page {
  min-height: 100dvh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.nf-card {
  background: #fff;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.nf-icon-wrap {
  margin-bottom: 1.5rem;
}

.nf-code {
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #2e9cab, #3fb2bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  display: block;
}

.nf-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.nf-sub {
  font-size: 0.95rem;
  color: #718096;
  line-height: 1.7;
  margin: 0 0 2rem;
}

.nf-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(46,156,171,0.28);
  transition: filter 0.2s;
}
.btn-home:hover { filter: brightness(1.07); }

.btn-dash {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: 1.5px solid #2e9cab;
  color: #2e9cab;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-dash:hover { background: #e8f7f9; }

.nf-brand {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #a0aec0;
  font-weight: 600;
}
</style>
