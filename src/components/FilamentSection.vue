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

    <!-- Coût/kg + Poids pièce -->
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
            step="0.1" min="0" placeholder="Ex : 45" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Poids estimé de votre pièce en grammes</p>
      </div>
    </div>

    <!-- Nombre de couleurs — boutons visuels -->
    <div :class="formStyles.formGroup">
      <label :class="formStyles.label">Nombre de couleurs</label>
      <div class="count-buttons">
        <button
          v-for="n in 4" :key="n"
          type="button"
          :class="['count-btn', colorCount === n && 'count-btn--active']"
          @click="$emit('update:colorCount', n)"
        >
          <span class="count-dot-row">
            <span v-for="i in n" :key="i" class="count-dot"></span>
          </span>
          <span class="count-label">{{ n === 1 ? 'Mono' : n + ' coul.' }}</span>
        </button>
      </div>
    </div>

    <!-- Palette couleurs (si > 1 couleur) -->
    <div v-if="colorCount > 1" class="palette-block">
      <p class="palette-title">Couleurs souhaitées <span class="palette-counter">{{ selectedColors.length }} / {{ colorCount }}</span></p>
      <div class="palette-grid">
        <button
          v-for="c in colorPalette" :key="c.hex"
          type="button"
          :class="['swatch', selectedColors.includes(c.hex) && 'swatch--on']"
          :style="{ background: c.hex, border: c.hex === '#FFFFFF' ? '1.5px solid #e2e8f0' : 'none' }"
          :title="c.name"
          :disabled="!selectedColors.includes(c.hex) && selectedColors.length >= colorCount"
          @click="toggleColor(c.hex)"
        >
          <span v-if="selectedColors.includes(c.hex)" class="swatch-check" :style="{ color: c.dark ? '#fff' : '#1b2f39' }">✓</span>
        </button>
      </div>
      <p v-if="selectedColors.length > 0" class="palette-chosen">
        {{ selectedColors.map(h => colorPalette.find(c=>c.hex===h)?.name).filter(Boolean).join(', ') }}
      </p>
    </div>

    <!-- Options avancées (perte supports + purge AMS) -->
    <button class="toggle-link" @click="showAdvanced = !showAdvanced">
      {{ showAdvanced ? '− Options avancées' : '+ Options avancées' }}
      <span class="advanced-hint">(réservé au prestataire)</span>
    </button>
    <div v-if="showAdvanced" class="advanced-block">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="lossPercent">Perte supports / brim</label>
        <div class="input-unit-wrap">
          <input id="lossPercent" :class="formStyles.input" type="number"
            :value="lossPercent" @input="$emit('update:lossPercent', parseFloat($event.target.value))"
            step="1" min="0" max="50" />
          <span class="unit">%</span>
        </div>
        <p :class="formStyles.helpText">5 % par défaut — augmenter si beaucoup de supports</p>
      </div>
      <div v-if="colorCount > 1" :class="formStyles.formGroup">
        <label :class="formStyles.label" for="purgeWaste">Purge AMS estimée</label>
        <div class="input-unit-wrap">
          <input id="purgeWaste" :class="formStyles.input" type="number"
            :value="purgeWaste" @input="$emit('update:purgeWaste', parseFloat($event.target.value))"
            step="1" min="0" />
          <span class="unit">g</span>
        </div>
        <p :class="formStyles.helpText">Poids de la tour de purge (Bambu Studio)</p>
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
      showAdvanced: false,
      selectedColors: [],
      colorPalette: [
        { hex: '#FFFFFF', name: 'Blanc',    dark: false },
        { hex: '#1A1A1A', name: 'Noir',     dark: true  },
        { hex: '#9E9E9E', name: 'Gris',     dark: true  },
        { hex: '#F44336', name: 'Rouge',    dark: true  },
        { hex: '#2196F3', name: 'Bleu',     dark: true  },
        { hex: '#4CAF50', name: 'Vert',     dark: true  },
        { hex: '#FFEB3B', name: 'Jaune',    dark: false },
        { hex: '#FF9800', name: 'Orange',   dark: true  },
        { hex: '#9C27B0', name: 'Violet',   dark: true  },
        { hex: '#E91E63', name: 'Rose',     dark: true  },
        { hex: '#D4A574', name: 'Beige',    dark: false },
        { hex: '#00BCD4', name: 'Cyan',     dark: true  },
      ],
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
    toggleColor(hex) {
      const idx = this.selectedColors.indexOf(hex)
      if (idx === -1) {
        if (this.selectedColors.length < this.colorCount)
          this.selectedColors.push(hex)
      } else {
        this.selectedColors.splice(idx, 1)
      }
    },
  },
  watch: {
    colorCount(n) {
      if (this.selectedColors.length > n)
        this.selectedColors = this.selectedColors.slice(0, n)
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

/* ── Boutons nombre de couleurs ── */
.count-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.count-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  flex: 1;
  min-width: 60px;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.count-btn:hover { border-color: #2e9cab; background: #f0fbfc; }
.count-btn--active {
  border-color: #2e9cab;
  background: linear-gradient(135deg, #e8f7f9, #d0f0f5);
  box-shadow: 0 0 0 3px rgba(46,156,171,0.15);
}
.count-dot-row { display: flex; gap: 3px; }
.count-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2e9cab;
}
.count-btn--active .count-dot { background: #1f7f97; }
.count-label { font-size: 0.7rem; font-weight: 700; color: #718096; }
.count-btn--active .count-label { color: #1f7f97; }

/* ── Palette couleurs ── */
.palette-block {
  padding: 0.85rem 1rem;
  background: #f8fffe;
  border: 1.5px solid #b2e8ef;
  border-radius: 12px;
  margin-bottom: 0.5rem;
}
.palette-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4a5568;
  margin: 0 0 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.palette-counter {
  font-size: 0.68rem;
  background: #2e9cab;
  color: #fff;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}
.palette-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}
.swatch {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
}
.swatch:hover:not(:disabled) { transform: scale(1.12); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.swatch--on { box-shadow: 0 0 0 3px #2e9cab, 0 2px 8px rgba(0,0,0,0.15); transform: scale(1.08); }
.swatch:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.swatch-check { font-size: 0.75rem; font-weight: 800; }
.palette-chosen { font-size: 0.75rem; color: #718096; margin: 0; font-style: italic; }

/* ── Options avancées ── */
.toggle-link {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.toggle-link:hover { color: #2e9cab; }
.advanced-hint { font-weight: 400; font-size: 0.74rem; }
.advanced-block {
  padding: 0.75rem 1rem;
  background: #f7f9fc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

/* ── Ajouter ── */
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
</style>
