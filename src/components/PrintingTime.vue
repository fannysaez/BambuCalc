<template>
  <div :class="formStyles.section">

    <!-- Durée d'impression (depuis Bambu Studio) -->
    <div class="block-label">Durée d'impression <span class="hint">— affiché dans Bambu Studio</span></div>
    <div class="grid-2" style="margin-bottom:0.75rem">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="printHours">Heures</label>
        <div class="input-unit-wrap">
          <input id="printHours" :class="formStyles.input" type="number"
            :value="printHours" @input="$emit('update:printHours', parseFloat($event.target.value))"
            min="0" />
          <span class="unit">h</span>
        </div>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="printMinutes">Minutes</label>
        <div class="input-unit-wrap">
          <input id="printMinutes" :class="formStyles.input" type="number"
            :value="printMinutes" @input="$emit('update:printMinutes', parseFloat($event.target.value))"
            min="0" max="59" />
          <span class="unit">min</span>
        </div>
      </div>
    </div>

    <div class="sep" />

    <!-- Temps de travail manuel -->
    <div class="block-label">Temps de travail <span class="hint">— facturé à votre taux horaire</span></div>
    <div class="grid-2">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="prepTime">Préparation</label>
        <div class="input-unit-wrap">
          <input id="prepTime" :class="formStyles.input" type="number"
            :value="prepTime" @input="$emit('update:prepTime', parseFloat($event.target.value))"
            step="5" min="0" />
          <span class="unit">min</span>
        </div>
        <p :class="formStyles.helpText">Slicing, mise en plateau</p>
      </div>
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="postTime">Post-traitement</label>
        <div class="input-unit-wrap">
          <input id="postTime" :class="formStyles.input" type="number"
            :value="postTime" @input="$emit('update:postTime', parseFloat($event.target.value))"
            step="5" min="0" />
          <span class="unit">min</span>
        </div>
        <p :class="formStyles.helpText">Supports, ponçage, peinture…</p>
      </div>
    </div>

    <!-- Taux horaire -->
    <div class="rate-row">
      <label :class="formStyles.label" for="hourlyRate">Taux horaire main-d'œuvre</label>
      <div class="input-unit-wrap" style="max-width:160px">
        <input id="hourlyRate" :class="formStyles.input" type="number"
          :value="hourlyRate" @input="$emit('update:hourlyRate', parseFloat($event.target.value))"
          step="1" min="0" />
        <span class="unit">€/h</span>
      </div>
    </div>

  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'PrintingTime',
  props: {
    printHours:  { type: Number, default: 0 },
    printMinutes:{ type: Number, default: 0 },
    prepTime:    { type: Number, default: 15 },
    postTime:    { type: Number, default: 0 },
    hourlyRate:  { type: Number, default: 20 },
  },
  emits: ['update:printHours', 'update:printMinutes', 'update:prepTime', 'update:postTime', 'update:hourlyRate'],
  data() { return { formStyles } },
}
</script>

<style scoped>
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }

.block-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}
.hint { font-size: 0.68rem; font-weight: 400; color: #a0aec0; text-transform: none; letter-spacing: 0; }

.sep { height: 1px; background: #e2e8f0; margin: 0.5rem 0; }

.input-unit-wrap { display: flex; align-items: center; gap: 0.5rem; }
.input-unit-wrap input { flex: 1; }
.unit { font-size: 0.82rem; font-weight: 700; color: #4a5568; white-space: nowrap; }

.rate-row { margin-top: 0.75rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.rate-row label { margin-bottom: 0; white-space: nowrap; }
</style>
