<template>
  <div class="cat-wrap">

    <!-- ══════════════════════════════════════════════════════════
         EN-TÊTE : titre + boutons
         Mobile  → titre en haut, boutons côte à côte en dessous
         Tablet+ → tout sur une seule ligne
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-header">
      <h2 class="cat-title">
        Catalogue de matières
        <span v-if="materialsLoading" class="cat-badge">Chargement…</span>
        <span v-if="matUploading"     class="cat-badge cat-badge--teal">Upload…</span>
      </h2>
      <div class="cat-actions">
        <button class="cat-btn-add" @click="$emit('add-row')">
          + Ajouter un filament
        </button>
        <button
          class="cat-btn-save"
          :disabled="materialsSaving"
          :title="materialsSaving ? 'Sauvegarde…' : 'Sauvegarder le catalogue'"
          @click="$emit('save')"
        >
          <span v-if="materialsSaving" class="cat-spinner" />
          <Save v-else :size="18" />
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TABLEAU — Tablette & Desktop (≥ 641 px)
         Colonnes compactes → tout tient sur iPad portrait (768 px)
         sans scroll horizontal.
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-table-wrap">
      <table class="cat-table">
        <thead>
          <tr>
            <th class="cat-th c-color">Couleur</th>
            <th class="cat-th c-photo">Photo</th>
            <th class="cat-th c-name">Nom</th>
            <th class="cat-th c-brand">Marque</th>
            <th class="cat-th c-type">Type</th>
            <th class="cat-th c-num">€/kg</th>
            <th class="cat-th c-num">Perte%</th>
            <th class="cat-th c-dep">Départ</th>
            <th class="cat-th c-dep c-restant">Restant</th>
            <th class="cat-th c-stock">Statut</th>
            <th class="cat-th c-act"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(mat, idx) in paginated"
            :key="mat.id || idx"
            class="cat-row"
          >
            <!-- Couleur -->
            <td class="cat-td c-color">
              <div class="cat-color-cell">
                <span class="cat-swatch" :style="swatchBg(mat)" />
                <input
                  type="color" class="cat-color-inp"
                  :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
                  @input="mat.color_or_image = $event.target.value"
                  title="Couleur"
                />
                <span class="cat-hex-lbl">{{ hexLabel(mat) }}</span>
              </div>
            </td>

            <!-- Photo bobine -->
            <td class="cat-td c-photo">
              <div class="cat-photo-cell">
                <img
                  v-if="mat.image_url"
                  class="cat-thumb"
                  :src="mat.image_url"
                  :alt="mat.name"
                  @error="$event.target.style.opacity = '0.3'"
                />
                <div v-else class="cat-thumb-empty">
                  <ImageIcon :size="12" />
                </div>
                <div class="cat-photo-btns">
                  <label
                    class="cat-icn-btn"
                    :class="matUploading && 'cat-icn-btn--off'"
                    :title="mat.image_url ? 'Modifier photo' : 'Ajouter photo'"
                  >
                    <Upload :size="11" />
                    <input
                      type="file" accept="image/*"
                      style="display:none"
                      :disabled="matUploading"
                      @change="$emit('upload', mat, $event)"
                    />
                  </label>
                  <button
                    v-if="mat.image_url"
                    class="cat-icn-btn cat-icn-btn--danger"
                    @click="$emit('clear-image', mat)"
                    title="Supprimer photo"
                  >
                    <Trash2 :size="11" />
                  </button>
                </div>
              </div>
            </td>

            <!-- Nom -->
            <td class="cat-td">
              <input class="cat-input" type="text" v-model="mat.name" placeholder="Nom…" />
            </td>

            <!-- Marque -->
            <td class="cat-td">
              <select
                class="cat-select"
                :value="brandVal(mat)"
                @change="onBrand(mat, $event.target.value)"
              >
                <option v-for="b in knownBrands" :key="b">{{ b }}</option>
                <option value="Autre">Autre</option>
              </select>
              <input
                v-if="isCustomBrand(mat)"
                class="cat-input cat-input--xs"
                type="text"
                v-model="mat.brand"
                placeholder="Marque…"
                @input="autoName(mat)"
              />
            </td>

            <!-- Type -->
            <td class="cat-td">
              <select class="cat-select" v-model="mat.type" @change="onType(mat)">
                <option v-for="t in typeOptions" :key="t">{{ t }}</option>
              </select>
            </td>

            <!-- €/kg -->
            <td class="cat-td cat-td--num">
              <input
                class="cat-input cat-input--num"
                type="number" min="0" step="0.01"
                v-model.number="mat.cost_per_kg"
              />
            </td>

            <!-- Perte % -->
            <td class="cat-td cat-td--num">
              <input
                class="cat-input cat-input--num"
                type="number" min="0" max="50" step="1"
                v-model.number="mat.default_waste_percentage"
              />
            </td>

            <!-- Poids départ -->
            <td class="cat-td cat-td--num">
              <div class="cat-unit-wrap">
                <input
                  class="cat-input cat-input--num"
                  type="number" min="0" step="10"
                  v-model.number="mat.poids_depart"
                  placeholder="1000"
                />
                <span class="cat-unit">g</span>
              </div>
            </td>

            <!-- Restant -->
            <td class="cat-td cat-td--num">
              <div class="cat-unit-wrap">
                <input
                  class="cat-input cat-input--num cat-input--restant"
                  type="number" min="0" step="1"
                  v-model.number="mat.poids_restant"
                  :placeholder="mat.poids_depart || 1000"
                />
                <span class="cat-unit">g</span>
              </div>
            </td>

            <!-- Statut stock -->
            <td class="cat-td">
              <div class="cat-stock-cell">
                <span class="cat-led" :class="ledClass(mat.stock_status)" />
                <select class="cat-select cat-select--stock" v-model="mat.stock_status">
                  <option value="En Stock">En Stock</option>
                  <option value="Stock Faible">Stock Faible</option>
                  <option value="Rupture">Rupture</option>
                  <option value="Réapprovisionnement">Réappro.</option>
                </select>
              </div>
            </td>

            <!-- Supprimer -->
            <td class="cat-td cat-td--act">
              <button
                class="cat-del-btn"
                :title="`Supprimer ${mat.name || 'ce filament'}`"
                @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
              >
                <Trash2 :size="14" />
              </button>
            </td>
          </tr>

          <tr v-if="!materialsLoading && materials.length === 0">
            <td colspan="11" class="cat-empty">
              Aucun matériau — cliquez sur "+ Ajouter un filament"
            </td>
          </tr>
          <tr v-if="materialsLoading">
            <td colspan="11" class="cat-empty">Chargement du catalogue…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         GRILLE 2 COLONNES — Tablette uniquement (641 px – 1024 px)
         Masquée par défaut, visible via la media query tablette.
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-tab-grid">
      <p v-if="materialsLoading" class="cat-empty">Chargement…</p>
      <p v-else-if="materials.length === 0" class="cat-empty">
        Aucun filament — cliquez sur "+ Ajouter un filament"
      </p>

      <div
        v-else
        v-for="(mat, idx) in paginated"
        :key="mat.id || idx"
        class="cat-tcard"
      >
        <!-- ── En-tête : couleur + hex + nom + photo + supprimer ── -->
        <div class="cat-tcard-head">
          <span class="cat-swatch" :style="swatchBg(mat)" />
          <input
            type="color" class="cat-color-inp"
            :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
            @input="mat.color_or_image = $event.target.value"
            title="Couleur"
          />
          <span class="cat-tcard-hex">{{ hexLabel(mat) }}</span>
          <input
            class="cat-input cat-tcard-name"
            type="text"
            v-model="mat.name"
            placeholder="Nom du filament…"
          />
          <!-- Photo bobine -->
          <div class="cat-tcard-photo">
            <img
              v-if="mat.image_url"
              class="cat-thumb"
              :src="mat.image_url"
              :alt="mat.name"
              @error="$event.target.style.opacity = '0.3'"
            />
            <div v-else class="cat-thumb-empty"><ImageIcon :size="12" /></div>
            <label class="cat-icn-btn" title="Photo bobine">
              <Upload :size="12" />
              <input type="file" accept="image/*" style="display:none" @change="$emit('upload', mat, $event)" />
            </label>
            <button
              v-if="mat.image_url"
              class="cat-icn-btn cat-icn-btn--danger"
              @click="$emit('clear-image', mat)"
              title="Supprimer photo"
            ><Trash2 :size="12" /></button>
          </div>
          <!-- Bouton supprimer la ligne -->
          <button
            class="cat-del-btn"
            :title="`Supprimer ${mat.name || 'ce filament'}`"
            @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
          ><Trash2 :size="15" /></button>
        </div>

        <!-- ── Champs : grille interne 2 colonnes ── -->
        <div class="cat-tcard-fields">
          <!-- Marque -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Marque</label>
            <select class="cat-select" :value="brandVal(mat)" @change="onBrand(mat, $event.target.value)">
              <option v-for="b in knownBrands" :key="b">{{ b }}</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              v-if="isCustomBrand(mat)"
              class="cat-input cat-input--xs"
              type="text"
              v-model="mat.brand"
              placeholder="Marque…"
              @input="autoName(mat)"
            />
          </div>
          <!-- Type -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Type</label>
            <select class="cat-select" v-model="mat.type" @change="onType(mat)">
              <option v-for="t in typeOptions" :key="t">{{ t }}</option>
            </select>
          </div>
          <!-- €/kg -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">€ / kg</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="0.01" v-model.number="mat.cost_per_kg" />
          </div>
          <!-- Perte % -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Perte %</label>
            <input class="cat-input cat-input--num" type="number" min="0" max="50" step="1" v-model.number="mat.default_waste_percentage" />
          </div>
          <!-- Poids départ -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Départ g</label>
            <input class="cat-input cat-input--num" type="number" min="0" step="10" v-model.number="mat.poids_depart" placeholder="1000" />
          </div>
          <!-- Poids restant -->
          <div class="cat-tcard-field">
            <label class="cat-tcard-lbl">Restant g</label>
            <input class="cat-input cat-input--num cat-input--restant" type="number" min="0" step="1" v-model.number="mat.poids_restant" :placeholder="mat.poids_depart || 1000" />
          </div>
          <!-- Statut stock — pleine largeur -->
          <div class="cat-tcard-field cat-tcard-field--full">
            <label class="cat-tcard-lbl">Statut stock</label>
            <div class="cat-stock-cell">
              <span class="cat-led" :class="ledClass(mat.stock_status)" />
              <select class="cat-select cat-select--stock" v-model="mat.stock_status">
                <option value="En Stock">En Stock</option>
                <option value="Stock Faible">Stock Faible</option>
                <option value="Rupture">Rupture</option>
                <option value="Réapprovisionnement">Réapprovisionnement</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         CARTES — Mobile (≤ 640 px)
         Chaque filament → une carte verticale compacte
    ══════════════════════════════════════════════════════════ -->
    <div class="cat-cards">
      <p v-if="materialsLoading" class="cat-empty">Chargement…</p>
      <p v-else-if="materials.length === 0" class="cat-empty">
        Aucun filament — appuie sur "+ Ajouter un filament"
      </p>

      <div
        v-else
        v-for="(mat, idx) in paginated"
        :key="mat.id || idx"
        class="cat-card"
      >
        <!-- ── Ligne 1 : Couleur + Nom + Supprimer ── -->
        <div class="card-top">
          <span class="card-swatch" :style="swatchBg(mat)" />
          <input
            type="color" class="cat-color-inp"
            :value="isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab'"
            @input="mat.color_or_image = $event.target.value"
            title="Couleur"
          />
          <span class="card-hex">{{ hexLabel(mat) }}</span>
          <input
            class="cat-input card-name-inp"
            type="text"
            v-model="mat.name"
            placeholder="Nom du filament…"
          />
          <button
            class="cat-del-btn"
            :title="`Supprimer ${mat.name || 'ce filament'}`"
            @click="$emit('delete', mat, (currentPage - 1) * perPage + idx)"
          >
            <Trash2 :size="15" />
          </button>
        </div>

        <!-- ── Ligne 2 : Marque / Type (2 colonnes) ── -->
        <div class="card-grid card-grid--2">
          <div class="card-field">
            <label class="card-lbl">Marque</label>
            <select
              class="cat-select"
              :value="brandVal(mat)"
              @change="onBrand(mat, $event.target.value)"
            >
              <option v-for="b in knownBrands" :key="b">{{ b }}</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              v-if="isCustomBrand(mat)"
              class="cat-input"
              type="text"
              v-model="mat.brand"
              placeholder="Marque…"
              @input="autoName(mat)"
            />
          </div>
          <div class="card-field">
            <label class="card-lbl">Type</label>
            <select class="cat-select" v-model="mat.type" @change="onType(mat)">
              <option v-for="t in typeOptions" :key="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- ── Ligne 3 : Valeurs numériques (2 × 2) ── -->
        <div class="card-grid card-grid--4">
          <div class="card-field">
            <label class="card-lbl">€ / kg</label>
            <input
              class="cat-input cat-input--num"
              type="number" min="0" step="0.01"
              v-model.number="mat.cost_per_kg"
            />
          </div>
          <div class="card-field">
            <label class="card-lbl">Perte %</label>
            <input
              class="cat-input cat-input--num"
              type="number" min="0" max="50" step="1"
              v-model.number="mat.default_waste_percentage"
            />
          </div>
          <div class="card-field">
            <label class="card-lbl">Départ g</label>
            <input
              class="cat-input cat-input--num"
              type="number" min="0" step="10"
              v-model.number="mat.poids_depart"
              placeholder="1000"
            />
          </div>
          <div class="card-field">
            <label class="card-lbl">Restant g</label>
            <input
              class="cat-input cat-input--num cat-input--restant"
              type="number" min="0" step="1"
              v-model.number="mat.poids_restant"
              :placeholder="mat.poids_depart || 1000"
            />
          </div>
        </div>

        <!-- ── Ligne 4 : Statut + Photo bobine ── -->
        <div class="card-bottom">
          <span class="cat-led" :class="ledClass(mat.stock_status)" />
          <select class="cat-select card-stock-sel" v-model="mat.stock_status">
            <option value="En Stock">En Stock</option>
            <option value="Stock Faible">Stock Faible</option>
            <option value="Rupture">Rupture</option>
            <option value="Réapprovisionnement">Réappro.</option>
          </select>
          <!-- Photo : miniature ou bouton upload -->
          <label class="cat-icn-btn card-photo-lbl" title="Photo bobine">
            <img
              v-if="mat.image_url"
              class="card-mini-thumb"
              :src="mat.image_url"
              :alt="mat.name"
            />
            <Upload v-else :size="14" />
            <input
              type="file" accept="image/*"
              style="display:none"
              @change="$emit('upload', mat, $event)"
            />
          </label>
          <button
            v-if="mat.image_url"
            class="cat-icn-btn cat-icn-btn--danger"
            @click="$emit('clear-image', mat)"
            title="Supprimer photo"
          >
            <Trash2 :size="13" />
          </button>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         PAGINATION — une seule ligne compacte
    ══════════════════════════════════════════════════════════ -->
    <div v-if="totalPages > 1" class="cat-pgn">
      <button
        class="cat-pgn-btn"
        :disabled="currentPage === 1"
        @click="$emit('update:current-page', currentPage - 1)"
      >← Préc.</button>
      <span class="cat-pgn-info">Page {{ currentPage }} / {{ totalPages }}</span>
      <button
        class="cat-pgn-btn"
        :disabled="currentPage === totalPages"
        @click="$emit('update:current-page', currentPage + 1)"
      >Suiv. →</button>
    </div>

  </div>
