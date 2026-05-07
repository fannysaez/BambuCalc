<template>
  <div :class="styles.calculatorShell">
    <div :class="styles.roadmap">
      <div :class="styles.roadmapHeader">
        <div :class="styles.roadmapEyebrow">Roadmap du devis</div>
        <div :class="styles.roadmapTitle">Suivre les étapes de votre devis</div>
      </div>

      <div :class="styles.roadmapMeta">
        <div :class="styles.roadmapProgress">
          Étape {{ currentStepIndex }} / {{ roadmapSteps.length }}
        </div>

        <button
          :class="styles.roadmapButton"
          type="button"
          :disabled="isLastStep"
          @click="advanceStep"
        >
          Étape suivante
        </button>
      </div>

      <div :class="styles.roadmapProgressTrack">
        <div :class="styles.roadmapProgressFill" :style="{ width: progressPercent + '%' }"></div>
      </div>

      <div :class="styles.roadmapFocus">
        <div :class="styles.roadmapFocusLabel">Étape en cours</div>
        <div :class="styles.roadmapFocusTitle">{{ currentRoadmapStep.label }}</div>
        <div :class="styles.roadmapFocusText">{{ currentRoadmapStep.description }}</div>
      </div>

      <div :class="styles.roadmapSteps">
        <button
          v-for="step in roadmapSteps"
          :key="step.id"
          :class="[
            styles.roadmapStep,
            currentStepIndex === step.index && styles.roadmapStepActive,
            currentStepIndex > step.index && styles.roadmapStepCompleted,
          ]"
          type="button"
          :disabled="step.index > currentStepIndex + 1"
          @click="goToStep(step.id)"
        >
          <span :class="styles.roadmapStepIndex">{{ step.index }}</span>
          <span :class="styles.roadmapStepLabel">{{ step.label }}</span>
        </button>
      </div>
    </div>

    <div :class="styles.calculator">
      <!-- Panneau gauche: Détails du projet -->
      <div :class="styles.leftPanel">
        <section id="step-project" :class="styles.sectionAnchor">
          <ProjectDetails
            v-model:projectName="formData.projectName"
            v-model:printProfile="formData.printProfile"
            v-model:printerModel="formData.printerModel"
            v-model:nozzleSize="formData.nozzleSize"
          />
        </section>

        <section v-if="currentStepIndex >= 2" id="step-filament" :class="styles.sectionAnchor">
          <FilamentSection
            v-model:material="formData.material"
            v-model:costPerKg="formData.costPerKg"
            v-model:weight="formData.weight"
          />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Filaments</div>
          <div :class="styles.lockedText">Section verrouillée.</div>
        </div>

        <section v-if="currentStepIndex >= 3" id="step-printing" :class="styles.sectionAnchor">
          <PrintingTime
            v-model:hours="formData.hours"
            v-model:minutes="formData.minutes"
            v-model:workTime="formData.workTime"
          />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Temps d'impression</div>
          <div :class="styles.lockedText">À venir après la matière.</div>
        </div>

        <section v-if="currentStepIndex >= 4" id="step-series" :class="styles.sectionAnchor">
          <ProductionSeries
            v-model:seriesMode="formData.seriesMode"
            v-model:seriesSettings="formData.seriesSettings"
          />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Production en série</div>
          <div :class="styles.lockedText">Débloquée après le temps.</div>
        </div>
      </div>

      <!-- Panneau droit: Tarification puis répartition -->
      <div :class="styles.rightPanel">
        <section v-if="currentStepIndex >= 5" id="step-pricing" :class="styles.sectionAnchor">
          <PricingSuggestions
            :baseCost="calculatedCosts.totalCost"
            :baseCostPerUnit="calculatedCosts.costPerUnit"
            :seriesQuantity="calculatedCosts.quantity"
            :volumeDiscount="
              formData.seriesSettings && formData.seriesSettings.volumeDiscount
                ? formData.seriesSettings.volumeDiscount
                : 0
            "
            :taxRate="formData.taxRate"
            v-model:selectedPricing="selectedPricing"
            v-model:customMargin="customMargin"
          />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Tarification suggérée</div>
          <div :class="styles.lockedText">Affichée après la production.</div>
        </div>

        <section v-if="currentStepIndex >= 6" id="step-breakdown" :class="styles.sectionAnchor">
          <CostBreakdown :costs="calculatedCosts" />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Répartition des coûts</div>
          <div :class="styles.lockedText">Visible après la tarification.</div>
        </div>

        <section v-if="currentStepIndex >= 7" id="step-advanced" :class="styles.sectionAnchor">
          <AdvancedSettings />
        </section>

        <div v-else :class="[styles.section, styles.lockedStep]">
          <div :class="styles.lockedTitle">Paramètres avancés</div>
          <div :class="styles.lockedText">Dernière étape du parcours.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectDetails from './ProjectDetails.vue'
