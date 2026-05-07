<template>
  <div class="landing">
    <div class="hero">
      <div class="hero-content">
        <h1 class="hero-title">🖨️ BambuCalc</h1>
        <p class="hero-subtitle">Calculateur de Coûts d'Impression 3D</p>
        <p class="hero-desc">
          Estimez vos coûts de production avec précision. Gérez vos devis, suivez vos prix et
          optimisez vos marges.
        </p>

        <div class="hero-cta">
          <router-link to="/signup" class="btn btn-primary">Créer un compte</router-link>
          <router-link to="/login" class="btn btn-secondary">Se connecter</router-link>
        </div>
      </div>

      <div class="hero-features">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-title">Calcul Précis</div>
          <div class="feature-text">
            Matériau, équipement, main-d'œuvre : tous les coûts en un seul endroit.
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <div class="feature-title">Tarification Flexible</div>
          <div class="feature-text">
            4 niveaux de tarification suggérée + personnalisation complète.
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <div class="feature-title">Production en Série</div>
          <div class="feature-text">
            Garez les rabais volume, le taux de rebut et l'amortissement.
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📥</div>
          <div class="feature-title">Devis Téléchargeables</div>
          <div class="feature-text">Générez et sauvegardez vos devis en PDF instantanément.</div>
        </div>
      </div>
    </div>

    <div class="footer-landing">
      <p>Conçu pour les freelances, les associations et les micro-entreprises d'impression 3D.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Landing',
}
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.hero {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

.hero-content {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.hero-desc {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn {
  padding: 0.95rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.hero-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.4);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-text {
  font-size: 0.9rem;
  opacity: 0.85;
  line-height: 1.5;
}

.footer-landing {
  text-align: center;
  opacity: 0.8;
  font-size: 0.95rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-desc {
    font-size: 1rem;
  }

  .hero-cta {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }

  .hero-features {
    grid-template-columns: 1fr;
  }
}
</style>
