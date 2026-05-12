<template>
  <div class="admin-page">

    <!-- Hero -->
    <div class="admin-hero">
      <div class="admin-hero-left">
        <div class="admin-avatar">
          <ShieldCheck class="admin-avatar-icon" />
        </div>
        <div>
          <p class="admin-eyebrow">Administration</p>
          <h1 class="admin-title">Bonjour{{ displayName ? ', ' + displayName : '' }} !</h1>
        </div>
      </div>
      <router-link to="/dashboard" class="btn-back-dash">← Mon dashboard</router-link>
    </div>

    <!-- Stats globales -->
    <div class="stats-row">
      <div class="stat-card">
        <Users class="stat-icon" />
        <div>
          <p class="stat-value">{{ profiles.length }}</p>
          <p class="stat-label">Utilisateurs</p>
        </div>
      </div>
      <div class="stat-card">
        <FileText class="stat-icon stat-icon--teal" />
        <div>
          <p class="stat-value">{{ quotes.length }}</p>
          <p class="stat-label">Devis totaux</p>
        </div>
      </div>
      <div class="stat-card">
        <Wallet class="stat-icon stat-icon--purple" />
        <div>
          <p class="stat-value">{{ fmtEur(totalRevenue) }}</p>
          <p class="stat-label">Revenu total</p>
        </div>
      </div>
      <div class="stat-card">
        <TrendingUp class="stat-icon stat-icon--amber" />
        <div>
          <p class="stat-value">{{ fmtEur(avgCost) }}</p>
          <p class="stat-label">Coût moyen</p>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', activeTab === tab.id && 'tab-btn--active']"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- ── Onglet Utilisateurs ── -->
    <div v-if="activeTab === 'users'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">Utilisateurs</h2>
        <span class="panel-count">{{ profiles.length }} inscrits</span>
      </div>

      <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
      <div v-else-if="profiles.length === 0" class="empty-state">
        <Users class="empty-icon" />
        <p class="empty-title">Aucun utilisateur</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Nb devis</th>
              <th>Inscription</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in profiles" :key="p.id">
              <td class="td-name">
                {{ p.full_name || '—' }}
                <span v-if="p.id === currentUserId" class="badge-admin">Admin</span>
              </td>
              <td class="td-email">{{ p.email || '—' }}</td>
              <td class="td-center">
                <span class="badge">{{ quoteCountFor(p.id) }}</span>
              </td>
              <td class="td-date">{{ fmtDate(p.created_at) }}</td>
              <td class="td-actions">
                <button
                  class="btn-del"
                  :disabled="p.id === currentUserId"
                  :title="p.id === currentUserId ? 'Impossible de supprimer votre propre compte' : 'Supprimer l\'utilisateur'"
                  @click="p.id !== currentUserId && confirmDeleteUser(p)"
                >
                  <Trash2 class="del-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Onglet Devis ── -->
    <div v-if="activeTab === 'quotes'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">Tous les devis</h2>
        <div class="panel-actions">
          <!-- Filtre par utilisateur -->
          <select class="filter-select" v-model="filterUserId">
            <option value="">Tous les utilisateurs</option>
            <option v-for="p in profiles" :key="p.id" :value="p.id">
              {{ p.full_name || p.email || p.id.slice(0, 8) }}
            </option>
          </select>
          <!-- Export PDF -->
          <button class="btn-export" @click="exportPDF">
            <Download class="btn-export-icon" />
            Export PDF
          </button>
        </div>
      </div>

      <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
      <div v-else-if="filteredQuotes.length === 0" class="empty-state">
        <FileText class="empty-icon" />
        <p class="empty-title">Aucun devis</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Devis</th>
              <th>Pièce</th>
              <th>Client</th>
              <th>Matière</th>
              <th>Total TTC</th>
              <th>Statut</th>
              <th>Créé par</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in filteredQuotes" :key="q.id">
              <td class="td-num">{{ q.quote_number || '—' }}</td>
              <td class="td-name">{{ q.project_name || '—' }}</td>
              <td class="td-client">{{ q.client_name || '—' }}</td>
              <td><span class="mat-tag">{{ q.material || '—' }}</span></td>
              <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
              <td>
                <select :class="['status-select', 'status-' + (q.status || 'pending')]"
                  :value="q.status || 'pending'"
                  @change="changeStatus(q, $event.target.value)">
                  <option value="pending">En attente</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="refused">Refusé</option>
                </select>
              </td>
              <td class="td-creator">{{ creatorOf(q.user_id) }}</td>
              <td class="td-date">{{ fmtDate(q.created_at) }}</td>
              <td class="td-actions">
                <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger le devis PDF">
                  <Download class="del-icon" />
                </button>
                <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer le devis">
                  <Trash2 class="del-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal confirmation suppression ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box">
            <div :class="['modal-icon-wrap', deleteTarget.type === 'user' && 'modal-icon-wrap--red']">
              <component :is="deleteTarget.type === 'user' ? Users : Trash2" class="modal-icon" />
            </div>
            <h3 class="modal-title">
              {{ deleteTarget.type === 'user' ? 'Supprimer cet utilisateur ?' : 'Supprimer ce devis ?' }}
            </h3>
            <p class="modal-sub" v-if="deleteTarget.type === 'user'">
              <strong>{{ deleteTarget.data.full_name || deleteTarget.data.email }}</strong><br />
              Tous ses devis ({{ quoteCountFor(deleteTarget.data.id) }}) seront supprimés.<br />
              <span class="modal-warn">Action irréversible.</span>
            </p>
            <p class="modal-sub" v-else>
              <strong>{{ deleteTarget.data.quote_number }}</strong> — {{ deleteTarget.data.project_name }}<br />
              <span class="modal-warn">Action irréversible.</span>
            </p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="deleteTarget = null">Annuler</button>
              <button class="btn-confirm-del" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ToastMessage ref="toast" />

  </div>
