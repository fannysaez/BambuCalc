<template>
  <div class="panel-card">

    <div class="panel-header">
      <h2 class="panel-title">Paramètres de calcul</h2>
      <span v-if="settingsLoading" class="settings-loading-badge">Chargement…</span>
    </div>

    <div class="settings-single-col">
      <div class="settings-main-card">

        <div class="settings-card-body">

          <!-- Grille 2 colonnes : Machine | Marge -->
          <div class="settings-params-grid">
            <div class="settings-section">
              <p class="settings-section-title">Machine & Main d'œuvre</p>
              <div class="settings-row">
                <label class="settings-label">Tarif horaire</label>
                <div class="settings-input-wrap">
                  <input class="settings-input" type="number" min="0" step="0.5" v-model.number="priceHourlyRate" />
                  <span class="settings-unit">€/h</span>
                </div>
              </div>
              <div class="settings-row">
                <label class="settings-label">Électricité</label>
                <div class="settings-input-wrap">
                  <input class="settings-input" type="number" min="0" step="0.01" v-model.number="priceElecPerHour" />
                  <span class="settings-unit">€/h</span>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <p class="settings-section-title">Marge & Tarification</p>
              <div class="settings-row">
                <label class="settings-label">Marge standard</label>
                <div class="settings-input-wrap">
                  <input class="settings-input" type="number" min="0" max="300" step="5" v-model.number="priceMarginDefault" />
                  <span class="settings-unit">%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Catalogue info -->
          <div class="settings-section settings-section--wide">
            <p class="settings-section-title">Informations catalogue</p>
            <div class="settings-row">
              <span class="settings-label">Filaments enregistrés</span>
              <span class="settings-catalogue-count">
                {{ materials.length }} filament{{ materials.length > 1 ? 's' : '' }}
              </span>
            </div>
            <p class="settings-intro-inline" style="padding: 0 0.75rem 0.4rem;">
              Gérez vos matières depuis l'onglet
              <button class="settings-link-tab" @click="emit('go-to', 'catalogue')">Catalogue →</button>
            </p>
          </div>

          <!-- Simulateur de coût rapide -->
          <div class="settings-sim-section">
            <div class="settings-sim-hdr">
              <BarChart2 class="settings-sim-hdr-icon" />
              <span class="settings-sim-hdr-title">Simulateur de coût rapide</span>
            </div>

            <div class="settings-sim-inputs">
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Poids de la pièce</label>
                <div class="settings-sim-iw">
                  <input class="settings-sim-input" type="number" min="0" step="1" v-model.number="simWeight" />
                  <span class="settings-sim-unit">g</span>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Durée d'impression</label>
                <div class="settings-sim-duration">
                  <div class="settings-sim-iw">
                    <input class="settings-sim-input settings-sim-input--sm" type="number" min="0" max="99" step="1" v-model.number="simPrintHours" />
                    <span class="settings-sim-unit">h</span>
                  </div>
                  <div class="settings-sim-iw">
                    <input class="settings-sim-input settings-sim-input--sm" type="number" min="0" max="59" step="5" v-model.number="simPrintMinutes" />
                    <span class="settings-sim-unit">min</span>
                  </div>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Matière</label>
                <div class="sim-mat-select-wrap">
                  <img v-if="simSelectedMaterial && isImageUrl(simSelectedMaterial.color_or_image)"
                       class="sim-mat-indicator sim-mat-indicator--img"
                       :src="simSelectedMaterial.color_or_image" :alt="simSelectedMaterial.name" />
                  <span v-else-if="simSelectedMaterial"
                        class="sim-mat-indicator sim-mat-indicator--swatch"
                        :style="{ background: isHexColor(simSelectedMaterial.color_or_image) ? simSelectedMaterial.color_or_image : '#2e9cab' }">
                  </span>
                  <select class="sim-select" v-model="simMaterialId">
                    <option :value="null">— Globaux —</option>
                    <option v-for="m in materials" :key="m.id || m.name" :value="m.id">
                      {{ m.name }}{{ m.brand ? ' · ' + m.brand : '' }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="settings-sim-field">
                <label class="settings-sim-lbl">Type de projet</label>
                <select class="sim-select" v-model="simProjectType">
                  <option v-for="pt in projectTypes" :key="pt.id" :value="pt.id">{{ pt.label }}</option>
                </select>
                <div v-if="simProjectCoeff !== 1" class="sim-coeff-badge" style="margin-top:0.35rem">
                  <span class="sim-coeff-text">Coeff :</span>
                  <strong class="sim-coeff-value">
                    {{ simProjectCoeff > 1 ? '+' : '' }}{{ Math.round((simProjectCoeff - 1) * 100) }}%
                  </strong>
                </div>
              </div>
            </div>

            <div class="settings-sim-results">
              <div class="settings-sim-result">
                <span class="settings-sim-result-lbl">Matière{{ simSelectedMaterial ? ' · ' + simSelectedMaterial.name : '' }}</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simMaterialCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result">
                <span class="settings-sim-result-lbl">Machine + élec.</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simMachineCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--neutral">
                <span class="settings-sim-result-lbl">Coût de revient</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simTotalCost) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--margin">
                <span class="settings-sim-result-lbl">Marge ({{ priceMarginDefault }}%)</span>
                <strong class="settings-sim-result-val">+ {{ fmtEur(simMarginAmount) }}</strong>
              </div>
              <div class="settings-sim-result-sep" />
              <div class="settings-sim-result settings-sim-result--total">
                <span class="settings-sim-result-lbl">Prix de vente estimé</span>
                <strong class="settings-sim-result-val">{{ fmtEur(simSalePrice) }}</strong>
              </div>
            </div>
            <p class="sim-disclaimer">*Indicatif — hors emballage, post-traitement et remises.</p>
          </div>

        </div>
        <!-- /settings-card-body -->

        <div class="settings-single-footer">
          <button class="btn-save-settings" @click="saveSettings" :disabled="settingsSaving || settingsLoading">
            <span v-if="settingsSaved">✓ Sauvegardé</span>
            <span v-else-if="settingsSaving">Sauvegarde…</span>
            <span v-else>Sauvegarder les paramètres</span>
          </button>
          <button class="btn-settings-next" @click="emit('go-to', 'catalogue')">
            Catalogue →
          </button>
        </div>

      </div>
    </div>

    <ToastMessage ref="toast" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import ToastMessage from '@/components/ToastMessage.vue'
