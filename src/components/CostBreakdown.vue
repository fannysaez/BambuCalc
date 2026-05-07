<template>
  <div :class="cbStyles.section">
    <h2 :class="cbStyles.sectionTitle">Répartition des Coûts</h2>

    <div :class="cbStyles.costBreakdown">
      <div v-if="costs.quantity || costs.costPerUnit" :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Quantité</div>
        <div :class="cbStyles.costValue">{{ costs.quantity || 1 }} unités</div>
      </div>

      <div v-if="costs.costPerUnit" :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Coût par unité</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.costPerUnit) }}</div>
      </div>
      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Coût matériau</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.materialCost) }}</div>
      </div>

      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Coût équipement</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.equipmentCost) }}</div>
      </div>

      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Coût main-d'œuvre</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.workCost) }}</div>
      </div>

      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Coût emballage</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.packagingCost) }}</div>
      </div>

      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">Sous-total</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.subtotal) }}</div>
      </div>

      <div :class="cbStyles.costItem">
        <div :class="cbStyles.costLabel">TVA (20%)</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.tax) }}</div>
      </div>

      <div :class="cbStyles.totalCost">
        <div :class="cbStyles.costLabel">Coût total de revient</div>
        <div :class="cbStyles.costValue">{{ formatCurrency(costs.totalCost) }}</div>
      </div>
    </div>

    <div :class="cbStyles.chart">
      <p>📊 Graphique d'analyse des coûts</p>
      <p style="font-size: 0.875rem; color: #718096; margin-top: 8px">
        Le graphique s'affichera une fois les données saisies
      </p>
    </div>
  </div>
</template>

<script>
import cbStyles from '../styles/CostBreakdown.module.css'

export default {
  name: 'CostBreakdown',
  props: {
    costs: {
      type: Object,
      required: true,
      default: () => ({
        materialCost: 0,
        equipmentCost: 0,
        workCost: 0,
        packagingCost: 0,
        subtotal: 0,
        tax: 0,
        totalCost: 0,
      }),
    },
  },
  data() {
    return {
      cbStyles,
    }
  },
  // no computed in original
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(value)
    },
  },
}
</script>
