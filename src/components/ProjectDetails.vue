<template>
  <div :class="formStyles.section">
    <h2 :class="formStyles.sectionTitle">Détails du Projet</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="projectName">Nom de la pièce</label>
        <input
          id="projectName"
          :class="formStyles.input"
          type="text"
          :value="projectName"
          @input="$emit('update:projectName', $event.target.value)"
          placeholder="Ex: Boîtier de commande"
        />
        <p :class="formStyles.helpText">Donnez un nom à votre projet</p>
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="printProfile">Profil d'impression</label>
        <select
          id="printProfile"
          :class="formStyles.select"
          :value="printProfile"
          @change="$emit('update:printProfile', $event.target.value)"
        >
          <option value="">Sélectionner un profil...</option>
          <option value="normal">Normal (Équilibré)</option>
          <option value="quality">Haute Qualité</option>
          <option value="speed">Vitesse Rapide</option>
          <option value="fine">Fin (Détails)</option>
        </select>
        <p :class="formStyles.helpText">Mode d'impression Bambu Studio</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="printerModel">Modèle d'imprimante</label>
        <select
          id="printerModel"
          :class="formStyles.select"
          :value="printerModel"
          @change="$emit('update:printerModel', $event.target.value)"
        >
          <option value="">Sélectionner un modèle...</option>
          <option value="p2s-mono">Bambu Lab P2S Combo (Monocouleur)</option>
          <option value="p2s-multi">Bambu Lab P2S Combo (Multicouleur)</option>
        </select>
        <p :class="formStyles.helpText">Modèle de votre imprimante</p>
      </div>

      <div :class="formStyles.formGroup">
        <label :class="formStyles.label" for="nozzleSize">Taille de buse</label>
        <select
          id="nozzleSize"
          :class="formStyles.select"
          :value="nozzleSize"
          @change="$emit('update:nozzleSize', $event.target.value)"
        >
          <option value="">Sélectionner une buse...</option>
          <option value="0.2">0.2 mm (Précision)</option>
          <option value="0.4">0.4 mm (Standard)</option>
        </select>
        <p :class="formStyles.helpText">Taille de la buse d'extrusion</p>
      </div>
    </div>
  </div>
</template>

<script>
import formStyles from '../styles/Form.module.css'

export default {
  name: 'ProjectDetails',
  props: {
    projectName: {
      type: String,
      default: '',
    },
    printProfile: {
      type: String,
      default: '',
    },
    printerModel: {
      type: String,
      default: '',
    },
    nozzleSize: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      formStyles,
    }
  },
  emits: ['update:projectName', 'update:printProfile', 'update:printerModel', 'update:nozzleSize'],
}
</script>