</template>

<script>
import { Save, Upload, Trash2, ImageIcon } from 'lucide-vue-next'

const TYPE_DEFAULTS = {
  'PLA':        { cost_per_kg: 20, default_waste_percentage: 10 },
  'PLA+':       { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA+ 2.0':   { cost_per_kg: 22, default_waste_percentage: 10 },
  'PLA HS':     { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA HS 2.0': { cost_per_kg: 24, default_waste_percentage: 10 },
  'PLA Galaxy': { cost_per_kg: 25, default_waste_percentage: 10 },
  'PLA Silk':   { cost_per_kg: 25, default_waste_percentage: 10 },
  'Matt':       { cost_per_kg: 20, default_waste_percentage: 10 },
  'PETG':       { cost_per_kg: 22, default_waste_percentage: 12 },
}

export default {
  name: 'CatalogueSection',
  components: { Save, Upload, Trash2, ImageIcon },

  props: {
    materials:        { type: Array,   required: true },
    materialsLoading: { type: Boolean, default: false },
    materialsSaving:  { type: Boolean, default: false },
    matUploading:     { type: Boolean, default: false },
    currentPage:      { type: Number,  default: 1 },
    perPage:          { type: Number,  default: 4 },
    knownBrands:      { type: Array,   default: () => ['Bambu Lab', 'Eryone', 'Sunlu'] },
  },

  emits: ['add-row', 'save', 'delete', 'upload', 'clear-image', 'update:current-page'],

  data() {
    return {
      typeOptions: [
        'PLA', 'PLA+', 'PLA+ 2.0', 'PLA HS', 'PLA HS 2.0',
        'PLA Galaxy', 'PLA Silk', 'Matt', 'PETG',
      ],
    }
  },

  computed: {
    paginated() {
      const start = (this.currentPage - 1) * this.perPage
      return this.materials.slice(start, start + this.perPage)
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.materials.length / this.perPage))
    },
  },

  methods: {
    /* ── Couleur ── */
    isHex(val) {
      return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
    },
    swatchBg(mat) {
      return { background: this.isHex(mat.color_or_image) ? mat.color_or_image : '#2e9cab' }
    },
    hexLabel(mat) {
      return (this.isHex(mat.color_or_image) ? mat.color_or_image : '#2E9CAB').toUpperCase()
    },

    /* ── Stock LED ── */
    ledClass(status) {
      if (status === 'Stock Faible')        return 'cat-led--low'
      if (status === 'Rupture')             return 'cat-led--out'
      if (status === 'Réapprovisionnement') return 'cat-led--reorder'
      return 'cat-led--ok'
    },

    /* ── Marque ── */
    brandVal(mat) {
      return this.knownBrands.includes(mat.brand) ? mat.brand : 'Autre'
    },
    isCustomBrand(mat) {
      return !this.knownBrands.includes(mat.brand)
    },
    onBrand(mat, value) {
      if (value !== 'Autre') {
        mat.brand = value
        this.autoName(mat)
      }
      // Si "Autre" → l'input texte apparaît, mat.brand inchangé
    },

    /* ── Type ── */
    onType(mat) {
      const d = TYPE_DEFAULTS[mat.type]
      if (d) {
        mat.cost_per_kg              = d.cost_per_kg
        mat.default_waste_percentage = d.default_waste_percentage
      }
      this.autoName(mat)
    },

    /* ── Nom auto ── */
    autoName(mat) {
      const gen = [mat.brand, mat.type].filter(Boolean).join(' ')
      if (!mat.name) mat.name = gen
    },
  },
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   WRAPPER PRINCIPAL
══════════════════════════════════════════════════════════════ */
.cat-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ══════════════════════════════════════════════════════════════
   EN-TÊTE
══════════════════════════════════════════════════════════════ */
.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0.9rem 1.1rem 0;
}
.cat-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}
.cat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  background: #f0f4f8;
  color: #718096;
}
.cat-badge--teal { background: #e6f9fb; color: #2e9cab; }

.cat-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}
.cat-btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1.5px solid #c4b5fd;
  background: #f5f0ff;
  color: #7c3aed;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}
