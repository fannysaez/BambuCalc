<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">Archives</h2>
      <div class="panel-actions">
        <select class="filter-select" v-model.number="archiveYear">
          <option v-for="y in archiveYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
    <div v-else-if="filteredArchives.length === 0" class="empty-state">
      <Archive class="empty-icon" />
      <p class="empty-title">Aucun devis pour {{ archiveYear }}</p>
      <p class="empty-hint">Sélectionnez une autre année dans le menu.</p>
    </div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>N° Devis</th>
            <th>Pièce</th>
            <th class="th-hide-sm">Client</th>
            <th class="th-hide-sm">Matière</th>
            <th>Total TTC</th>
            <th>Statut</th>
            <th class="th-hide-md">Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in filteredArchives" :key="q.id">
            <td class="td-num">{{ q.quote_number || '—' }}</td>
            <td class="td-name">{{ q.project_name || '—' }}</td>
            <td class="td-hide-sm">{{ q.client_name || '—' }}</td>
            <td class="td-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
            <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
            <td>
              <span :class="['arch-status', 'arch-status--' + (q.status || 'pending')]">
                {{ statusLabel(q.status) }}
              </span>
            </td>
            <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
            <td class="td-actions">
              <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                <Download class="del-icon" />
              </button>
              <button class="btn-del" @click="emit('delete-quote', q)" title="Supprimer">
                <Trash2 class="del-icon" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Archive, Download, Trash2 } from 'lucide-vue-next'
import { generateQuotePDF } from '@/utils/generateQuotePDF'

const props = defineProps({
  quotes:  { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['delete-quote', 'count-change'])

const archiveYear = ref(new Date().getFullYear())

const archiveYears = computed(() => {
  const years = [...new Set(
    props.quotes.filter(q => q.created_at).map(q => new Date(q.created_at).getFullYear())
  )].sort((a, b) => b - a)
  return years.length ? years : [new Date().getFullYear()]
})

const filteredArchives = computed(() =>
  props.quotes.filter(q => q.created_at && new Date(q.created_at).getFullYear() === archiveYear.value)
)

watch(filteredArchives, (v) => emit('count-change', v.length), { immediate: true })

const STATUS_LABELS = {
  pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté',
  refused: 'Refusé', 'Prêt': 'Prêt', 'Fini': 'Fini', 'Accepté': 'Accepté',
}
function statusLabel(s) { return STATUS_LABELS[s] || s || 'En attente' }
function fmtEur(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0) }
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
</script>

<style scoped>
.panel-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  display: flex; flex-direction: column;
  flex: 1; min-height: 0; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.panel-title { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0; }
.panel-actions { display: flex; align-items: center; gap: 0.65rem; margin-left: auto; flex-wrap: wrap; }

.filter-select {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.3rem 0.6rem; font-size: 0.8rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:focus { border-color: #2e9cab; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; text-align: center; flex: 1;
}
.empty-icon  { width: 2rem; height: 2rem; color: #cbd5e0; }
.empty-title { font-size: 0.9rem; font-weight: 700; color: #718096; margin: 0; }
.empty-hint  { font-size: 0.78rem; color: #a0aec0; margin: 0; }
.spinner {
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #2e9cab;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.table-wrap { flex: 1; overflow-y: auto; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 1rem; text-align: left;
  font-size: 0.67rem; font-weight: 800; color: #a0aec0;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: #f7f9fc; border-bottom: 1px solid #f0f4f8; white-space: nowrap;
}
.data-table tbody tr { border-bottom: 1px solid #f7f9fc; transition: background 0.12s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f7f9fc; }
.data-table td { padding: 0.6rem 1rem; color: #2d3748; vertical-align: middle; }
.td-num   { font-size: 0.72rem; font-weight: 700; color: #a0aec0; font-variant-numeric: tabular-nums; }
.td-name  { font-weight: 600; color: #1b2f39; }
.td-total { font-weight: 800; color: #2e9cab; font-variant-numeric: tabular-nums; }
.td-date  { font-size: 0.75rem; color: #a0aec0; }
.td-actions { display: flex; gap: 0.3rem; align-items: center; }
.mat-tag {
  display: inline-block; padding: 0.1rem 0.4rem; border-radius: 6px;
  background: #f0e6ff; color: #7c3aed; font-size: 0.67rem; font-weight: 700;
}
@media (max-width: 760px) { .th-hide-md, .td-hide-md { display: none; } }
@media (max-width: 540px) { .th-hide-sm, .td-hide-sm { display: none; } }

.arch-status {
  display: inline-block; padding: 0.18rem 0.55rem;
  border-radius: 999px; font-size: 0.7rem; font-weight: 700;
}
.arch-status--pending  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }
.arch-status--accepted,
.arch-status--Accepté  { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.arch-status--refused  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.arch-status--sent     { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }
.arch-status--Prêt,
.arch-status--Fini     { background: #f0e6ff; color: #7c3aed; border: 1px solid #c4b5fd; }

.btn-pdf {
  padding: 0.3rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; cursor: pointer; transition: all 0.15s ease;
  display: inline-flex; align-items: center;
}
.btn-pdf:hover { border-color: #2e9cab; color: #2e9cab; }
.btn-del {
  padding: 0.3rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; cursor: pointer; transition: all 0.15s ease;
  display: inline-flex; align-items: center;
}
.btn-del:hover { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }

@media (max-width: 1023px) {
  .panel-card { flex: none; overflow: visible; }
  .table-wrap { flex: none; min-height: auto; overflow-y: visible; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .panel-card { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
}
@media (max-width: 540px) {
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
}
</style>