import { BarChart2 } from 'lucide-vue-next'

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits(['go-to'])

// ── Toast local ───────────────────────────────────────────────────────────────
const toast = ref(null)

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES (issues de data() dans AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

// ── Prix & paramètres de calcul ───────────────────────────────────────────────
const pricePlaPerKg      = ref(16.99)
const priceHourlyRate    = ref(20)
const priceElecPerHour   = ref(0.5)
const priceLossPercent   = ref(5)
const priceMarginDefault = ref(50)

// ── État sauvegarde ───────────────────────────────────────────────────────────
const settingsSaved   = ref(false)
const settingsSaving  = ref(false)
const settingsLoading = ref(false)

// ── Catalogue matières (chargé localement pour le simulateur) ────────────────
const materials = ref([])

const fallbackMaterials = [
  { id: null, name: 'Sunlu PLA',         brand: 'Sunlu',  type: 'PLA',        cost_per_kg: 20, default_waste_percentage: 10, color_or_image: '#3B82F6' },
  { id: null, name: 'Eryone PLA+',       brand: 'Eryone', type: 'PLA+',       cost_per_kg: 22, default_waste_percentage: 10, color_or_image: '#EF4444' },
  { id: null, name: 'Eryone PLA HS 2.0', brand: 'Eryone', type: 'PLA HS 2.0', cost_per_kg: 24, default_waste_percentage: 10, color_or_image: '#22C55E' },
  { id: null, name: 'Eryone PLA Silk',   brand: 'Eryone', type: 'PLA Silk',   cost_per_kg: 25, default_waste_percentage: 10, color_or_image: '#F59E0B' },
  { id: null, name: 'Sunlu PETG',        brand: 'Sunlu',  type: 'PETG',       cost_per_kg: 22, default_waste_percentage: 12, color_or_image: '#6B7280' },
]

// ── Simulateur ────────────────────────────────────────────────────────────────
const simWeight       = ref(50)
const simPrintHours   = ref(1)
const simPrintMinutes = ref(30)
const simMaterialId   = ref(null)
const simProjectType  = ref('standard')

// ══════════════════════════════════════════════════════════════════════════════
// COMPUTED (issus de computed{} dans AdminDashboard.vue)
// ══════════════════════════════════════════════════════════════════════════════

const projectTypes = [
  { id: 'standard',    label: 'Standard (×1.0)',           coeff: 1.00 },
  { id: 'figurine',    label: 'Figurine (+30%)',           coeff: 1.30 },
  { id: 'serie',       label: 'Série porte-clés (−15%)',   coeff: 0.85 },
  { id: 'technique',   label: 'Pièce technique (+20%)',    coeff: 1.20 },
  { id: 'standqr',     label: 'Stand QR Code (+10%)',      coeff: 1.10 },
  { id: 'deco',        label: 'Décoration (×1.0)',         coeff: 1.00 },
]

const simPrintDuration = computed(() =>
  (simPrintHours.value || 0) + (simPrintMinutes.value || 0) / 60
)

const simSelectedMaterial = computed(() => {
  if (!simMaterialId.value) return null
  return materials.value.find(m => m.id === simMaterialId.value) || null
})

const simEffectivePricePerKg = computed(() =>
  simSelectedMaterial.value
    ? (simSelectedMaterial.value.cost_per_kg || 0)
    : (pricePlaPerKg.value || 0)
)

const simEffectiveLossPercent = computed(() =>
  simSelectedMaterial.value
    ? (simSelectedMaterial.value.default_waste_percentage || 0)
    : (priceLossPercent.value || 0)
)

const simProjectCoeff = computed(() => {
  const pt = projectTypes.find(p => p.id === simProjectType.value)
  return pt ? pt.coeff : 1
})

const simMaterialCost = computed(() => {
  const w = (simWeight.value || 0) / 1000
  return w * simEffectivePricePerKg.value * (1 + simEffectiveLossPercent.value / 100)
})

const simMachineCost = computed(() =>
  simPrintDuration.value * ((priceHourlyRate.value || 0) + (priceElecPerHour.value || 0))
)

const simTotalCost = computed(() => simMaterialCost.value + simMachineCost.value)

const simSalePrice = computed(() =>
  simTotalCost.value * simProjectCoeff.value * (1 + (priceMarginDefault.value || 0) / 100)
)

const simMarginAmount = computed(() => simSalePrice.value - simTotalCost.value)

// ══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES (copiés depuis AdminDashboard.vue — aussi présents dans CatalogueTab)
// ══════════════════════════════════════════════════════════════════════════════

function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function isHexColor(val) {
  return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
}

function isImageUrl(val) {
  if (typeof val !== 'string' || !val.trim()) return false
  return val.startsWith('http://') || val.startsWith('https://') ||
    val.startsWith('data:image/') ||
    /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(val)
}

// ══════════════════════════════════════════════════════════════════════════════
// MÉTHODES (déplacées depuis AdminDashboard.vue methods{})
// ══════════════════════════════════════════════════════════════════════════════

async function loadGlobalSettings() {
  settingsLoading.value = true
  try {
    const { data, error } = await supabase
      .from('bambu_settings')
      .select('*')
      .single()
    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn('[loadGlobalSettings]', error.code, error.message)
      }
      return
    }
    if (!data) return
    pricePlaPerKg.value      = parseFloat(data.price_pla_per_kg)     || 16.99
    priceHourlyRate.value    = parseFloat(data.price_hourly_rate)     || 20
    priceElecPerHour.value   = parseFloat(data.price_elec_per_hour)   || 0.5
    priceLossPercent.value   = parseFloat(data.price_loss_percent)    || 5
    priceMarginDefault.value = parseFloat(data.price_margin_default)  || 50
  } finally {
    settingsLoading.value = false
  }
}