.cat-btn-add:hover { background: #ede9fe; border-color: #a78bfa; }

.cat-btn-save {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: filter 0.18s ease;
}
.cat-btn-save:hover:not(:disabled) { filter: brightness(1.1); }
.cat-btn-save:disabled { opacity: 0.55; cursor: default; }

/* ══════════════════════════════════════════════════════════════
   ÉLÉMENTS COMMUNS (inputs, selects, icônes, LED…)
══════════════════════════════════════════════════════════════ */

/* ── Inputs ── */
.cat-input {
  width: 100%;
  padding: 0.26rem 0.38rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  font-size: 0.72rem;
  font-family: inherit;
  color: #2d3748;
  background: #fff;
  min-width: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cat-input:focus {
  outline: none;
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(124,58,237,0.12);
}
.cat-input--num     { text-align: right; }
.cat-input--restant { color: #2e9cab; font-weight: 700; }
.cat-input--xs      { margin-top: 0.18rem; font-size: 0.67rem; }

/* ── Selects ── */
.cat-select {
  width: 100%;
  padding: 0.26rem 0.32rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  font-size: 0.72rem;
  font-family: inherit;
  color: #2d3748;
  background: #fff;
  cursor: pointer;
}
.cat-select:focus { outline: none; border-color: #a78bfa; }
.cat-select--stock { flex: 1; min-width: 0; }

/* ── Couleur ── */
.cat-color-cell {
  display: flex;
  align-items: center;
  gap: 0.22rem;
}
.cat-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.1);
  flex-shrink: 0;
  display: inline-block;
}
.cat-color-inp {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 5px;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  background: transparent;
  box-shadow: 0 0 0 1.5px #e2e8f0;
}
.cat-color-inp::-webkit-color-swatch-wrapper { padding: 0; border-radius: 4px; }
.cat-color-inp::-webkit-color-swatch         { border: none; border-radius: 3px; }
.cat-hex-lbl {
  font-size: 0.58rem;
  font-family: monospace;
  font-weight: 700;
  color: #4a5568;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

/* ── Photo ── */
.cat-photo-cell {
  display: flex;
  align-items: center;
  gap: 0.18rem;
}
.cat-thumb {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}
.cat-thumb-empty {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px dashed #d1d5db;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #cbd5e0;
}
.cat-photo-btns { display: flex; flex-direction: column; gap: 0.12rem; }

/* ── Boutons icône ── */
.cat-icn-btn {
  width: 19px;
  height: 19px;
  border-radius: 5px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.15s;
}
.cat-icn-btn:hover           { border-color: #9f7aea; color: #7c3aed; background: #f5f0ff; }
.cat-icn-btn--danger:hover   { border-color: #fc8181; color: #e53e3e; background: #fff5f5; }
.cat-icn-btn--off            { opacity: 0.45; pointer-events: none; }

/* ── Stock LED ── */
.cat-led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #38a169;
}
.cat-led--ok      { background: #38a169; }
.cat-led--low     { background: #d69e2e; }
.cat-led--out     { background: #e53e3e; }
.cat-led--reorder { background: #3182ce; }

.cat-stock-cell { display: flex; align-items: center; gap: 0.28rem; }

/* ── Poids + unité ── */
.cat-unit-wrap { display: flex; align-items: center; gap: 0.18rem; }
.cat-unit      { font-size: 0.6rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }

/* ── Bouton supprimer ── */
.cat-del-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1.5px solid #fed7d7;
  background: #fff5f5;
  color: #e53e3e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.15s;
}
.cat-del-btn:hover { background: #feb2b2; border-color: #fc8181; }

/* ── États vides ── */
.cat-empty {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: #a0aec0;
  font-style: italic;
}

/* ── Spinner ── */
.cat-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cat-spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes cat-spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════════
   TABLEAU — Tablette & Desktop (visible par défaut ≥ 641 px)

   Colonnes calibrées pour tenir sur iPad portrait (768 px)
   sans scroll : total fixe ~600 px + "Nom" auto → ~116 px
   sur 720 px disponibles (768 - 48 px de padding).
══════════════════════════════════════════════════════════════ */
.cat-table-wrap {
  display: block;           /* visible par défaut */
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 0.85rem;
}

.cat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: auto;
  /* Pas de min-width sur desktop — le tableau remplit la carte à 100% */
}

.cat-th {
  padding: 0.32rem 0.48rem;
  text-align: left;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a0aec0;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 1;
}
.cat-td {
  padding: 0.28rem 0.44rem;
  vertical-align: middle;
}
.cat-td--num { text-align: right; }
.cat-td--act { text-align: center; }

/*
  Largeurs indicatives (table-layout:auto les traite comme des hints).
  Le navigateur distribue l'espace résiduel proportionnellement.
  — TOUTES les colonnes ont une largeur, y compris c-name,
    ce qui empêche NOM d'absorber tout l'espace restant.
*/
.c-color   { width: 88px; }
.c-photo   { width: 62px; }
.c-name    { width: 200px; }   /* hint : prend sa part proportionnelle */
.c-brand   { width: 110px; }
.c-type    { width: 90px; }
.c-num     { width: 62px; text-align: right; }
.c-dep     { width: 72px; text-align: right; }
.c-restant { color: #2e9cab; }
.c-stock   { width: 122px; }
.c-act     { width: 36px; }

.cat-row { border-bottom: 1px solid #f0f4f8; }
.cat-row:hover { background: #f8f7ff; }

/* ══════════════════════════════════════════════════════════════
   GRILLE TABLETTE — masquée par défaut
══════════════════════════════════════════════════════════════ */
.cat-tab-grid { display: none; }

/* ══════════════════════════════════════════════════════════════
   CARTES MOBILE — masquées par défaut, visibles uniquement ≤ 640 px
══════════════════════════════════════════════════════════════ */
.cat-cards { display: none; }

/* ══════════════════════════════════════════════════════════════
   ★  RESPONSIVE — Mobile ≤ 640 px  ★
══════════════════════════════════════════════════════════════ */
@media (max-width: 640px) {

  /* Inverse table ↔ cartes */
  .cat-table-wrap { display: none; }
  .cat-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding: 0 0.1rem 0.75rem;
  }

  /* En-tête : titre full-width + boutons côte à côte en dessous */
  .cat-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    padding: 0.9rem 1rem 0;
  }
  .cat-actions {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
  .cat-btn-add {
    flex: 1;
    justify-content: center;
    font-size: 0.85rem;
    padding: 0.55rem 0.75rem;
  }
  .cat-btn-save { flex-shrink: 0; }

  /* ─── Carte ─── */
  .cat-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }

  /* Ligne 1 : swatch + picker + hex + nom + supprimer */
  .card-top {
    display: flex;
    align-items: center;
    gap: 0.38rem;
  }
  .card-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(0,0,0,0.1);
    flex-shrink: 0;
  }
  .card-hex {
    font-size: 0.58rem;
    font-family: monospace;
    font-weight: 700;
    color: #718096;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .card-name-inp {
    flex: 1;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.32rem 0.42rem;
  }

  /* Grilles des champs */
  .card-grid {
    display: grid;
    gap: 0.48rem;
  }
  .card-grid--2 { grid-template-columns: 1fr 1fr; }
  .card-grid--4 { grid-template-columns: 1fr 1fr; } /* 2 × 2 */

  .card-field {
    display: flex;
    flex-direction: column;
    gap: 0.16rem;
  }
  .card-lbl {
    font-size: 0.54rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a0aec0;
  }
  /* Inputs & selects plus grands pour le tactile */
  .card-field .cat-input,
  .card-field .cat-select {
    font-size: 0.82rem;
    padding: 0.42rem 0.48rem;
  }

  /* Ligne 4 : statut stock + photo */
  .card-bottom {
    display: flex;
    align-items: center;
    gap: 0.38rem;
  }
  .card-stock-sel {
    flex: 1;
    font-size: 0.8rem;
    padding: 0.4rem 0.42rem;
  }
  .card-photo-lbl {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    flex-shrink: 0;
    overflow: hidden;
    padding: 0;
  }
  .card-mini-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }

  /* Bouton supprimer plus grand sur tactile */
  .cat-del-btn { width: 30px; height: 30px; }
}

/* ══════════════════════════════════════════════════════════════
   PAGINATION — ligne unique compacte (Préc. | Page X/Y | Suiv.)
══════════════════════════════════════════════════════════════ */
.cat-pgn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0 0.75rem 0.75rem;
  margin-top: 1.5rem;
  flex-shrink: 0;
}
.cat-pgn-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0.4rem 1rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #4a5568;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.cat-pgn-btn:disabled             { opacity: 0.38; cursor: default; }
.cat-pgn-btn:not(:disabled):hover { border-color: #7c3aed; color: #7c3aed; background: #f5f0ff; }
.cat-pgn-info {
  font-size: 0.8rem;
  color: #4a5568;
  font-weight: 600;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}

/* ══════════════════════════════════════════════════════════════
   ★  TABLETTE (641 px – 1024 px) — GRILLE 2 COLONNES  ★
   Le tableau est masqué. Les filaments s'affichent en cards
   alignées 2 par 2 via CSS Grid.
══════════════════════════════════════════════════════════════ */
@media (min-width: 641px) and (max-width: 1024px) {

  /* ── Inverser table ↔ grille ── */
  .cat-table-wrap { display: none; }
  .cat-tab-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding-bottom: 0.5rem;
  }

  /* ── En-tête principal : titre + boutons sur une seule ligne ── */
  .cat-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    padding: 1rem 1.25rem 0;
    gap: 1rem;
  }
  .cat-title { font-size: 1.05rem; }
  .cat-actions { flex-shrink: 0; }

  /* ── Carte tablette ── */
  .cat-tcard {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: box-shadow 0.18s ease;
  }
  .cat-tcard:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.09); }

  /* ── En-tête de carte : swatch + hex + nom + photo + poubelle ── */
  .cat-tcard-head {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .cat-tcard-hex {
    font-size: 0.58rem;
    font-family: monospace;
    font-weight: 700;
    color: #718096;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .cat-tcard-name {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 0.3rem 0.42rem;
    min-width: 0;
  }
  .cat-tcard-photo {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex-shrink: 0;
  }

  /* ── Sous-grille des champs : 2 colonnes ── */
  .cat-tcard-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.65rem 0.85rem;
  }
  .cat-tcard-field {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }
  .cat-tcard-field--full { grid-column: 1 / -1; }

  .cat-tcard-lbl {
    font-size: 0.52rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #a0aec0;
  }
  .cat-tcard-fields .cat-input,
  .cat-tcard-fields .cat-select {
    font-size: 0.85rem;
    padding: 0.38rem 0.45rem;
  }
  .cat-tcard-fields .cat-stock-cell { gap: 0.35rem; }
}
</style>
