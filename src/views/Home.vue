<template>
  <div class="home">
    <header class="home-header">
      <h1>Calculateur de Coûts d'Impression 3D</h1>
      <p>Calculez le coût exact de vos impressions</p>
    </header>
    <div class="home-content">
      <Calculator />
    </div>
  </div>
</template>

<script>
import Calculator from '../components/Calculator.vue'

export default {
  name: 'Home',
  components: { Calculator },
}
</script>

<style scoped>
.home {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 70px);
  padding: 2rem 1.25rem 1.5rem;
}

.home-header {
  text-align: center;
  margin-bottom: 2.25rem;
  color: #333;
}

.home-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #1a202c;
}

.home-header p {
  font-size: 1rem;
  color: #666;
}

.home-content {
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .home {
    padding: 1.25rem 1rem 1rem;
  }

  .home-header h1 {
    font-size: 1.6rem;
  }

  .home-header p {
    font-size: 0.9rem;
  }
}
</style>
