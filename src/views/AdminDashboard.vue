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
      <div class="admin-hero-actions">
        <button class="btn-new-quote" @click="startNewQuote">+ Nouveau devis</button>
        <router-link to="/dashboard" class="btn-back-dash">← Mon dashboard</router-link>
      </div>
    </div>

    <!-- Stats globales -->
    <div class="stats-row">
      <div class="stat-card">
        <Users class="stat-icon" />
        <div>
          <p class="stat-value">{{ clientCount }}</p>
          <p class="stat-label">Clients</p>
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
      <button v-for="tab in tabs" :key="tab.id"
        :class="['tab-btn', activeTab === tab.id && 'tab-btn--active']"
        @click="activeTab = tab.id">
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- ── Onglet Clients ── -->
    <div v-if="activeTab === 'clients'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">Clients</h2>
        <div class="user-filters">
          <button v-for="f in userFilters" :key="f.id"
            :class="['uf-btn', userFilter === f.id && 'uf-btn--active']"
            @click="userFilter = f.id">
            {{ f.label }}<span class="uf-count">{{ f.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
      <div v-else-if="filteredProfiles.length === 0" class="empty-state">
        <Users class="empty-icon" />
        <p class="empty-title">Aucun client</p>
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
            <tr v-for="p in filteredProfiles" :key="p.id">
              <td class="td-name">
                <span v-if="p.full_name">{{ p.full_name }}</span>
                <span v-else-if="quoteInfoByUser[p.id]?.name" class="anon-info">
                  {{ quoteInfoByUser[p.id].name }}
                  <span class="badge-anon">Invité</span>
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="td-email">
                <span v-if="p.email">{{ p.email }}</span>
                <span v-else-if="quoteInfoByUser[p.id]?.email">{{ quoteInfoByUser[p.id].email }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="td-center">
                <button class="badge badge--link" @click="goToClientQuotes(p.id)"
                  :title="quoteCountFor(p.id) > 0 ? 'Voir les devis' : ''">
                  {{ quoteCountFor(p.id) }}
                  <span v-if="quoteCountFor(p.id) > 0" class="badge-arrow">→</span>
                </button>
              </td>
              <td class="td-date">{{ fmtDate(p.created_at) }}</td>
              <td class="td-actions">
                <button class="btn-del"
                  :disabled="p.id === currentUserId"
                  :title="p.id === currentUserId ? 'Impossible de supprimer votre propre compte' : 'Supprimer'"
                  @click="p.id !== currentUserId && confirmDeleteUser(p)">
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
        <h2 class="panel-title">
          Tous les devis
          <span v-if="filterUserId" class="filter-active-badge">
            {{ clientLabelFor(filterUserId) }}
            <button class="clear-filter" @click="filterUserId = ''" title="Effacer le filtre">×</button>
          </span>
        </h2>
        <div class="panel-actions">
          <select class="filter-select" v-model="filterUserId">
            <option value="">Tous les clients</option>
            <option v-for="p in visibleProfiles" :key="p.id" :value="p.id">
              {{ p.full_name || quoteInfoByUser[p.id]?.name || p.id.slice(0, 8) }}
            </option>
          </select>
          <button class="btn-export" @click="exportPDF">
            <Download class="btn-export-icon" />Export PDF
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
              <td class="td-client">
                <button class="client-link" @click="goToClientQuotes(q.user_id)" title="Filtrer ce client">
                  {{ q.client_name || '—' }}
                </button>
              </td>
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
                <button class="btn-edit" @click="editQuote(q)" title="Compléter / modifier">
                  <Pencil class="del-icon" />
                </button>
                <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                  <Download class="del-icon" />
                </button>
                <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer">
                  <Trash2 class="del-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Onglet Emails ── -->
    <div v-if="activeTab === 'emails'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">Gestion des emails</h2>
      </div>
      <div class="email-section">

        <div class="email-group">
          <div class="email-group-title"><Bell class="email-group-icon" /> Notifications reçues (vous)</div>
          <div class="email-toggle-row">
            <div>
              <p class="toggle-label">Nouvelle demande de devis</p>
              <p class="toggle-desc">Recevoir un email quand un client envoie une demande</p>
            </div>
            <button :class="['toggle-switch', notifNewQuote && 'toggle-switch--on']" @click="notifNewQuote = !notifNewQuote">
              <span class="toggle-knob" />
            </button>
          </div>
          <div class="email-toggle-row">
            <div>
              <p class="toggle-label">Devis accepté</p>
              <p class="toggle-desc">Recevoir un email quand un client accepte un devis</p>
            </div>
            <button :class="['toggle-switch', notifAccepted && 'toggle-switch--on']" @click="notifAccepted = !notifAccepted">
              <span class="toggle-knob" />
            </button>
          </div>
        </div>

        <div class="email-sep" />

        <div class="email-group">
          <div class="email-group-title"><Mail class="email-group-icon" /> Notifications envoyées (clients)</div>
          <div class="email-toggle-row">
            <div>
              <p class="toggle-label">Confirmation de demande</p>
              <p class="toggle-desc">Envoyer un accusé de réception au client dès sa soumission</p>
            </div>
            <button :class="['toggle-switch', notifClientConfirm && 'toggle-switch--on']" @click="notifClientConfirm = !notifClientConfirm">
              <span class="toggle-knob" />
            </button>
          </div>
          <div class="email-toggle-row">
            <div>
              <p class="toggle-label">Changement de statut</p>
              <p class="toggle-desc">Notifier le client quand vous mettez à jour le statut de son devis</p>
            </div>
            <button :class="['toggle-switch', notifStatusChange && 'toggle-switch--on']" @click="notifStatusChange = !notifStatusChange">
              <span class="toggle-knob" />
            </button>
          </div>
        </div>

        <div class="email-sep" />

        <div class="email-group">
          <div class="email-group-title"><Settings class="email-group-icon" /> Paramètres d'envoi</div>
          <div class="email-field-row">
            <label class="email-field-label">Nom expéditeur</label>
            <input class="email-field-input" v-model="senderName" placeholder="BambuCalc" />
          </div>
          <div class="email-field-row">
            <label class="email-field-label">Email de réponse</label>
            <input class="email-field-input" v-model="replyTo" type="email" placeholder="votre@email.com" />
          </div>
        </div>

        <div class="email-sep" />

        <div class="email-group">
          <div class="email-group-title"><Mail class="email-group-icon" /> Contenu du mail client</div>
          <div class="email-field-row">
            <label class="email-field-label">Sujet du mail</label>
            <input class="email-field-input" v-model="emailSubject"
              placeholder="Votre devis BambuCalc — [numéro]" />
          </div>
          <p class="email-field-hint">Utilisez [numéro] pour le numéro de devis.</p>
          <div class="email-field-row email-field-row--top">
            <label class="email-field-label">Texte d'introduction</label>
            <textarea class="email-field-input email-field-textarea" v-model="emailIntroClient"
              placeholder="Bonjour [client], merci pour votre demande. Voici le récapitulatif de votre devis."
              rows="3" />
          </div>
          <p class="email-field-hint">Utilisez [client] pour insérer automatiquement le nom du client.</p>
        </div>

        <div class="email-actions">
          <button class="btn-save-email" @click="saveEmailSettings">
            <span v-if="emailSaved">✓ Paramètres sauvegardés</span>
            <span v-else>Sauvegarder</span>
          </button>
          <button class="btn-test-email" @click="sendTestEmail" :disabled="testEmailSending">
            <span v-if="testEmailSent">✓ Email de test envoyé !</span>
            <span v-else-if="testEmailSending">Envoi…</span>
            <span v-else>Envoyer un email de test</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal confirmation ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box">
            <div :class="['modal-icon-wrap', deleteTarget.type === 'user' && 'modal-icon-wrap--red']">
              <component :is="deleteTarget.type === 'user' ? Users : Trash2" class="modal-icon" />
            </div>
            <h3 class="modal-title">
              {{ deleteTarget.type === 'user' ? 'Supprimer ce client ?' : 'Supprimer ce devis ?' }}
            </h3>
            <p class="modal-sub" v-if="deleteTarget.type === 'user'">
              <strong>{{ deleteTarget.data.full_name || quoteInfoByUser[deleteTarget.data.id]?.name || deleteTarget.data.email }}</strong><br />
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
import { useCalculatorStore } from '../stores/calculator'
import ToastMessage from '../components/ToastMessage.vue'
import {
  ShieldCheck, Users, FileText, Wallet, TrendingUp, Trash2,
  Download, Pencil, Mail, Bell, Settings,
} from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'AdminDashboard',
  components: {
    ToastMessage, ShieldCheck, Users, FileText, Wallet, TrendingUp,
    Trash2, Download, Pencil, Mail, Bell, Settings,
  },
  setup() {
    return { calculatorStore: useCalculatorStore() }
  },
  data() {
    const saved = JSON.parse(localStorage.getItem('bambu_email_settings') || '{}')
    return {
      displayName:   '',
      currentUserId: null,
      profiles: [],
      quotes: [],
      loading: true,
      activeTab: 'clients',
      userFilter: 'all',
      filterUserId: '',
      deleteTarget: null,
      deleting: false,
      notifNewQuote:      saved.notifNewQuote      ?? true,
      notifAccepted:      saved.notifAccepted      ?? true,
      notifClientConfirm: saved.notifClientConfirm ?? true,
      notifStatusChange:  saved.notifStatusChange  ?? true,
      senderName:       saved.senderName       || 'BambuCalc',
      replyTo:          saved.replyTo          || '',
      emailSubject:     saved.emailSubject     || 'Votre devis BambuCalc — [numéro]',
      emailIntroClient: saved.emailIntroClient || '',
      emailSaved: false,
      testEmailSending: false,
      testEmailSent: false,
    }
  },
  computed: {
    tabs() {
      return [
        { id: 'clients', label: 'Clients', icon: 'Users',    count: this.clientCount },
        { id: 'quotes',  label: 'Devis',   icon: 'FileText', count: this.quotes.length },
        { id: 'emails',  label: 'Emails',  icon: 'Mail' },
      ]
    },
    totalRevenue() { return this.quotes.reduce((a, q) => a + (q.total_cost || 0), 0) },
    avgCost() { return this.quotes.length ? this.totalRevenue / this.quotes.length : 0 },
    filteredQuotes() {
      if (!this.filterUserId) return this.quotes
      return this.quotes.filter(q => q.user_id === this.filterUserId)
    },
    quoteInfoByUser() {
      const map = {}
      for (const q of this.quotes) {
        if (!map[q.user_id] && (q.client_name || q.client_email)) {
          map[q.user_id] = { name: q.client_name || '', email: q.client_email || '' }
        }
      }
      return map
    },
    visibleProfiles() {
      return this.profiles.filter(p => {
        const isAnon = !p.full_name && !p.email
        return isAnon ? this.quoteCountFor(p.id) > 0 : true
      })
    },
    clientProfiles() {
      return this.visibleProfiles.filter(p => p.id !== this.currentUserId && !!(p.full_name || p.email))
    },
    guestProfiles() {
      return this.visibleProfiles.filter(p => !p.full_name && !p.email)
    },
    filteredProfiles() {
      if (this.userFilter === 'clients') return this.clientProfiles
      if (this.userFilter === 'guests')  return this.guestProfiles
      return this.visibleProfiles.filter(p => p.id !== this.currentUserId)
    },
    userFilters() {
      const total = this.visibleProfiles.filter(p => p.id !== this.currentUserId).length
      return [
        { id: 'all',     label: 'Tous',    count: total },
        { id: 'clients', label: 'Clients', count: this.clientProfiles.length },
        { id: 'guests',  label: 'Invités', count: this.guestProfiles.length },
      ]
    },
    clientCount() {
      return this.visibleProfiles.filter(p => p.id !== this.currentUserId).length
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
    await Promise.all([this.loadData(), this.loadEmailSettings()])
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
    clientLabelFor(userId) {
      const p = this.profiles.find(p => p.id === userId)
      return p?.full_name || this.quoteInfoByUser[userId]?.name || p?.email || userId?.slice(0, 8) || '?'
    },
    goToClientQuotes(userId) {
      if (!this.quoteCountFor(userId)) return
      this.filterUserId = userId
      this.activeTab = 'quotes'
    },
    confirmDeleteQuote(q) { this.deleteTarget = { type: 'quote', data: q } },
    confirmDeleteUser(p)  { this.deleteTarget = { type: 'user',  data: p } },
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
          this.$refs.toast.show('Client supprimé.', 'success', 2500)
        }
        this.deleteTarget = null
      } catch {
        this.$refs.toast.show('Erreur lors de la suppression.', 'error')
      } finally {
        this.deleting = false
      }
    },
    async sendTestEmail() {
      this.testEmailSending = true
      const { data } = await supabase.auth.getUser()
      const testQuote = {
        quote_number:  'DEV-TEST-0000',
        project_name:  'Pièce de test',
        material:      'PLA+',
        quantity:      1,
        total_cost:    42.50,
        client_email:  data.user?.email || '',
        client_name:   this.displayName || 'Admin',
        client_first_name: this.displayName || 'Admin',
        payment_method: 'virement',
        deposit_percent: 0,
      }
      try {
        await supabase.functions.invoke('send-quote-email', { body: { quote: testQuote } })
        this.testEmailSent = true
        setTimeout(() => { this.testEmailSent = false }, 4000)
      } catch {
        this.$refs.toast?.show('Erreur lors de l\'envoi du test.', 'error')
      } finally {
        this.testEmailSending = false
      }
    },
    startNewQuote() {
      this.calculatorStore.resetForNewQuote()
      this.$router.push('/calculator/1')
    },
    editQuote(q) {
      this.calculatorStore.$patch({
        editingQuoteId:    q.id,
        quoteNumber:       q.quote_number        || '',
        quoteDate:         q.quote_date          || '',
        quoteValidityDays: q.quote_validity_days ?? 30,
        paymentMethod:     q.payment_method      || 'virement',
        depositPercent:    q.deposit_percent     ?? 0,
        quoteNotes:        q.quote_notes         || '',
        clientType:        q.client_type         || 'particulier',
        clientCivility:    q.client_civility     || 'M.',
        clientFirstName:   q.client_first_name   || '',
        clientLastName:    q.client_last_name    || '',
        clientName:        q.client_name         || '',
        clientContactName: q.client_contact_name || '',
        clientEmail:       q.client_email        || '',
        clientPhone:       q.client_phone        || '',
        clientAddress:     q.client_address      || '',
        clientPostalCode:  q.client_postal_code  || '',
        clientCity:        q.client_city         || '',
        clientCountry:     q.client_country      || 'France',
        clientSiret:       q.client_siret        || '',
        clientVatNumber:   q.client_vat_number   || '',
        projectName:       q.project_name        || '',
        quantity:          q.quantity            ?? 1,
        printProfile:      q.print_profile       || 'normal',
        printerModel:      q.printer_model       || 'p2s-combo',
        nozzleSize:        q.nozzle_size         || '0.4',
        material:          q.material            || 'PLA+',
        costPerKg:         q.cost_per_kg         ?? 16.99,
        weight:            q.weight              ?? 0,
        lossPercent:       q.loss_percent        ?? 5,
        colorCount:        q.color_count         ?? 1,
        purgeWaste:        q.purge_waste         ?? 0,
        printHours:        q.print_hours         ?? 0,
        printMinutes:      q.print_minutes       ?? 0,
        prepTime:          q.prep_time           ?? 15,
        postTime:          q.post_time           ?? 0,
        hourlyRate:        q.hourly_rate         ?? 20,
        packagingCost:     q.packaging_cost      ?? 0,
        taxRate:           q.tax_rate            ?? 20,
        selectedPricing:   q.selected_pricing    || 'standard',
        customMargin:      q.custom_margin       ?? 50,
        referenceImage:    null,
        referenceImageUrl: q.reference_image_url || '',
      })
      this.$router.push({ path: '/calculator/3', query: { editId: q.id } })
    },
    generateQuotePDF,
    async changeStatus(quote, newStatus) {
      const { error } = await supabase.from('quotes').update({ status: newStatus }).eq('id', quote.id)
      if (error) { this.$refs.toast.show('Erreur lors de la mise à jour du statut.', 'error'); return }
      quote.status = newStatus
      this.$refs.toast.show('Statut mis à jour.', 'success', 1800)
    },
    async loadEmailSettings() {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single()
      if (error || !data) return
      this.senderName          = data.sender_name          || 'BambuCalc'
      this.replyTo             = data.reply_to             || ''
      this.emailSubject        = data.email_subject        || 'Votre devis BambuCalc — [numéro]'
      this.emailIntroClient    = data.email_intro_client   || ''
      this.notifNewQuote       = data.notif_new_quote      ?? true
      this.notifAccepted       = data.notif_accepted       ?? true
      this.notifClientConfirm  = data.notif_client_confirm ?? true
      this.notifStatusChange   = data.notif_status_change  ?? true
      // Met à jour le cache localStorage pour la prochaine ouverture
      localStorage.setItem('bambu_email_settings', JSON.stringify({
        senderName: this.senderName, replyTo: this.replyTo,
        emailSubject: this.emailSubject, emailIntroClient: this.emailIntroClient,
        notifNewQuote: this.notifNewQuote, notifAccepted: this.notifAccepted,
        notifClientConfirm: this.notifClientConfirm, notifStatusChange: this.notifStatusChange,
      }))
    },
    async saveEmailSettings() {
      const { error } = await supabase
        .from('email_settings')
        .update({
          sender_name:          this.senderName,
          reply_to:             this.replyTo,
          email_subject:        this.emailSubject,
          email_intro_client:   this.emailIntroClient,
          notif_new_quote:      this.notifNewQuote,
          notif_accepted:       this.notifAccepted,
          notif_client_confirm: this.notifClientConfirm,
          notif_status_change:  this.notifStatusChange,
          updated_at:           new Date().toISOString(),
        })
        .eq('id', 1)
      if (error) {
        this.$refs.toast?.show('Erreur lors de la sauvegarde.', 'error')
        return
      }
      localStorage.setItem('bambu_email_settings', JSON.stringify({
        senderName: this.senderName, replyTo: this.replyTo,
        emailSubject: this.emailSubject, emailIntroClient: this.emailIntroClient,
        notifNewQuote: this.notifNewQuote, notifAccepted: this.notifAccepted,
        notifClientConfirm: this.notifClientConfirm, notifStatusChange: this.notifStatusChange,
      }))
      this.emailSaved = true
      setTimeout(() => { this.emailSaved = false }, 3000)
    },
    exportPDF() {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const rows = this.filteredQuotes
      const dateExport = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
      doc.setFillColor(46, 156, 171)
      doc.rect(0, 0, 297, 22, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16); doc.setFont('helvetica', 'bold')
      doc.text('BambuCalc', 14, 10)
      doc.setFontSize(10); doc.setFont('helvetica', 'normal')
      doc.text('Export des devis', 14, 17)
      doc.setFontSize(9)
      doc.text(`Généré le ${dateExport}`, 297 - 14, 14, { align: 'right' })
      doc.setTextColor(30, 47, 57); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
      const totalRev = rows.reduce((a, q) => a + (q.total_cost || 0), 0)
      doc.text(`${rows.length} devis  •  Total : ${this.fmtEur(totalRev)}  •  Moyenne : ${this.fmtEur(rows.length ? totalRev / rows.length : 0)}`, 14, 30)
      autoTable(doc, {
        startY: 34,
        head: [['N° Devis', 'Pièce', 'Client', 'Email client', 'Matière', 'Qté', 'Total TTC', 'Créé par', 'Date']],
        body: rows.map(q => [
          q.quote_number || '—', q.project_name || '—', q.client_name || '—',
          q.client_email || '—', q.material || '—', q.quantity ?? 1,
          this.fmtEur(q.total_cost), this.creatorOf(q.user_id),
          q.created_at ? new Date(q.created_at).toLocaleDateString('fr-FR') : '—',
        ]),
        styles: { fontSize: 8, cellPadding: 3, textColor: [30, 47, 57] },
        headStyles: { fillColor: [46, 156, 171], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 252, 255] },
        columnStyles: {
          0: { cellWidth: 32 }, 5: { cellWidth: 12, halign: 'center' },
          6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }, 8: { cellWidth: 22 },
        },
        didDrawPage: (data) => {
          doc.setFontSize(8); doc.setTextColor(160, 174, 192)
          doc.text(`Page ${data.pageNumber} / ${doc.internal.getNumberOfPages()}  —  BambuCalc`, 297 / 2, 205, { align: 'center' })
        },
      })
      doc.save(`bambucalc-devis-${new Date().toISOString().split('T')[0]}.pdf`)
    },
    fmtEur(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0) },
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
.admin-hero-left { display: flex; align-items: center; gap: 0.85rem; }
.admin-avatar {
  width: 3rem; height: 3rem; border-radius: 999px;
  background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(90,103,216,0.35); flex-shrink: 0;
}
.admin-avatar-icon { width: 1.4rem; height: 1.4rem; color: #fff; }
.admin-eyebrow {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #5a67d8; margin: 0 0 0.1rem;
}
.admin-title { font-size: 1.3rem; font-weight: 800; color: #1b2f39; margin: 0; letter-spacing: -0.02em; }
.admin-hero-actions { display: flex; align-items: center; gap: 0.75rem; }

.btn-new-quote {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  border: none; color: #fff; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  transition: filter 0.2s ease;
}
.btn-new-quote:hover { filter: brightness(1.07); }

.btn-back-dash {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border-radius: 999px;
  background: rgba(255,255,255,0.9); border: 1.5px solid #e2e8f0;
  color: #718096; font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: all 0.2s ease; font-family: inherit;
}
.btn-back-dash:hover { border-color: #2e9cab; color: #2e9cab; transform: translateY(-1px); }

/* ── Stats ── */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem; margin-bottom: 1.5rem;
}
.stat-card {
  background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
  padding: 1rem; display: flex; align-items: center; gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-icon         { width: 1.5rem; height: 1.5rem; color: #a0aec0; flex-shrink: 0; }
.stat-icon--teal   { color: #2e9cab; }
.stat-icon--purple { color: #5a67d8; }
.stat-icon--amber  { color: #d69e2e; }
.stat-value { font-size: 1.2rem; font-weight: 800; color: #1b2f39; margin: 0 0 0.1rem; letter-spacing: -0.02em; }
.stat-label { font-size: 0.68rem; font-weight: 600; color: #a0aec0; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Onglets ── */
.tabs-bar { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
.tab-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: #fff; color: #718096;
  font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.18s ease;
}
.tab-btn:hover { border-color: #5a67d8; color: #5a67d8; }
.tab-btn--active { border-color: #5a67d8; background: #ebf0ff; color: #5a67d8; }
.tab-icon { width: 0.85rem; height: 0.85rem; }
.tab-count {
  font-size: 0.68rem; font-weight: 700;
  background: #e2e8f0; color: #718096;
  padding: 0.1rem 0.45rem; border-radius: 999px;
}
.tab-btn--active .tab-count { background: #c3d0ff; color: #5a67d8; }

/* ── Panel card ── */
.panel-card {
  background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06); overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 1px solid #f0f4f8;
  gap: 0.75rem; flex-wrap: wrap;
}
.panel-title { font-size: 0.95rem; font-weight: 800; color: #1b2f39; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.panel-actions { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; }

/* Filter active badge */
.filter-active-badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.72rem; font-weight: 700;
  background: #e8f7f9; color: #2e9cab;
  padding: 0.15rem 0.5rem 0.15rem 0.6rem;
  border-radius: 999px; border: 1px solid #b2e8ef;
}
.clear-filter { border: none; background: none; color: #2e9cab; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; font-weight: 700; }
.clear-filter:hover { color: #e53e3e; }

/* User filters */
.user-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.uf-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.uf-btn:hover { border-color: #5a67d8; color: #5a67d8; }
.uf-btn--active { border-color: #5a67d8; background: #ebf0ff; color: #5a67d8; }
.uf-count {
  font-size: 0.65rem; font-weight: 700;
  background: #edf2f7; color: #718096;
  padding: 0.05rem 0.4rem; border-radius: 999px;
}
.uf-btn--active .uf-count { background: #c3d0ff; color: #5a67d8; }

.filter-select {
  padding: 0.45rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.82rem; font-weight: 600; color: #4a5568; background: #fff;
  font-family: inherit; cursor: pointer; outline: none;
}
.filter-select:focus { border-color: #5a67d8; }

.btn-export {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.45rem 0.9rem; border-radius: 8px; border: none;
  background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 10px rgba(90,103,216,0.3); transition: filter 0.2s ease;
}
.btn-export:hover { filter: brightness(1.07); }
.btn-export-icon { width: 0.85rem; height: 0.85rem; }

/* Empty / Loading */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; color: #a0aec0; text-align: center;
}
.empty-icon { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #5a67d8;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 0.85rem; text-align: left;
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
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
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }

.badge {
  display: inline-block; padding: 0.15rem 0.55rem;
  background: #f0f4f8; color: #718096;
  border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}
.badge--link { border: none; cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s; }
.badge--link:hover { background: #e8f7f9; color: #2e9cab; }
.badge-arrow { font-size: 0.65rem; margin-left: 0.15rem; }

.badge-anon {
  display: inline-block; padding: 0.1rem 0.4rem;
  background: #f0f4f8; color: #a0aec0;
  border-radius: 999px; font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  margin-left: 0.35rem; vertical-align: middle;
}
.anon-info { color: #4a5568; }
.text-muted { color: #cbd5e0; }

.client-link {
  border: none; background: none; color: #4a5568; font-weight: 600;
  font-size: 0.82rem; cursor: pointer; font-family: inherit; padding: 0;
  text-decoration: underline; text-decoration-style: dotted;
  text-underline-offset: 2px; transition: color 0.15s;
}
.client-link:hover { color: #2e9cab; }

.status-select {
  padding: 0.25rem 0.5rem; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; border: 1px solid;
  cursor: pointer; font-family: inherit; outline: none;
  appearance: none; -webkit-appearance: none; text-align: center;
}
.status-select.status-pending  { background: #fffaf0; color: #d69e2e; border-color: #f6e05e; }
.status-select.status-accepted { background: #f0fff4; color: #276749; border-color: #9ae6b4; }
.status-select.status-refused  { background: #fff5f5; color: #c53030; border-color: #feb2b2; }
.status-select.status-sent     { background: #ebf8ff; color: #2b6cb0; border-color: #90cdf4; }

.mat-tag {
  display: inline-block; padding: 0.15rem 0.55rem;
  background: rgba(46,156,171,0.1); color: #1f7f97;
  border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}

.btn-edit, .btn-pdf, .btn-del {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }
.btn-edit:hover { background: #ebf0ff; color: #5a67d8; }
.btn-pdf:hover  { background: #ebf8ff; color: #2e9cab; }
.btn-del:hover  { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }

/* ── Email panel ── */
.email-section { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0; }
.email-group { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem 0; }
.email-group-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.7rem; font-weight: 800; color: #a0aec0;
  text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.25rem;
}
.email-group-icon { width: 0.85rem; height: 0.85rem; }
.email-sep { height: 1px; background: #f0f4f8; margin: 0.75rem 0; }

.email-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0.65rem 0.85rem;
  background: #f7f9fc; border-radius: 12px; border: 1px solid #e2e8f0;
}
.toggle-label { font-size: 0.85rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.15rem; }
.toggle-desc  { font-size: 0.72rem; color: #a0aec0; margin: 0; }

.toggle-switch {
  width: 2.5rem; height: 1.35rem; border-radius: 999px;
  background: #e2e8f0; border: none; cursor: pointer;
  padding: 0.15rem; display: flex; align-items: center;
  transition: background 0.2s ease; flex-shrink: 0;
}
.toggle-switch--on { background: #2e9cab; }
.toggle-knob {
  display: block; width: 1rem; height: 1rem; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: transform 0.2s ease;
}
.toggle-switch--on .toggle-knob { transform: translateX(1.1rem); }

.email-field-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.5rem 0.85rem; background: #f7f9fc; border-radius: 12px; border: 1px solid #e2e8f0;
}
.email-field-label { font-size: 0.82rem; font-weight: 700; color: #4a5568; width: 140px; flex-shrink: 0; }
.email-field-input {
  flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.4rem 0.65rem; font-size: 0.82rem; font-family: inherit;
  color: #2d3748; background: #fff; outline: none; transition: border-color 0.2s;
}
.email-field-input:focus { border-color: #2e9cab; }

.email-field-row--top { align-items: flex-start; }
.email-field-textarea {
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
  font-family: inherit;
}
.email-field-hint {
  font-size: 0.72rem;
  color: #a0aec0;
  margin: 0.1rem 0 0 0;
  padding-left: 0.85rem;
}

.email-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }

.btn-test-email {
  padding: 0.6rem 1.5rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab;
  font-size: 0.9rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-test-email:hover:not(:disabled) { background: #e8f7f9; }
.btn-test-email:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-save-email {
  align-self: flex-start;
  padding: 0.6rem 1.5rem; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3); transition: filter 0.2s ease;
}
.btn-save-email:hover { filter: brightness(1.06); }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 20px; padding: 2rem; max-width: 380px; width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem;
}
.modal-icon-wrap {
  width: 3.5rem; height: 3.5rem; border-radius: 999px; background: #fff5f5;
  display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem;
}
.modal-icon { width: 1.4rem; height: 1.4rem; color: #e53e3e; }
.modal-title { font-size: 1.05rem; font-weight: 800; color: #1b2f39; margin: 0; }
.modal-sub   { font-size: 0.82rem; color: #718096; margin: 0; line-height: 1.6; }
.modal-warn  { color: #e53e3e; font-weight: 700; }
.modal-actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; width: 100%; }
.btn-cancel {
  flex: 1; padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; color: #718096; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s ease;
}
.btn-cancel:hover { border-color: #cbd5e0; }
.btn-confirm-del {
  flex: 1; padding: 0.6rem; border: none; border-radius: 10px;
  background: linear-gradient(180deg, #fc8181 0%, #e53e3e 100%);
  color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(229,62,62,0.3); transition: filter 0.15s ease;
}
.btn-confirm-del:hover:not(:disabled) { filter: brightness(1.06); }
.btn-confirm-del:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.94) translateY(8px); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .admin-page { padding: 1rem 1rem 2rem; }
  .stats-row  { grid-template-columns: repeat(2, 1fr); }
  .admin-title { font-size: 1.1rem; }
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
}
</style>
