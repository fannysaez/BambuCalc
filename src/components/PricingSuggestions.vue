<template>
  <div :class="pStyles.section">
    <h2 :class="pStyles.sectionTitle">
      <span :class="pStyles.titleIcon">✧</span>
      <span>Tarification Suggérée</span>
      <span
        :class="pStyles.infoBadge"
        title="Remise volume: application d'un pourcentage sur le prix unitaire après marge"
        >ℹ︎</span
      >
    </h2>

    <div :class="pStyles.pricingGrid">
      <div
        v-for="pricing in pricingOptions"
        :key="pricing.id"
        :class="[pStyles.pricingCard, selectedPricing === pricing.id && pStyles.selected]"
        @click="$emit('update:selectedPricing', pricing.id)"
      >
        <div :class="pStyles.pricingName">{{ pricing.name }}</div>
        <div :class="pStyles.margin">+{{ pricing.margin }}% Marge</div>
        <div :class="pStyles.priceLabel">HT</div>
        <div :class="pStyles.price">
          <span v-if="hasUnitCost">{{ formatCurrency(unitPrice(pricing)) }} / unité</span>
          <span v-else>{{ formatCurrency(calculatePrice(baseCost, pricing.margin)) }}</span>
        </div>
        <div :class="pStyles.priceWithTax">
          <div v-if="hasUnitCost">
            <div>{{ formatCurrency(unitPriceWithTax(pricing)) }} TTC / unité</div>
            <div :class="pStyles.unitSummary">
              {{ seriesQuantity }} unités → {{ formatCurrency(unitTotalWithTax(pricing)) }} TTC
            </div>
            <div v-if="volumeDiscount > 0" :class="pStyles.savingsLine">
              <strong>-{{ volumeDiscount }}% remise volume</strong>
              — économie par unité: {{ formatCurrency(unitSavings(pricing)) }} TTC (total:
              {{ formatCurrency(unitSavings(pricing) * seriesQuantity) }})
            </div>
          </div>
          <div v-else>
            {{ formatCurrency(calculatePriceWithTax(baseCost, pricing.margin)) }} TTC
          </div>
        </div>
      </div>
    </div>

    <div :class="pStyles.customSection">
      <div :class="pStyles.customHeader">
        <div :class="pStyles.customTitleRow">
          <span :class="pStyles.customTitleIcon">⚙</span>
          <span :class="pStyles.customLabel">Personnalisé</span>
        </div>
        <div :class="pStyles.customAmount">
          {{ formatCurrency(calculatePrice(baseCost, customMargin)) }}
        </div>
      </div>

      <div :class="pStyles.customSliderRow">
        <input
          :class="pStyles.customSlider"
          type="range"
          :value="customMargin"
          @input="$emit('update:customMargin', Number($event.target.value))"
          min="0"
          max="100"
          step="1"
        />
        <div :class="pStyles.customPctBox">
          <input
            type="number"
            :value="customMargin"
            @input="$emit('update:customMargin', Number($event.target.value))"
            min="0"
            max="100"
            step="1"
          />
          <span>%</span>
        </div>
      </div>

      <div :class="pStyles.customFooter">
        <span>+{{ customMargin }}% Marge de profit</span>
        <span :class="pStyles.customResult"
          >{{ formatCurrency(calculatePriceWithTax(baseCost, customMargin)) }} TTC</span
        >
      </div>
    </div>

    <button :class="pStyles.saveButton" @click.prevent="saveAndDownload">
      💾 Enregistrer le devis
    </button>
  </div>
</template>

<script>
import pStyles from '../styles/PricingSuggestions.module.css'
import auth from '../utils/auth'

export default {
  name: 'PricingSuggestions',
  props: {
    baseCost: { type: Number, default: 0 },
    baseCostPerUnit: { type: Number, default: 0 },
    seriesQuantity: { type: Number, default: 1 },
    volumeDiscount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 20 },
    selectedPricing: { type: String, default: 'standard' },
    customMargin: { type: Number, default: 50 },
  },
  data() {
    return {
      pStyles,
      pricingOptions: [
        { id: 'competitive', name: 'Compétitif', margin: 25 },
        { id: 'standard', name: 'Standard', margin: 40 },
        { id: 'premium', name: 'Premium', margin: 60 },
        { id: 'luxury', name: 'Luxe', margin: 80 },
      ],
    }
  },
  computed: {
    hasUnitCost() {
      return this.baseCostPerUnit && this.baseCostPerUnit > 0
    },
  },
  methods: {
    calculatePrice(baseCost, margin) {
      return baseCost + (baseCost * margin) / 100
    },
    calculatePriceWithTax(baseCost, margin) {
      const price = this.calculatePrice(baseCost, margin)
      return Math.round(price * (1 + this.taxRate / 100) * 100) / 100
    },
    unitPrice(pricing) {
      const withMargin = this.calculatePrice(this.baseCostPerUnit, pricing.margin)
      const discountMultiplier = Math.max(0, 1 - (Number(this.volumeDiscount) || 0) / 100)
      return Math.round(withMargin * discountMultiplier * 100) / 100
    },
    unitPriceWithTax(pricing) {
      return Math.round(this.unitPrice(pricing) * (1 + this.taxRate / 100) * 100) / 100
    },
    unitTotalWithTax(pricing) {
      return Math.round(this.unitPriceWithTax(pricing) * this.seriesQuantity * 100) / 100
    },
    undiscountedUnitWithTax(pricing) {
      const unit = this.calculatePrice(this.baseCostPerUnit, pricing.margin)
      return Math.round(unit * (1 + this.taxRate / 100) * 100) / 100
    },
    unitSavings(pricing) {
      return (
        Math.round((this.undiscountedUnitWithTax(pricing) - this.unitPriceWithTax(pricing)) * 100) /
        100
      )
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
    },
    saveAndDownload() {
      if (!auth.isAuthenticated()) {
        this.$router.push({ name: 'login' })
        return
      }

      const quote = {
        createdAt: new Date().toISOString(),
        baseCost: this.baseCost,
        costPerUnit: this.baseCostPerUnit,
        quantity: this.seriesQuantity,
        selectedPricing: this.selectedPricing,
        customMargin: this.customMargin,
      }

      const saved = auth.saveQuote(quote)
      const win = window.open('', '_blank')
      const jsonStr = JSON.stringify(saved, null, 2)
      const html =
        '<html><head><title>Devis ' +
        saved.id +
        '</title></head><body>' +
        "<h1>Devis d'impression 3D</h1>" +
        '<p>Référence: ' +
        saved.id +
        '</p>' +
        '<pre>' +
        jsonStr +
        '</pre>' +
        '</body></html>'
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 500)
    },
  },
  emits: ['update:selectedPricing', 'update:customMargin'],
}
</script>