async function saveSettings() {
  settingsSaving.value = true
  try {
    const { error } = await supabase
      .from('bambu_settings')
      .upsert({
        id:                   1,
        price_pla_per_kg:     pricePlaPerKg.value,
        price_hourly_rate:    priceHourlyRate.value,
        price_elec_per_hour:  priceElecPerHour.value,
        price_loss_percent:   priceLossPercent.value,
        price_margin_default: priceMarginDefault.value,
        updated_at:           new Date().toISOString(),
      }, { onConflict: 'id' })
    if (error) throw error
    settingsSaved.value = true
    setTimeout(() => { settingsSaved.value = false }, 2500)
    toast.value?.show('Paramètres de prix sauvegardés dans Supabase.', 'success', 2500)
  } catch (err) {
    console.error('[saveSettings]', err)
    toast.value?.show(`Erreur sauvegarde : ${err.message}`, 'error')
  } finally {
    settingsSaving.value = false
  }
}

async function loadMaterials() {
  try {
    const { data, error } = await supabase
      .from('bambu_materials')
      .select('id, name, brand, type, cost_per_kg, default_waste_percentage, color_or_image, image_url')
      .order('created_at', { ascending: true })
    if (error || !data?.length) {
      if (!materials.value.length) materials.value = fallbackMaterials.map(m => ({ ...m }))
      return
    }
    materials.value = data
  } catch {
    if (!materials.value.length) materials.value = fallbackMaterials.map(m => ({ ...m }))
  }
}

// ── Cycle de vie ──────────────────────────────────────────────────────────────
onMounted(() => {
  loadGlobalSettings()
  loadMaterials()
})
</script>

<style scoped>
/*
 * Le CSS de l'onglet Paramètres est dans AdminDashboard.vue (classes partagées).
 * Les classes spécifiques (.settings-*, .sim-*) seront déplacées ici
 * lors de l'étape finale (remplacement d'AdminDashboard par le shell).
 */
</style>
