<template>
  <div :class="formStyles.section">
    <h2 :class="formStyles.sectionTitle">Temps d'Impression</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="hours">Heures</label>
        <input
          id="hours"
          :class="formStyles.input"
          type="number"
          :value="hours"
          @input="$emit('update:hours', parseFloat($event.target.value))"
          min="0"
        />
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="minutes">Minutes</label>
        <input
          id="minutes"
          :class="formStyles.input"
          type="number"
          :value="minutes"
          @input="$emit('update:minutes', parseFloat($event.target.value))"
          min="0"
          max="59"
        />
      </div>
    </div>

    <div :class="formStyles.divider"></div>

    <div :class="formStyles.formGroup">
      <label :class="formStyles.label" for="workTime">Temps de travail</label>
      <div style="display: flex; gap: 8px; align-items: center">
        <input
          id="workTime"
          :class="formStyles.input"
          type="number"
          :value="workTime"
          @input="$emit('update:workTime', parseFloat($event.target.value))"
          step="0.5"
          min="0"
        />
        <span style="font-weight: bold; color: #4a5568">min</span>
      </div>
      <p :class="formStyles.helpText">Temps de travail (préparation, post-traitement, etc.)</p>
    </div>
  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'PrintingTime',
  props: {
    hours: {
      type: Number,
      default: 0,
    },
    minutes: {
      type: Number,
      default: 0,
    },
    workTime: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      formStyles,
    }
  },
  emits: ['update:hours', 'update:minutes', 'update:workTime'],
}
</script>