</template>

<script>
import { getAllQuotesAdmin, getAllProfilesAdmin, adminDeleteQuote, adminDeleteUser } from '../utils/auth'
import { supabase } from '../lib/supabase'
import { generateQuotePDF } from '../utils/generateQuotePDF'
import ToastMessage from '../components/ToastMessage.vue'
import { ShieldCheck, Users, FileText, Wallet, TrendingUp, Trash2, Download } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'AdminDashboard',
  components: { ToastMessage, ShieldCheck, Users, FileText, Wallet, TrendingUp, Trash2, Download },
  data() {
    return {
      displayName: '',
      currentUserId: null,
      profiles: [],
      quotes: [],
      loading: true,
      activeTab: 'users',
      filterUserId: '',
      deleteTarget: null,
      deleting: false,
    }
  },
  computed: {
    tabs() {
      return [
        { id: 'users',  label: 'Utilisateurs', icon: 'Users',    count: this.profiles.length },
        { id: 'quotes', label: 'Devis',         icon: 'FileText', count: this.quotes.length  },
      ]
    },
    totalRevenue() {
      return this.quotes.reduce((a, q) => a + (q.total_cost || 0), 0)
    },
    avgCost() {
      return this.quotes.length ? this.totalRevenue / this.quotes.length : 0
    },
    filteredQuotes() {
      if (!this.filterUserId) return this.quotes
      return this.quotes.filter(q => q.user_id === this.filterUserId)
    },
  },
  async created() {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      this.currentUserId = data.user.id
      const meta = data.user.user_metadata || {}
      const full = meta.full_name || meta.name || ''
      this.displayName = full.split(' ')[0] || data.user.email?.split('@')[0] || ''
    }
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [quotes, profiles] = await Promise.all([getAllQuotesAdmin(), getAllProfilesAdmin()])
        this.quotes   = quotes
        this.profiles = profiles
      } catch {
        this.$refs.toast?.show('Impossible de charger les données.', 'error')
      } finally {
        this.loading = false
      }
    },
    quoteCountFor(userId) {
      return this.quotes.filter(q => q.user_id === userId).length
    },
    creatorOf(userId) {
      const p = this.profiles.find(p => p.id === userId)
      return p ? (p.full_name?.split(' ')[0] || p.email?.split('@')[0] || '—') : '—'
    },
    confirmDeleteQuote(q) {
      this.deleteTarget = { type: 'quote', data: q }
    },
    confirmDeleteUser(p) {
      this.deleteTarget = { type: 'user', data: p }
    },
    async doDelete() {
      this.deleting = true
      try {
        if (this.deleteTarget.type === 'quote') {
          await adminDeleteQuote(this.deleteTarget.data.id)
          this.quotes = this.quotes.filter(q => q.id !== this.deleteTarget.data.id)
          this.$refs.toast.show('Devis supprimé.', 'success', 2500)
        } else {
          await adminDeleteUser(this.deleteTarget.data.id)
          const uid = this.deleteTarget.data.id
          this.profiles = this.profiles.filter(p => p.id !== uid)
          this.quotes   = this.quotes.filter(q => q.user_id !== uid)
          this.$refs.toast.show('Utilisateur supprimé.', 'success', 2500)
        }
        this.deleteTarget = null
      } catch {
        this.$refs.toast.show('Erreur lors de la suppression.', 'error')
      } finally {
        this.deleting = false
      }
    },
    generateQuotePDF,
    async changeStatus(quote, newStatus) {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quote.id)
      if (error) {
        this.$refs.toast.show('Erreur lors de la mise à jour du statut.', 'error')
        return
      }
      quote.status = newStatus
      this.$refs.toast.show('Statut mis à jour.', 'success', 1800)
    },
    exportPDF() {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const rows = this.filteredQuotes
      const dateExport = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())

      // ── En-tête ──
      doc.setFillColor(46, 156, 171)
      doc.rect(0, 0, 297, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('BambuCalc', 14, 10)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Export des devis', 14, 17)
      doc.setFontSize(9)
      doc.text(`Généré le ${dateExport}`, 297 - 14, 14, { align: 'right' })

      // ── Stats ──
      doc.setTextColor(30, 47, 57)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const totalRev = rows.reduce((a, q) => a + (q.total_cost || 0), 0)
      doc.text(`${rows.length} devis  •  Total : ${this.fmtEur(totalRev)}  •  Moyenne : ${this.fmtEur(rows.length ? totalRev / rows.length : 0)}`, 14, 30)

      // ── Tableau ──
      autoTable(doc, {
        startY: 34,
        head: [['N° Devis', 'Pièce', 'Client', 'Email client', 'Matière', 'Qté', 'Total TTC', 'Créé par', 'Date']],
        body: rows.map(q => [
          q.quote_number  || '—',
          q.project_name  || '—',
          q.client_name   || '—',
          q.client_email  || '—',
          q.material      || '—',
          q.quantity      ?? 1,
          this.fmtEur(q.total_cost),
          this.creatorOf(q.user_id),
          q.created_at ? new Date(q.created_at).toLocaleDateString('fr-FR') : '—',
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [30, 47, 57],
        },
        headStyles: {
          fillColor: [46, 156, 171],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 252, 255],
        },
        columnStyles: {
          0: { cellWidth: 32 },  // N° Devis
          5: { cellWidth: 12, halign: 'center' }, // Qté
          6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }, // Total
          8: { cellWidth: 22 }, // Date
        },
        didDrawPage: (data) => {
          // Pied de page
          const pageCount = doc.internal.getNumberOfPages()
          doc.setFontSize(8)
          doc.setTextColor(160, 174, 192)
          doc.text(
            `Page ${data.pageNumber} / ${pageCount}  —  BambuCalc`,
            297 / 2, 205, { align: 'center' }
          )
        },
      })

      doc.save(`bambucalc-devis-${new Date().toISOString().split('T')[0]}.pdf`)
    },
    fmtEur(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
    },
    fmtDate(iso) {
      if (!iso) return '—'
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
    },
  },
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f0f4f8;
  padding: 1.5rem 1.5rem 3rem;
  max-width: 960px;
  margin: 0 auto;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Hero ── */
