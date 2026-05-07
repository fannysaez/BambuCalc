<template>
  <div :class="formStyles.section">
    <h2 :class="formStyles.sectionTitle">Filaments</h2>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label"
        >Poids total: <strong>{{ weight }} g</strong></label
      >
      <p :class="formStyles.helpText">Poids total estimé de votre pièce imprimée</p>
    </div>

    <div :class="formStyles.divider"></div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="material">Type de filament</label>
        <select
          id="material"
          :class="formStyles.select"
          :value="material"
          @change="onMaterialChange"
        >
          <option value="PLA">PLA</option>
          <option value="PLA+">PLA+</option>
          <option value="PLA+ 2.0">PLA+ 2.0</option>
          <option value="custom-material">Personnalisé</option>
          <optgroup label="─ Mes filaments ─">
            <option v-for="mat in customMaterials" :key="mat.id" :value="mat.name">
              {{ mat.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="brand">Marque</label>
        <select
          id="brand"
          :class="formStyles.select"
          :value="selectedBrand"
          @change="onBrandChange"
        >
          <option value="sunlu">SUNLU</option>
          <option value="eryone">ERYONE</option>
          <option value="custom">Personnalisé</option>
          <optgroup label="─ Mes marques ─">
            <option v-for="brand in customBrands" :key="brand.id" :value="brand.id">
              {{ brand.name }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>

    <div
      :class="formStyles.divider"
      v-if="material === 'custom-material' || selectedBrand === 'custom'"
    ></div>

    <div v-if="material === 'custom-material'" :class="formStyles.formGroup">
      <label :class="formStyles.label" for="customMaterialInput"
        >Nom du filament personnalisé</label
      >
      <div style="display: flex; gap: 8px">
        <input
          id="customMaterialInput"
          :class="formStyles.input"
          v-model="newMaterial"
          type="text"
          placeholder="Ex: TPU, Nylon, ABS..."
          style="flex: 1"
        />
        <button
          @click="addMaterial"
          style="
            padding: 8px 16px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            white-space: nowrap;
            transition: all 0.3s ease;
          "
          @mouseover="$event.target.style.background = '#004a99'"
          @mouseout="$event.target.style.background = '#0066cc'"
        >
          + Ajouter
        </button>
      </div>
    </div>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label" for="costPerKg">Coût / kg</label>
      <div style="display: flex; gap: 8px; align-items: center">
        <input
          id="costPerKg"
          :class="formStyles.input"
          type="number"
          :value="costPerKg"
          @input="$emit('update:costPerKg', parseFloat($event.target.value))"
          step="0.01"
          min="0"
        />
        <span style="font-weight: bold; color: #4a5568">EUR</span>
      </div>
      <p :class="formStyles.helpText" v-if="selectedBrand !== 'custom'">
        Prix standard {{ material }} - {{ brandLabels[selectedBrand] }}
      </p>
      <p :class="formStyles.helpText" v-else>Entrez votre propre prix au kilogramme</p>
    </div>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label" for="weight">Poids</label>
      <div style="display: flex; gap: 8px; align-items: center">
        <input
          id="weight"
          :class="formStyles.input"
          type="number"
          :value="weight"
          @input="$emit('update:weight', parseFloat($event.target.value))"
          step="0.1"
          min="0"
        />
        <span style="font-weight: bold; color: #4a5568">g</span>
      </div>
      <p :class="formStyles.helpText">Poids total estimé de votre pièce</p>
    </div>

    <div :class="formStyles.divider"></div>

    <div :class="formStyles.formGroup">
      <p style="font-size: 0.875rem; color: #718096; font-weight: 600; margin-bottom: 12px">
        Ajouter une nouvelle marque
      </p>
      <div style="display: flex; gap: 8px">
        <input
          :class="formStyles.input"
          v-model="newBrand"
          type="text"
          placeholder="Ex: PRUSAMENT"
          style="flex: 1"
        />
        <button
          @click="addBrand"
          style="
            padding: 8px 16px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            white-space: nowrap;
            transition: all 0.3s ease;
          "
          @mouseover="$event.target.style.background = '#20c997'"
          @mouseout="$event.target.style.background = '#28a745'"
        >
          + Ajouter
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'FilamentSection',
  props: {
    material: {
      type: String,
      default: 'PLA',
    },
    costPerKg: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      formStyles,
      selectedBrand: 'sunlu',
      newBrand: '',
      newMaterial: '',
      brandLabels: {
        sunlu: 'SUNLU',
        eryone: 'ERYONE',
        custom: 'Personnalisé',
      },
      // Prix standards par marque et type
      brandPrices: {
        sunlu: {
          PLA: 15.99,
          'PLA+': 18.99,
          'PLA+ 2.0': 21.99,
        },
        eryone: {
          PLA: 16.5,
          'PLA+': 19.99,
          'PLA+ 2.0': 22.99,
        },
      },
      customBrands: [],
      customMaterials: [],
    }
  },
  methods: {
    onMaterialChange(event) {
      const value = event.target.value
      if (value !== 'custom-material') {
        this.$emit('update:material', value)
      }
      this.updatePrice()
    },
    onBrandChange(event) {
      this.selectedBrand = event.target.value
      this.updatePrice()
    },
    updatePrice() {
      if (this.selectedBrand !== 'custom' && this.brandPrices[this.selectedBrand]) {
        const price = this.brandPrices[this.selectedBrand][this.material] || 19.99
        this.$emit('update:costPerKg', price)
      }
    },
    addBrand() {
      if (this.newBrand.trim()) {
        const brandId = 'custom-' + Date.now()
        this.customBrands.push({
          id: brandId,
          name: this.newBrand,
        })
        this.newBrand = ''
      }
    },
    addMaterial() {
      if (this.newMaterial.trim()) {
        this.customMaterials.push({
          id: 'material-' + Date.now(),
          name: this.newMaterial,
        })
        this.$emit('update:material', this.newMaterial)
        this.newMaterial = ''
        this.updatePrice()
      }
    },
  },
  emits: ['update:material', 'update:costPerKg', 'update:weight'],
}
</script>
