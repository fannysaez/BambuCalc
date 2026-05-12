<template>
  <div :class="formStyles.section">

    <!-- Ligne 1 : Type + Marque -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="material">Type de filament</label>
        <select id="material" :class="formStyles.select" :value="material" @change="onMaterialChange">
          <option value="PLA+">PLA+</option>
          <option value="PLA+ 2.0">PLA+ 2.0</option>
          <option value="PLA">PLA</option>
          <option value="PETG">PETG</option>
          <option value="ABS">ABS</option>
          <option value="TPU">TPU</option>
          <option value="custom-material">+ Personnalisé…</option>
          <optgroup v-if="customMaterials.length" label="─ Mes filaments ─">
            <option v-for="mat in customMaterials" :key="mat.id" :value="mat.name">{{ mat.name }}</option>
          </optgroup>
        </select>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="brand">Marque</label>
        <select id="brand" :class="formStyles.select" :value="selectedBrand" @change="onBrandChange">
          <option value="sunlu">SUNLU</option>
          <option value="eryone">ERYONE</option>
          <option value="bambu">Bambu Lab</option>
          <option value="prusament">Prusament</option>
          <option value="custom">Personnalisé</option>
          <optgroup v-if="customBrands.length" label="─ Mes marques ─">
            <option v-for="b in customBrands" :key="b.id" :value="b.id">{{ b.name }}</option>
          </optgroup>
        </select>
      </div>
    </div>

    <!-- Ligne 2 : Coût/kg + Poids pièce -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="costPerKg">Coût / kg</label>
        <div class="input-unit-wrap">
          <input id="costPerKg" :class="formStyles.input" type="number"
            :value="costPerKg" @input="$emit('update:costPerKg', parseFloat($event.target.value))"
            step="0.01" min="0" />
          <span class="unit">€/kg</span>
        </div>
        <p :class="formStyles.helpText">
          {{ selectedBrand !== 'custom' ? `Prix standard ${material} – ${brandLabels[selectedBrand] || selectedBrand}` : 'Prix personnalisé' }}
        </p>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="weight">Poids de la pièce</label>
        <div class="input-unit-wrap">
          <input id="weight" :class="formStyles.input" type="number"
            :value="weight" @input="$emit('update:weight', parseFloat($event.target.value))"
            step="0.1" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Poids affiché dans Bambu Studio</p>
      </div>
    </div>

    <!-- Ligne 3 : % perte supports + Nb couleurs AMS -->
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="lossPercent">Perte supports / brim</label>
        <div class="input-unit-wrap">
          <input id="lossPercent" :class="formStyles.input" type="number"
            :value="lossPercent" @input="$emit('update:lossPercent', parseFloat($event.target.value))"
            step="1" min="0" max="50" />
          <span class="unit">%</span>
        </div>
        <p :class="formStyles.helpText">5–15 % selon la complexité</p>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="colorCount">Nombre de couleurs (AMS)</label>
        <select id="colorCount" :class="formStyles.select" :value="colorCount"
          @change="$emit('update:colorCount', parseInt($event.target.value))">
          <option value="1">1 — Monocouleur</option>
          <option value="2">2 couleurs</option>
          <option value="3">3 couleurs</option>
          <option value="4">4 couleurs</option>
        </select>
      </div>
    </div>

    <!-- Purge AMS (visible si > 1 couleur) -->
    <div v-if="colorCount > 1" class="purge-block">
      <div class="purge-icon">♻</div>
      <div class="purge-body">
        <label :class="formStyles.label" for="purgeWaste">
          Purge AMS estimée <span class="purge-tip">(tour de purge)</span>
        </label>
        <div class="input-unit-wrap">
          <input id="purgeWaste" :class="formStyles.input" type="number"
            :value="purgeWaste" @input="$emit('update:purgeWaste', parseFloat($event.target.value))"
            step="1" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Bambu Studio indique le poids de la tour de purge</p>
      </div>
    </div>

    <!-- Filament personnalisé -->
    <div v-if="material === 'custom-material'" class="add-row">
      <input :class="formStyles.input" v-model="newMaterial" type="text" placeholder="Ex: TPU, Nylon, ABS…" />
      <button class="btn-add" @click="addMaterial">+ Ajouter</button>
    </div>

    <!-- Toggle ajouter une marque -->
    <button class="toggle-link" @click="showBrandAdd = !showBrandAdd">
      {{ showBrandAdd ? '− Masquer' : '+ Ajouter une marque' }}
    </button>
    <div v-if="showBrandAdd" class="add-row">
      <input :class="formStyles.input" v-model="newBrand" type="text" placeholder="Ex: PRUSAMENT" />
      <button class="btn-add" @click="addBrand">+ Ajouter</button>
    </div>

  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'FilamentSection',
  props: {
    material:    { type: String, default: 'PLA+' },
    costPerKg:   { type: Number, default: 0 },
    weight:      { type: Number, default: 0 },
    lossPercent: { type: Number, default: 5 },
    colorCount:  { type: Number, default: 1 },
    purgeWaste:  { type: Number, default: 0 },
  },
  emits: ['update:material', 'update:costPerKg', 'update:weight',
          'update:lossPercent', 'update:colorCount', 'update:purgeWaste'],
  data() {
    return {
      formStyles,
      selectedBrand: 'sunlu',
      newBrand: '',
      newMaterial: '',
      showBrandAdd: false,
      brandLabels: { sunlu: 'SUNLU', eryone: 'ERYONE', bambu: 'Bambu Lab', prusament: 'Prusament', custom: 'Personnalisé' },
      brandPrices: {
        // Prix moyens Amazon France 2025 (1 kg)
        sunlu:     { 'PLA+': 16.99, 'PLA+ 2.0': 19.99, PLA: 14.99, PETG: 17.99, ABS: 15.99, TPU: 21.99 },
        eryone:    { 'PLA+': 16.99, 'PLA+ 2.0': 20.99, PLA: 14.99, PETG: 18.49, ABS: 15.99, TPU: 22.99 },
        bambu:     { 'PLA+': 24.99, 'PLA+ 2.0': 26.99, PLA: 19.99, PETG: 23.99, ABS: 22.99, TPU: 27.99 },
        prusament: { 'PLA+': 27.99, PLA: 24.99, PETG: 26.99, ABS: 25.99 },
      },
      customBrands: [],
      customMaterials: [],
    }
  },
  methods: {
    onMaterialChange(e) {
      const v = e.target.value
      if (v !== 'custom-material') this.$emit('update:material', v)
      this.updatePrice()
    },
    onBrandChange(e) {
      this.selectedBrand = e.target.value
      this.updatePrice()
    },
    updatePrice() {
      const prices = this.brandPrices[this.selectedBrand]
      if (prices) {
        const price = prices[this.material] || 19.99
        this.$emit('update:costPerKg', price)
      }
    },
    addBrand() {
      if (!this.newBrand.trim()) return
      const id = 'custom-' + Date.now()
      this.customBrands.push({ id, name: this.newBrand.trim() })
      this.brandLabels[id] = this.newBrand.trim()
      this.newBrand = ''
      this.showBrandAdd = false
    },
    addMaterial() {
      if (!this.newMaterial.trim()) return
      this.customMaterials.push({ id: 'mat-' + Date.now(), name: this.newMaterial.trim() })
      this.$emit('update:material', this.newMaterial.trim())
      this.newMaterial = ''
      this.updatePrice()
    },
  },
}
</script>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.5rem;
}

.input-unit-wrap { display: flex; align-items: center; gap: 0.5rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.82rem; font-weight: 700; color: #4a5568; white-space: nowrap; }

/* Purge AMS */
.purge-block {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  background: #fff8e8;
  border: 1.5px solid #f6d860;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}
.purge-icon { font-size: 1.2rem; flex-shrink: 0; margin-top: 0.1rem; }
.purge-body { flex: 1; }
.purge-tip { font-size: 0.7rem; font-weight: 400; color: #a07d20; }

.add-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
.add-row input { flex: 1; }

.btn-add {
  padding: 0.5rem 1rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.82rem;
  font-family: inherit;
  white-space: nowrap;
  transition: filter 0.2s ease;
}
.btn-add:hover { filter: brightness(1.07); }

.toggle-link {
  background: none;
  border: none;
  color: #2e9cab;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
  transition: color 0.2s ease;
}
.toggle-link:hover { color: #1f7f97; }
</style>