.admin-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.admin-hero-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.admin-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(90,103,216,0.35);
  flex-shrink: 0;
}
.admin-avatar-icon { width: 1.4rem; height: 1.4rem; color: #fff; }
.admin-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5a67d8;
  margin: 0 0 0.1rem;
}
.admin-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  letter-spacing: -0.02em;
}
.btn-back-dash {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  border: 1.5px solid #e2e8f0;
  color: #718096;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-back-dash:hover { border-color: #2e9cab; color: #2e9cab; transform: translateY(-1px); }

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-icon         { width: 1.5rem; height: 1.5rem; color: #a0aec0; flex-shrink: 0; }
.stat-icon--teal   { color: #2e9cab; }
.stat-icon--purple { color: #5a67d8; }
.stat-icon--amber  { color: #d69e2e; }
.stat-value  { font-size: 1.2rem; font-weight: 800; color: #1b2f39; margin: 0 0 0.1rem; letter-spacing: -0.02em; }
.stat-label  { font-size: 0.68rem; font-weight: 600; color: #a0aec0; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Onglets ── */
.tabs-bar {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #718096;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
}
.tab-btn:hover { border-color: #5a67d8; color: #5a67d8; }
.tab-btn--active { border-color: #5a67d8; background: #ebf0ff; color: #5a67d8; }
.tab-icon { width: 0.85rem; height: 0.85rem; }
.tab-count {
  font-size: 0.68rem;
  font-weight: 700;
  background: #e2e8f0;
  color: #718096;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}
.tab-btn--active .tab-count { background: #c3d0ff; color: #5a67d8; }

/* ── Panel card ── */
.panel-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
}
.panel-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: #a0aec0;
  background: #f0f4f8;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.panel-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: auto;
}

/* Filtre select */
.filter-select {
  padding: 0.45rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4a5568;
  background: #fff;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.filter-select:focus { border-color: #5a67d8; }

/* Export CSV */
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(90,103,216,0.3);
  transition: filter 0.2s ease;
}
.btn-export:hover { filter: brightness(1.07); }
.btn-export-icon { width: 0.85rem; height: 0.85rem; }

/* ── Empty / Loading ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1.5rem;
  color: #a0aec0;
  text-align: center;
}
.empty-icon  { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #5a67d8;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Table ── */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a0aec0;
  background: #f7f9fc;
  border-bottom: 1px solid #e2e8f0;
}
.data-table tbody tr { border-bottom: 1px solid #f0f4f8; transition: background 0.15s ease; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f8f7ff; }
.data-table td { padding: 0.75rem 0.85rem; color: #2d3748; font-weight: 600; vertical-align: middle; }

.td-num     { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #718096; }
.td-name    { font-weight: 700; color: #1b2f39; }
.td-email   { color: #718096; font-size: 0.8rem; }
.td-client  { color: #718096; }
.td-creator { color: #718096; font-size: 0.8rem; }
.td-center  { text-align: center; }
.td-total   { font-weight: 800; color: #2e9cab; white-space: nowrap; }
.td-date    { color: #a0aec0; font-size: 0.78rem; white-space: nowrap; }
.td-actions { text-align: right; }

.badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  background: #f0f4f8;
  color: #718096;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}
.badge-admin {
  display: inline-block;
  padding: 0.1rem 0.45rem;
  background: linear-gradient(135deg, #ebf0ff, #c3d0ff);
  color: #5a67d8;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-left: 0.4rem;
  vertical-align: middle;
}
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid;
  cursor: pointer;
  font-family: inherit;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
}
.status-select.status-pending  { background: #fffaf0; color: #d69e2e; border-color: #f6e05e; }
.status-select.status-accepted { background: #f0fff4; color: #276749; border-color: #9ae6b4; }
.status-select.status-refused  { background: #fff5f5; color: #c53030; border-color: #feb2b2; }
.status-select.status-sent     { background: #ebf8ff; color: #2b6cb0; border-color: #90cdf4; }
.mat-tag {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  background: rgba(46,156,171,0.1);
  color: #1f7f97;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}
.btn-pdf, .btn-del {
  width: 1.9rem; height: 1.9rem;
  border: none; background: none; border-radius: 8px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: inherit;
}
.btn-pdf:hover { background: #ebf8ff; color: #2e9cab; }
.btn-del:hover { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 20px; padding: 2rem;
  max-width: 380px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 0.5rem;
}
.modal-icon-wrap {
  width: 3.5rem; height: 3.5rem; border-radius: 999px;
  background: #fff5f5;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.25rem;
}
.modal-icon-wrap--red { background: #fff5f5; }
.modal-icon { width: 1.4rem; height: 1.4rem; color: #e53e3e; }
.modal-title { font-size: 1.05rem; font-weight: 800; color: #1b2f39; margin: 0; }
.modal-sub   { font-size: 0.82rem; color: #718096; margin: 0; line-height: 1.6; }
.modal-warn  { color: #e53e3e; font-weight: 700; }
.modal-actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; width: 100%; }
.btn-cancel {
  flex: 1; padding: 0.6rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; color: #718096;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s ease;
}
.btn-cancel:hover { border-color: #cbd5e0; }
.btn-confirm-del {
  flex: 1; padding: 0.6rem; border: none; border-radius: 10px;
  background: linear-gradient(180deg, #fc8181 0%, #e53e3e 100%);
  color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(229,62,62,0.3);
  transition: filter 0.15s ease;
}
.btn-confirm-del:hover:not(:disabled) { filter: brightness(1.06); }
.btn-confirm-del:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.94) translateY(8px); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .admin-page  { padding: 1rem 1rem 2rem; }
  .stats-row   { grid-template-columns: repeat(2, 1fr); }
  .admin-title { font-size: 1.1rem; }
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
  .data-table thead th:nth-child(6),
  .data-table td:nth-child(6) { display: none; }
}
</style>
