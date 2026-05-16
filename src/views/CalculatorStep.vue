<template>
  <div class="step-page">

    <!-- Stepper -->
    <div class="stepper">
      <div class="stepper-track">
        <div v-for="(s, i) in steps" :key="s.step" class="step-item">
          <div v-if="i > 0" :class="['step-line', currentStep > s.step - 1 && 'step-line-done']"></div>
          <div :class="['step-dot', currentStep === s.step && 'dot-active', currentStep > s.step && 'dot-done']">
            <component v-if="currentStep <= s.step" :is="s.icon" class="dot-icon" />
            <span v-else class="dot-check">✓</span>
          </div>
          <span :class="['step-label', currentStep === s.step && 'label-active', currentStep > s.step && 'label-done']">
            {{ s.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Contenu de l'étape -->
    <div class="step-card">
      <div class="step-card-header">
        <component :is="currentStepDef.icon" class="step-card-icon" />
        <div>
          <p class="step-card-eyebrow">Étape {{ currentStep }} / {{ steps.length }}</p>
          <h2 class="step-card-title">{{ currentStepDef.label }}</h2>
          <p class="step-card-desc">{{ currentStepDef.description }}</p>
        </div>
      </div>

      <div class="step-card-body">
        <!-- Étape 1 — Projet -->
        <ProjectDetails
          v-if="currentStep === 1"
          :quoteNumber="store.quoteNumber"
          :quoteDate="store.quoteDate"
          v-model:quoteValidityDays="store.quoteValidityDays"
          v-model:clientType="store.clientType"
          v-model:clientCivility="store.clientCivility"
          v-model:clientFirstName="store.clientFirstName"
          v-model:clientLastName="store.clientLastName"
          v-model:clientName="store.clientName"
          v-model:clientContactName="store.clientContactName"
          v-model:clientEmail="store.clientEmail"
          v-model:clientPhone="store.clientPhone"
          v-model:clientAddress="store.clientAddress"
          v-model:clientPostalCode="store.clientPostalCode"
          v-model:clientCity="store.clientCity"
          v-model:clientCountry="store.clientCountry"
          v-model:clientSiret="store.clientSiret"
          v-model:clientVatNumber="store.clientVatNumber"
          v-model:quantity="store.quantity"
          v-model:projectName="store.projectName"
          v-model:printProfile="store.printProfile"
          v-model:printerModel="store.printerModel"
          v-model:nozzleSize="store.nozzleSize"
          :showTechnicalFields="isAdmin"
          v-model:referenceImage="store.referenceImage"
          v-model:referenceImageUrl="store.referenceImageUrl"
          v-model:paymentMethod="store.paymentMethod"
          v-model:depositPercent="store.depositPercent"
          v-model:quoteNotes="store.quoteNotes"
        />

        <!-- Étape 2 — Matière -->
        <FilamentSection
          v-if="currentStep === 2"
          v-model:material="store.material"
          v-model:costPerKg="store.costPerKg"
          v-model:weight="store.weight"
          v-model:lossPercent="store.lossPercent"
          v-model:colorCount="store.colorCount"
          v-model:purgeWaste="store.purgeWaste"
        />

        <!-- Étape 3 — Temps -->
        <PrintingTime
          v-if="currentStep === 3"
          v-model:printHours="store.printHours"
          v-model:printMinutes="store.printMinutes"
          v-model:prepTime="store.prepTime"
          v-model:postTime="store.postTime"
          v-model:hourlyRate="store.hourlyRate"
        />

        <!-- Étape 4 — Tarifs -->
        <PricingSuggestions
          v-if="currentStep === 4"
          :baseCost="store.calculatedCosts.totalCost"
          :baseCostPerUnit="store.calculatedCosts.costPerUnit"
          :seriesQuantity="store.quantity"
          :volumeDiscount="0"
          :taxRate="store.taxRate"
          v-model:selectedPricing="store.selectedPricing"
          v-model:customMargin="store.customMargin"
        />

        <!-- Étape 5 — Coûts -->
        <CostBreakdown
          v-if="currentStep === 5"
          :costs="store.calculatedCosts"
          :isAdmin="isAdmin"
        />
      </div>

    </div>

    <!-- Toast notifications -->
    <ToastMessage ref="toast" />

    <!-- Navigation flottante sous la carte -->
    <div class="step-nav">
      <button v-if="currentStep > 1" class="btn-back" @click="goBack">
        ← Retour
      </button>
      <div class="step-nav-right">
        <button
          v-if="currentStep < steps.length"
          class="btn-next"
          @click="goNext"
        >
          Suivant →
        </button>
        <button
          v-if="currentStep === steps.length"
          :class="['btn-save', saveStatus === 'ok' && 'btn-save-ok']"
          :disabled="saving"
          @click="saveQuote"
        >
          <span v-if="saving">Sauvegarde…</span>
          <span v-else-if="saveStatus === 'ok'">✓ {{ isEditMode ? 'Devis mis à jour !' : (isAdmin ? 'Devis sauvegardé !' : 'Demande envoyée !') }}</span>
          <span v-else>{{ isEditMode ? 'Mettre à jour le devis' : (isAdmin ? 'Sauvegarder le devis' : 'Envoyer ma demande') }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { useCalculatorStore } from '../stores/calculator'
import { saveQuote as saveQuoteToDb, updateQuote, checkIsAdmin } from '../utils/auth'
import { supabase } from '../lib/supabase'
import ProjectDetails from '../components/ProjectDetails.vue'
import FilamentSection from '../components/FilamentSection.vue'
import PrintingTime from '../components/PrintingTime.vue'
import PricingSuggestions from '../components/PricingSuggestions.vue'
import CostBreakdown from '../components/CostBreakdown.vue'
import ToastMessage from '../components/ToastMessage.vue'
import { Layers, Package, Clock, Tag, BarChart3 } from 'lucide-vue-next'

export default {
  name: 'CalculatorStep',
  components: { ProjectDetails, FilamentSection, PrintingTime, PricingSuggestions, CostBreakdown, ToastMessage, Layers, Package, Clock, Tag, BarChart3 },
  setup() {
    return { store: useCalculatorStore() }
  },
  async created() {
    this.isAdmin = await checkIsAdmin()
    // Régénère le numéro si le store date d'un autre jour (SPA en mémoire)
    if (!this.store.editingQuoteId && !this.$route.query.editId && this.store.quoteNumberIsStale) {
      this.store.quoteNumber = this.store.quoteNumber.replace(
        /DEV-\d{8}-/,
        `DEV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-`,
      )
    }
  },
  data() {
    return {
      isAdmin: false,
      saving: false,
      saveStatus: null,
      steps: [
        { step: 1, label: 'Projet',  icon: 'Layers',    description: "Nom du projet, imprimante et profil d'impression." },
        { step: 2, label: 'Matière', icon: 'Package',   description: 'Type de filament, coût au kilo et poids estimé.' },
        { step: 3, label: 'Temps',   icon: 'Clock',     description: "Durée d'impression et temps de travail manuel." },
        { step: 4, label: 'Tarifs',  icon: 'Tag',       description: 'Choisissez votre marge et la tarification.' },
        { step: 5, label: 'Coûts',   icon: 'BarChart3', description: 'Résumé complet des coûts et total TTC.' },
      ],
    }
  },
  computed: {
    currentStep() { return Number(this.$route.params.step) || 1 },
    currentStepDef() { return this.steps[this.currentStep - 1] || this.steps[0] },
    isEditMode() { return !!(this.store.editingQuoteId || this.$route.query.editId) },
  },
  methods: {
    validate() {
      const s = this.store
      switch (this.currentStep) {
        case 1: {
          if (!s.projectName?.trim())
            return 'Le nom de la pièce est obligatoire.'
          const hasName = s.clientType === 'particulier'
            ? (s.clientFirstName?.trim() || s.clientLastName?.trim())
            : s.clientName?.trim()
          if (!hasName)
            return 'Le nom du client est obligatoire.'
          return null
        }
        case 2:
          if (!s.costPerKg || s.costPerKg <= 0)
            return 'Le coût du filament au kg est obligatoire.'
          return null
        case 3:
          return null
        default:
          return null
      }
    },
    goNext() {
      const err = this.validate()
      if (err) {
        this.$refs.toast.show(err, 'error')
        return
      }
      const messages = [
        'Projet enregistré ✓',
        'Matière enregistrée ✓',
        'Temps enregistré ✓',
        'Tarif sélectionné ✓',
      ]
      this.$refs.toast.show(messages[this.currentStep - 1] || 'Étape validée ✓', 'success', 2000)
      this.$router.push(`/calculator/${this.currentStep + 1}`)
    },
    goBack() {
      this.$router.push(`/calculator/${this.currentStep - 1}`)
    },
    async saveQuote() {
      this.saving = true
      try {
        const c = this.store.calculatedCosts
        const s = this.store
        const displayName = s.clientType === 'particulier'
          ? [s.clientCivility, s.clientFirstName, s.clientLastName].filter(Boolean).join(' ')
          : s.clientName

        let referenceImageUrl = ''
        if (s.referenceImage) {
          const ext = s.referenceImage.name.split('.').pop()
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('quote-images')
            .upload(path, s.referenceImage, { upsert: true })
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('quote-images').getPublicUrl(path)
            referenceImageUrl = urlData.publicUrl
          }
        }

        const payload = {
          quote_number: s.quoteNumber, quote_date: s.quoteDate,
          quote_validity_days: s.quoteValidityDays,
          payment_method: s.paymentMethod,
          deposit_percent: s.depositPercent,
          quote_notes: s.quoteNotes,
          client_type: s.clientType,
          client_civility: s.clientCivility,
          client_first_name: s.clientFirstName,
          client_last_name: s.clientLastName,
          client_name: displayName,
          client_contact_name: s.clientContactName,
          client_email: s.clientEmail,
          client_phone: s.clientPhone,
          client_address: s.clientAddress,
          client_postal_code: s.clientPostalCode,
          client_city: s.clientCity,
          client_country: s.clientCountry,
          client_siret: s.clientSiret,
          client_vat_number: s.clientVatNumber,
          project_name: s.projectName, quantity: s.quantity,
          print_profile: s.printProfile, printer_model: s.printerModel, nozzle_size: s.nozzleSize,
          material: s.material, cost_per_kg: s.costPerKg,
          weight: s.weight, loss_percent: s.lossPercent, color_count: s.colorCount, purge_waste: s.purgeWaste,
          print_hours: s.printHours, print_minutes: s.printMinutes,
          prep_time: s.prepTime, post_time: s.postTime, hourly_rate: s.hourlyRate,
          packaging_cost: s.packagingCost, tax_rate: s.taxRate,
          selected_pricing: s.selectedPricing, custom_margin: s.customMargin,
          material_cost: c.materialCost, equipment_cost: c.equipmentCost,
          work_cost: c.workCost, total_cost: c.totalCost, cost_per_unit: c.costPerUnit,
          reference_image_url: referenceImageUrl || null,
        }

        const editId = s.editingQuoteId || this.$route.query.editId || null

        let savedQuote
        if (editId) {
          savedQuote = await updateQuote(editId, payload)
          this.$refs.toast.show('Devis mis à jour avec succès !', 'success')
          s.editingQuoteId = null
          this.$router.replace({ query: {} })
        } else {
          savedQuote = await saveQuoteToDb(payload)
          this.$refs.toast.show(this.isAdmin ? 'Devis sauvegardé !' : 'Demande envoyée !', 'success')
          supabase.functions.invoke('send-quote-email', { body: { quote: savedQuote } }).catch(() => {})
          // Remet le store à zéro pour éviter que les données client A se retrouvent dans le devis B
          setTimeout(() => s.resetForNewQuote(), 2000)
        }
        this.saveStatus = 'ok'
      } catch (e) {
        this.saveStatus = null
        this.$refs.toast.show('Erreur lors de la sauvegarde. Réessaie.', 'error')
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.step-page {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: #f0f4f8;
  padding: 1rem 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Stepper ── */
.stepper {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.07);
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.step-nav { flex-shrink: 0; }

.stepper-track {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  position: relative;
}

.step-line {
  position: absolute;
  top: 1rem;
  right: calc(50% + 1.1rem);
  left: calc(-50% + 1.1rem);
  height: 2px;
  background: #e2e8f0;
  transition: background 0.3s ease;
}

.step-line-done { background: #2e9cab; }

.step-dot {
  position: relative;
  z-index: 1;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #a0aec0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.dot-active {
  border-color: #2e9cab;
  background: #2e9cab;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(46,156,171,0.15);
  transform: scale(1.12);
}

.dot-done {
  border-color: #2e9cab;
  background: #e8f7f9;
  color: #2e9cab;
}

.dot-icon { width: 0.9rem; height: 0.9rem; }
.dot-check { font-size: 0.78rem; font-weight: 700; }

.step-label { font-size: 0.68rem; font-weight: 600; color: #a0aec0; text-align: center; white-space: nowrap; }
.label-active { color: #2e9cab; font-weight: 700; }
.label-done { color: #1f7f97; }

/* ── Carte de l'étape ── */
.step-card {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  max-height: calc(100dvh - 180px);
  display: flex;
  flex-direction: column;
}

.step-card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  background: linear-gradient(135deg, #f8fffe 0%, #fff 100%);
}

.step-card-icon {
  width: 1.6rem;
  height: 1.6rem;
  color: #2e9cab;
  flex-shrink: 0;
}

.step-card-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2e9cab;
  margin: 0 0 0.1rem;
}

.step-card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.1rem;
  letter-spacing: -0.02em;
}

.step-card-desc {
  font-size: 0.8rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

.step-card-body {
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}

.step-card-body::-webkit-scrollbar { display: none; }

/* ── Navigation flottante ── */
.step-nav {
  width: 100%;
  max-width: 640px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.25rem;
}

.step-nav-right {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn-back {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 4px 14px rgba(29, 18, 43, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #718096;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-back:hover { color: #2e9cab; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(29, 18, 43, 0.13); }

.btn-next {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.btn-next:hover { filter: brightness(1.06); transform: translateY(-1px); }

.btn-save {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.btn-save:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-save-ok {
  background: linear-gradient(180deg, #2ecc71 0%, #27ae60 100%);
  box-shadow: 0 4px 14px rgba(39,174,96,0.3);
}

.save-error {
  margin: 0 1.5rem 1rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(231,76,60,0.07);
  border: 1px solid rgba(231,76,60,0.22);
  color: #c0392b;
  font-size: 0.82rem;
}

@media (max-width: 640px) {
  .step-page { padding: 0.75rem 0.75rem 0.5rem; gap: 0.5rem; }
  .step-card-header { padding: 0.75rem 1rem; }
  .step-nav { padding: 0; }
  .stepper { padding: 0.75rem 1rem; }
  .step-label { display: none; }
}
</style>
