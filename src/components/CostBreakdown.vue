<template>
  <div class="breakdown">

    <!-- Colonne gauche : détail des postes -->
    <div class="col-left">
      <div class="group-label">Matière</div>
      <div class="line">
        <span class="line-label">Filament <span class="line-sub">({{ costs.totalWeight ?? 0 }} g)</span></span>
        <span class="line-value line-value--teal">{{ fmt(costs.materialCost) }}</span>
      </div>

      <div class="group-label mt">Équipement</div>
      <div class="line">
        <span class="line-label">Électricité <span class="line-sub">(~350 W)</span></span>
        <span class="line-value">{{ fmt(costs.electricity) }}</span>
      </div>
      <div class="line">
        <span class="line-label">Amortissement</span>
        <span class="line-value">{{ fmt(costs.amortization) }}</span>
      </div>
      <div class="line">
        <span class="line-label">Maintenance</span>
        <span class="line-value">{{ fmt(costs.maintenance) }}</span>
      </div>

      <div class="group-label mt">Main-d'œuvre & Divers</div>
      <div class="line">
        <span class="line-label">Main-d'œuvre</span>
        <span class="line-value">{{ fmt(costs.workCost) }}</span>
      </div>
      <div class="line">
        <span class="line-label">Emballage</span>
        <span class="line-value">{{ fmt(costs.packagingCost) }}</span>
      </div>
    </div>

    <!-- Colonne droite : récap + total -->
    <div class="col-right">
      <div class="recap-card">
        <div class="recap-title">Récapitulatif</div>

        <div class="recap-line">
          <span>Sous-total HT</span>
          <span>{{ fmt(costs.subtotal) }}</span>
        </div>
        <div class="recap-line">
          <span>TVA (20 %)</span>
          <span>{{ fmt(costs.tax) }}</span>
        </div>

        <div class="recap-sep" />

        <div class="total-block">
          <span class="total-label">Total TTC</span>
          <span class="total-value">{{ fmt(costs.totalCost) }}</span>
        </div>

        <div v-if="costs.quantity > 1" class="unit-line">
          {{ costs.quantity }} unités · {{ fmt(costs.costPerUnit) }} / unité
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CostBreakdown',
  props: {
    costs: {
      type: Object,
      required: true,
      default: () => ({
        totalWeight: 0, materialCost: 0, electricity: 0, amortization: 0,
        maintenance: 0, workCost: 0, packagingCost: 0,
        subtotal: 0, tax: 0, totalCost: 0, costPerUnit: 0, quantity: 1,
      }),
    },
  },
  methods: {
    fmt(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
    },
  },
}
</script>

<style scoped>
.breakdown {
  padding: 1rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

/* ── Colonne gauche ── */
.col-left {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.group-label {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0aec0;
  margin-bottom: 0.2rem;
}
.mt { margin-top: 0.6rem; }

.line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.28rem 0;
  border-bottom: 1px solid #f0f4f8;
  gap: 0.5rem;
}

.line-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d3748;
}
.line-sub {
  font-size: 0.68rem;
  font-weight: 400;
  color: #a0aec0;
}
.line-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4a5568;
  white-space: nowrap;
}
.line-value--teal { color: #2e9cab; }

/* ── Colonne droite ── */
.col-right {
  display: flex;
  flex-direction: column;
}

.recap-card {
  background: #f7f9fc;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.recap-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0aec0;
  margin-bottom: 0.15rem;
}

.recap-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #718096;
  font-weight: 600;
  padding: 0.15rem 0;
}

.recap-sep {
  height: 1.5px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}

.total-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #2e9cab 0%, #1f7f97 100%);
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  margin-top: 0.1rem;
}

.total-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.total-value {
  font-size: 1.45rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}

.unit-line {
  font-size: 0.7rem;
  color: #a0aec0;
  text-align: center;
  margin-top: 0.4rem;
}
</style>