import FilamentSection from './FilamentSection.vue'
import PrintingTime from './PrintingTime.vue'
import ProductionSeries from './ProductionSeries.vue'
import AdvancedSettings from './AdvancedSettings.vue'
import CostBreakdown from './CostBreakdown.vue'
import PricingSuggestions from './PricingSuggestions.vue'
import styles from '../styles/Calculator.module.css'

export default {
  name: 'Calculator',
  components: {
    ProjectDetails,
    FilamentSection,
    PrintingTime,
    ProductionSeries,
    AdvancedSettings,
    CostBreakdown,
    PricingSuggestions,
  },
  data() {
    return {
      styles,
      formData: {
        projectName: 'Pièce test',
        printProfile: 'normal',
        printerModel: 'p2s-mono',
        nozzleSize: '0.4',
        material: 'PLA',
        costPerKg: 19.99,
        weight: 0,
        hours: 0,
        minutes: 0,
        workTime: 0,
        packagingCost: 0,
        // production en série
        seriesMode: false,
        seriesSettings: {
          quantity: 10,
          volumeDiscount: 5,
          scrapRate: 2,
          setupCost: 50,
          prepTimeMinutes: 15,
          changeMaterialMinutes: 10,
          packagingCostUnit: 0.2,
          productionDays: 7,
        },
        taxRate: 20,
      },
      selectedPricing: 'standard',
      customMargin: 50,
      currentStepIndex: 1,
      roadmapSteps: [
        {
          id: 'step-project',
          index: 1,
          label: 'Projet',
          description: "Nom, profil d'impression, modèle et buse.",
        },
        {
          id: 'step-filament',
          index: 2,
          label: 'Matière',
          description: 'Type de filament, marque, coût au kilo et poids.',
        },
        {
          id: 'step-printing',
          index: 3,
          label: 'Temps',
          description: 'Heures, minutes et temps de travail.',
        },
        {
          id: 'step-series',
          index: 4,
          label: 'Série',
          description: 'Réglages pour les productions en plusieurs exemplaires.',
        },
        {
          id: 'step-pricing',
          index: 5,
          label: 'Tarifs',
          description: 'Choisir la marge ou la tarification suggérée.',
        },
        {
          id: 'step-breakdown',
          index: 6,
          label: 'Coûts',
          description: 'Voir le détail des coûts et le total TTC.',
        },
        {
          id: 'step-advanced',
          index: 7,
          label: 'Réglages',
          description: 'Paramètres avancés de production et machine.',
        },
      ],
    }
  },
  methods: {
    goToStep(stepId) {
      const targetIndex = this.roadmapSteps.findIndex((step) => step.id === stepId) + 1

      if (targetIndex > this.currentStepIndex + 1) {
        return
      }

      this.currentStepIndex = Math.max(this.currentStepIndex, targetIndex)

      this.$nextTick(() => {
        const target = document.getElementById(stepId)

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    advanceStep() {
      if (this.currentStepIndex < this.roadmapSteps.length) {
        this.currentStepIndex += 1
        const nextStep = this.roadmapSteps[this.currentStepIndex - 1]

        if (nextStep) {
          this.$nextTick(() => {
            const target = document.getElementById(nextStep.id)

            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          })
        }
      }
    },
  },
  computed: {
    isLastStep() {
      return this.currentStepIndex >= this.roadmapSteps.length
    },
    currentRoadmapStep() {
      return this.roadmapSteps[this.currentStepIndex - 1] || this.roadmapSteps[0]
    },
    progressPercent() {
      const max = Math.max(1, this.roadmapSteps.length - 1)
      const pct = ((this.currentStepIndex - 1) / max) * 100
      return Math.min(100, Math.max(0, Math.round(pct)))
    },
    calculatedCosts() {
      // production series settings
      const seriesMode = !!this.formData.seriesMode
      const s = Object.assign(
        {
          quantity: 1,
          scrapRate: 0,
          setupCost: 0,
          prepTimeMinutes: 0,
          changeMaterialMinutes: 0,
          packagingCostUnit: 0,
          volumeDiscount: 0,
        },
        this.formData.seriesSettings || {},
      )

      const quantity = seriesMode ? Math.max(1, Number(s.quantity) || 1) : 1
      const scrapMultiplier = 1 + (Number(s.scrapRate) || 0) / 100
      const effectiveUnits = quantity * scrapMultiplier

      // Material: weight is grams per unit
      const materialPerUnitKg = (Number(this.formData.weight) || 0) / 1000
      const materialCost =
        materialPerUnitKg * (Number(this.formData.costPerKg) || 0) * effectiveUnits

      // Time-based costs: assume hours/minutes are time per unit
      const timePerUnitHours =
        (Number(this.formData.hours) || 0) + (Number(this.formData.minutes) || 0) / 60
      const totalPrintHours = timePerUnitHours * effectiveUnits
      const machineRatePerHour = 5
      const equipmentCost = totalPrintHours * machineRatePerHour

      // Work cost: workTime is minutes per unit (manual interventions)
      const labourRatePerHour = 15
      const workTimePerUnitHours = (Number(this.formData.workTime) || 0) / 60
      const workCost = workTimePerUnitHours * labourRatePerHour * effectiveUnits

      // Setup and prep: one-off per lot, amortized per unit
      const setupCostTotal = Number(s.setupCost) || 0
      const prepLaborHours = (Number(s.prepTimeMinutes) || 0) / 60
      const changeMaterialHours = (Number(s.changeMaterialMinutes) || 0) / 60
      const setupLaborCost = (prepLaborHours + changeMaterialHours) * labourRatePerHour
      const amortizedSetupPerUnit = quantity > 0 ? (setupCostTotal + setupLaborCost) / quantity : 0

      // Packaging: per unit if seriesMode, otherwise use formData.packagingCost as job-level
      const packagingPerUnit = Number(s.packagingCostUnit) || 0
      const packagingCost = seriesMode
        ? packagingPerUnit * quantity
        : Number(this.formData.packagingCost) || 0

      const subtotalBeforeTax =
        materialCost + equipmentCost + workCost + packagingCost + setupCostTotal + setupLaborCost
      const tax = (subtotalBeforeTax * (Number(this.formData.taxRate) || 0)) / 100
      const totalAfterTax = subtotalBeforeTax + tax

      return {
        quantity,
        effectiveUnits: Math.round(effectiveUnits * 100) / 100,
        materialCost: Math.round(materialCost * 100) / 100,
        equipmentCost: Math.round(equipmentCost * 100) / 100,
        workCost: Math.round(workCost * 100) / 100,
        packagingCost: Math.round(packagingCost * 100) / 100,
        setupCostTotal: Math.round(setupCostTotal * 100) / 100,
        setupLaborCost: Math.round(setupLaborCost * 100) / 100,
        amortizedSetupPerUnit: Math.round(amortizedSetupPerUnit * 100) / 100,
        subtotal: Math.round(subtotalBeforeTax * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        totalCost: Math.round(totalAfterTax * 100) / 100,
        costPerUnit: Math.round((totalAfterTax / Math.max(1, quantity)) * 100) / 100,
      }
    },
  },
}
</script>

<style module="styles">
@import '../styles/Calculator.module.css';
</style>
