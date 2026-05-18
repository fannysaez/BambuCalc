<template>
  <div class="admin-page" @click="dossierDropdownOpen = false; burgerOpen = false">

    <!-- Bannière décorative admin -->
    <div class="admin-banner" aria-hidden="true"></div>

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

    <!-- ── Burger menu mobile (≤640px) — remplace la barre d'onglets ── -->
    <div class="tabs-burger" @click.stop>
      <button class="burger-trigger" @click="burgerOpen = !burgerOpen">
        <component :is="currentTabIcon" class="burger-trigger-icon" />
        <span class="burger-trigger-label">{{ currentTabLabel }}</span>
        <ChevronDown :class="['burger-trigger-chevron', burgerOpen && 'burger-trigger-chevron--open']" />
      </button>
      <Transition name="dropdown">
        <div v-if="burgerOpen" class="burger-menu">
          <div class="burger-group-label">Clients &amp; Devis</div>
          <button class="burger-item" :class="activeTab === 'clients' && 'burger-item--active'"
            @click="activeTab = 'clients'; burgerOpen = false; dossierDropdownOpen = false">
            <Users class="burger-item-icon" />Liste des clients
            <span class="burger-item-count">{{ clientCount }}</span>
          </button>
          <button class="burger-item" :class="activeTab === 'quotes' && 'burger-item--active'"
            @click="activeTab = 'quotes'; burgerOpen = false; dossierDropdownOpen = false">
            <FileText class="burger-item-icon" />Tous les devis
            <span class="burger-item-count">{{ quotes.length }}</span>
          </button>
          <div class="burger-sep" />
          <button v-for="tab in tabs" :key="tab.id"
            class="burger-item" :class="activeTab === tab.id && 'burger-item--active'"
            @click="activeTab = tab.id; burgerOpen = false; dossierDropdownOpen = false">
            <component :is="tab.icon" class="burger-item-icon" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="burger-item-count">{{ tab.count }}</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Onglets -->
    <div class="tabs-bar">

      <!-- ── Dropdown "Clients & Devis" ── -->
      <div class="tab-dropdown-wrap" @click.stop>
        <button
          :class="['tab-btn', ['clients','quotes'].includes(activeTab) && 'tab-btn--active']"
          @click="dossierDropdownOpen = !dossierDropdownOpen">
          <Users class="tab-icon" />
          Clients & Devis
          <span class="tab-count">{{ clientCount + quotes.length }}</span>
          <ChevronDown :class="['tab-chevron', dossierDropdownOpen && 'tab-chevron--open']" />
        </button>
        <Transition name="dropdown">
          <div v-if="dossierDropdownOpen" class="tab-dropdown">
            <button
              :class="['tab-dropdown-item', activeTab === 'clients' && 'tab-dropdown-item--active']"
              @click="activeTab = 'clients'; dossierDropdownOpen = false">
              <Users class="tab-dropdown-icon" />
              Liste des clients
              <span class="tab-dropdown-count">{{ clientCount }}</span>
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'quotes' && 'tab-dropdown-item--active']"
              @click="activeTab = 'quotes'; dossierDropdownOpen = false">
              <FileText class="tab-dropdown-icon" />
              Tous les devis
              <span class="tab-dropdown-count">{{ quotes.length }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- ── Onglets normaux ── -->
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
      <template v-else>

        <!-- ══ Vue Tableau — Desktop & Tablette (≥ 641 px) ══ -->
        <div class="quotes-table-view">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N° Devis</th>
                  <th>Pièce</th>
                  <th class="th-hide-sm">Client</th>
                  <th class="th-hide-sm">Matière</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th class="th-hide-md">Créé par</th>
                  <th class="th-hide-md">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="q in paginatedQuotes" :key="q.id">
                  <td class="td-num">{{ q.quote_number || '—' }}</td>
                  <td class="td-name">{{ q.project_name || '—' }}</td>
                  <td class="td-client td-hide-sm">
                    <button class="client-link" @click="goToClientQuotes(q.user_id)" title="Filtrer ce client">
                      {{ q.client_name || '—' }}
                    </button>
                  </td>
                  <td class="td-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
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
                  <td class="td-creator td-hide-md">{{ creatorOf(q.user_id) }}</td>
                  <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
                  <td class="td-actions">
                    <button class="btn-edit" @click="editQuote(q)" title="Compléter / modifier">
                      <Pencil class="del-icon" />
                    </button>
                    <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                      <Download class="del-icon" />
                    </button>
                    <button v-if="q.status === 'accepted' && q.client_email"
                      class="btn-send-row" @click="sendTarget = q" title="Envoyer par e-mail">
                      <Send class="del-icon" />
                    </button>
                    <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer">
                      <Trash2 class="del-icon" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination compacte tableau -->
          <div v-if="totalQuotesPages > 1" class="pagination quotes-pgn">
            <button class="page-btn" :disabled="quotesPage === 1" @click="quotesPage--">← Préc.</button>
            <span class="quotes-pgn-info">Page {{ quotesPage }} / {{ totalQuotesPages }}</span>
            <button class="page-btn" :disabled="quotesPage === totalQuotesPages" @click="quotesPage++">Suiv. →</button>
          </div>
        </div>

        <!-- ══ Vue Cartes — Mobile (≤ 640 px) ══ -->
        <div class="quotes-cards-view">
          <div
            v-for="q in paginatedQuotes"
            :key="q.id"
            class="qcard"
          >
            <!-- Ligne 1 : Nom du client + Badge statut -->
            <div class="qcard-top">
              <button class="qcard-client client-link" @click="goToClientQuotes(q.user_id)">
                {{ q.client_name || '—' }}
              </button>
              <span :class="['qcard-badge', 'arch-status--' + (q.status || 'pending')]">
                {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
              </span>
            </div>
            <!-- Ligne 2 : Pièce + N° devis + Matière -->
            <div class="qcard-meta">
              <p class="qcard-piece">{{ q.project_name || '—' }}</p>
              <p class="qcard-sub">
                N°&nbsp;{{ q.quote_number || '—' }}
                <span v-if="q.material" class="mat-tag">{{ q.material }}</span>
              </p>
            </div>
            <!-- Ligne 3 : Date + Total TTC -->
            <div class="qcard-row">
              <span class="qcard-date">{{ fmtDate(q.created_at) }}</span>
              <span class="qcard-total">{{ fmtEur(q.total_cost) }}</span>
            </div>
            <!-- Ligne 4 : Select statut + Boutons d'action -->
            <div class="qcard-bottom">
              <select
                :class="['status-select', 'qcard-status-sel', 'status-' + (q.status || 'pending')]"
                :value="q.status || 'pending'"
                @change="changeStatus(q, $event.target.value)"
              >
                <option value="pending">En attente</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="refused">Refusé</option>
              </select>
              <div class="qcard-actions">
                <button class="btn-edit" @click="editQuote(q)" title="Modifier"><Pencil class="del-icon" /></button>
                <button class="btn-pdf" @click="generateQuotePDF(q)" title="PDF"><Download class="del-icon" /></button>
                <button v-if="q.status === 'accepted' && q.client_email"
                  class="btn-send-row" @click="sendTarget = q" title="Envoyer par e-mail">
                  <Send class="del-icon" />
                </button>
                <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer"><Trash2 class="del-icon" /></button>
              </div>
            </div>
          </div>
          <!-- Pagination compacte cartes -->
          <div v-if="totalQuotesPages > 1" class="pagination quotes-pgn">
            <button class="page-btn" :disabled="quotesPage === 1" @click="quotesPage--">← Préc.</button>
            <span class="quotes-pgn-info">Page {{ quotesPage }} / {{ totalQuotesPages }}</span>
            <button class="page-btn" :disabled="quotesPage === totalQuotesPages" @click="quotesPage++">Suiv. →</button>
          </div>
        </div>

      </template>
    </div>

    <!-- ── Onglet Emails (1 colonne, 3 étapes) ── -->
    <div v-if="activeTab === 'emails'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">
          {{ ['Configuration & Modèle', 'Rédaction', 'Aperçu & Envoi'][emailStep - 1] }}
        </h2>
        <div class="sim-steps-bar email-steps-bar">
          <button :class="['sim-step-dot', emailStep === 1 && 'sim-step-dot--active', emailStep > 1 && 'sim-step-dot--done']"
                  @click="emailStep = 1" title="Configuration">1</button>
          <div :class="['sim-step-line', emailStep > 1 && 'sim-step-line--done']"></div>
          <button :class="['sim-step-dot', emailStep === 2 && 'sim-step-dot--active', emailStep > 2 && 'sim-step-dot--done']"
                  @click="emailStep = 2" title="Rédaction">2</button>
          <div :class="['sim-step-line', emailStep > 2 && 'sim-step-line--done']"></div>
          <button :class="['sim-step-dot', emailStep === 3 && 'sim-step-dot--active']"
                  @click="emailStep = 3" title="Aperçu & Envoi">3</button>
        </div>
      </div>

      <!-- ══ Étape 1 : Configuration & Modèle ══ -->
      <div v-if="emailStep === 1" class="email-single-col">
        <div class="email-step-section">
          <p class="ecf-section-label"><Settings class="ecf-section-icon" /> Paramètres d'envoi</p>
          <div class="ecf-group">
            <label class="ecf-label">Nom expéditeur</label>
            <input class="ecf-input" v-model="senderName" placeholder="BambuCalc" />
          </div>
          <div class="ecf-group">
            <label class="ecf-label">Email de réponse</label>
            <input class="ecf-input" v-model="replyTo" type="email" placeholder="votre@email.com" />
          </div>
        </div>

        <div class="email-step-section">
          <p class="ecf-section-label"><Mail class="ecf-section-icon" /> Modèle d'email</p>
          <div class="ecf-group">
            <label class="ecf-label">Sujet du mail (template)</label>
            <input class="ecf-input" v-model="emailSubject" placeholder="Votre devis BambuCalc — [numéro]" />
            <p class="ecf-hint">Variable : [numéro]</p>
          </div>
          <div class="ecf-group">
            <label class="ecf-label">Texte d'introduction (template)</label>
            <textarea class="ecf-input ecf-textarea ecf-textarea--lg" v-model="emailIntroClient"
              placeholder="Bonjour [client], merci pour votre demande. Voici le récapitulatif de votre devis." />
            <p class="ecf-hint">Variables : [client] · [client_nom] · [numéro] · [projet] · [total]</p>
          </div>
        </div>

        <div class="email-step-section">
          <p class="ecf-section-label"><Bell class="ecf-section-icon" /> Notifications</p>
          <p class="notif-sub">Reçues par vous</p>
          <div class="notif-row">
            <div class="notif-text"><p class="notif-label">Nouvelle demande</p><p class="notif-desc">Quand un client soumet un devis</p></div>
            <button :class="['toggle-switch', notifNewQuote && 'toggle-switch--on']" @click="notifNewQuote = !notifNewQuote"><span class="toggle-knob" /></button>
          </div>
          <div class="notif-row">
            <div class="notif-text"><p class="notif-label">Devis accepté</p><p class="notif-desc">Quand un client accepte un devis</p></div>
            <button :class="['toggle-switch', notifAccepted && 'toggle-switch--on']" @click="notifAccepted = !notifAccepted"><span class="toggle-knob" /></button>
          </div>
          <p class="notif-sub notif-sub--spaced">Envoyées aux clients</p>
          <div class="notif-row">
            <div class="notif-text"><p class="notif-label">Confirmation de demande</p><p class="notif-desc">Accusé de réception auto</p></div>
            <button :class="['toggle-switch', notifClientConfirm && 'toggle-switch--on']" @click="notifClientConfirm = !notifClientConfirm"><span class="toggle-knob" /></button>
          </div>
          <div class="notif-row">
            <div class="notif-text"><p class="notif-label">Changement de statut</p><p class="notif-desc">Notification mise à jour statut</p></div>
            <button :class="['toggle-switch', notifStatusChange && 'toggle-switch--on']" @click="notifStatusChange = !notifStatusChange"><span class="toggle-knob" /></button>
          </div>
        </div>

        <div class="email-step-footer">
          <button class="btn-save-email" @click="saveEmailSettings" :disabled="emailSaving">
            <span v-if="emailSaved">✓ Sauvegardé</span>
            <span v-else-if="emailSaving">Sauvegarde…</span>
            <span v-else>Sauvegarder</span>
          </button>
          <button class="btn-email-next" @click="emailStep = 2">Rédaction →</button>
        </div>
      </div>

      <!-- ══ Étape 2 : Rédaction ══ -->
      <div v-if="emailStep === 2" class="email-single-col">
        <div class="email-step-section">
          <p class="ecf-section-label">Sélectionner un devis actif</p>
          <select class="ecf-select" v-model="selectedQuoteId" @change="onQuoteSelect">
            <option value="">— Choisir un devis pour prévisualiser l'envoi —</option>
            <option v-for="opt in quoteSelectOptions" :key="opt.id" :value="opt.id">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="quoteSelectOptions.length === 0" class="ecf-hint ecf-hint--warn">
            Aucun devis avec adresse e-mail client trouvé.
          </p>
        </div>

        <template v-if="selectedQuote">
          <div class="ecf-recipient">
            <span class="ecf-recipient-label">Destinataire</span>
            <span class="ecf-recipient-email">{{ selectedQuote.client_email }}</span>
            <span class="ecf-recipient-badge">✓</span>
          </div>

          <div class="ecf-preview-block">
            <p class="ecf-preview-label">Aperçu avec ce devis</p>
            <p class="ecf-preview-subject">{{ resolvedSubject(selectedQuote) }}</p>
            <p v-if="resolvedIntro(selectedQuote)" class="ecf-preview-intro">{{ resolvedIntro(selectedQuote) }}</p>
            <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction — ajoutez-en un à l'étape 1.</div>
            <div class="ecf-preview-actions">
              <button
                v-if="!['Prêt','Fini','Accepté','accepted','sent'].includes(selectedQuote.status)"
                class="btn-validate-quote"
                @click="saveQuote">
                <CheckCircle class="btn-send-icon-sm" />
                Marquer comme Prêt
              </button>
            </div>
          </div>
        </template>
        <div v-else class="email-empty-step">
          <Mail class="empty-icon" />
          <p class="empty-title">Aucun devis sélectionné</p>
          <p class="empty-hint">Choisissez un devis dans la liste ci-dessus pour prévisualiser l'email.</p>
        </div>

        <div class="email-step-footer">
          <button class="btn-email-prev" @click="emailStep = 1">← Configuration</button>
          <button class="btn-email-next" @click="emailStep = 3">Aperçu final →</button>
        </div>
      </div>

      <!-- ══ Étape 3 : Aperçu Final & Envoi ══ -->
      <div v-if="emailStep === 3" class="email-single-col">
        <!-- Aperçu rendu -->
        <div class="email-step-section">
          <p class="ecf-section-label">Aperçu de l'email</p>
          <template v-if="selectedQuote">
            <div class="preview-subject">{{ resolvedSubject(selectedQuote) }}</div>
            <div v-if="resolvedIntro(selectedQuote)" class="preview-intro">{{ resolvedIntro(selectedQuote) }}</div>
            <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction configuré.</div>
            <!-- Indicateur PDF -->
            <div class="send-pdf-indicator" :class="attachPdfAuto ? 'send-pdf-indicator--on' : 'send-pdf-indicator--off'">
              <FileText class="send-pdf-icon" />
              <span v-if="attachPdfAuto">Devis PDF joint automatiquement</span>
              <span v-else>PDF non joint (désactivé)</span>
              <span class="send-pdf-status">{{ attachPdfAuto ? '✓' : '○' }}</span>
            </div>
          </template>
          <div v-else class="email-empty-step">
            <p class="empty-hint">Retournez à l'étape 2 pour sélectionner un devis.</p>
          </div>
        </div>

        <!-- Pièces jointes -->
        <div class="email-step-section">
          <p class="ecf-section-label"><FileText class="ecf-section-icon" /> Pièces jointes</p>
          <div class="notif-row">
            <div class="notif-text"><p class="notif-label">Joindre le devis PDF</p><p class="notif-desc">Fichier PDF généré automatiquement</p></div>
            <button :class="['toggle-switch', attachPdfAuto && 'toggle-switch--on']" @click="attachPdfAuto = !attachPdfAuto"><span class="toggle-knob" /></button>
          </div>
          <div class="ecf-group" style="margin-top: 0.5rem;">
            <label class="ecf-label">Document global (CGV, guide…)</label>
            <div
              :class="['attach-drop', attachDragOver && 'attach-drop--over']"
              @click="$refs.attachInput.click()"
              @dragover.prevent="attachDragOver = true"
              @dragleave.prevent="attachDragOver = false"
              @drop.prevent="handleAttachDrop">
              <template v-if="globalAttachmentName">
                <p class="attach-filename">📎 {{ globalAttachmentName }}</p>
                <button class="attach-clear" @click.stop="clearAttachment" title="Retirer">×</button>
              </template>
              <template v-else>
                <p class="attach-hint">Glisser un PDF ici</p>
                <span class="attach-sub">ou cliquer pour parcourir</span>
              </template>
              <input ref="attachInput" type="file" accept=".pdf" style="display:none" @change="handleAttachFile" />
            </div>
          </div>
        </div>

        <div class="email-step-footer">
          <button class="btn-email-prev" @click="emailStep = 2">← Rédaction</button>
          <div class="email-step-actions">
            <button class="btn-test-email" @click="sendTestEmail" :disabled="testEmailSending">
              <span v-if="testEmailSent">✓ Envoyé !</span>
              <span v-else-if="testEmailSending">Envoi…</span>
              <span v-else>Email de test</span>
            </button>
            <button class="btn-send-inline" @click="sendTarget = selectedQuote" :disabled="!selectedQuote">
              <Send class="btn-send-icon-sm" />
              {{ selectedQuote ? 'Envoyer ' + selectedQuote.quote_number : 'Envoyer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Onglet Gestion Devis (1 colonne, 2 pages) ── -->
    <div v-if="activeTab === 'manage'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">
          {{ managePage === 1 ? 'Devis sauvegardés' : 'Transmettre un devis' }}
        </h2>
        <div class="settings-page-indicator">
          <span :class="['spi-dot', managePage === 1 && 'spi-dot--active']" @click="managePage = 1"></span>
          <span :class="['spi-dot', managePage === 2 && 'spi-dot--active']" @click="managePage = 2"></span>
        </div>
        <div v-if="managePage === 1" class="panel-actions">
          <select class="filter-select" v-model="filterUserId">
            <option value="">Tous les clients</option>
            <option v-for="p in visibleProfiles" :key="p.id" :value="p.id">
              {{ p.full_name || quoteInfoByUser[p.id]?.name || p.id.slice(0, 8) }}
            </option>
          </select>
          <button class="btn-manage-transmit" @click="managePage = 2">
            Transmettre →
          </button>
        </div>
      </div>

      <!-- ══ Page 1 : Tableau complet des devis ══ -->
      <template v-if="managePage === 1">
        <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
        <div v-else-if="filteredQuotes.length === 0" class="empty-state">
          <FileText class="empty-icon" />
          <p class="empty-title">Aucun devis</p>
          <p class="empty-hint">Créez votre premier devis depuis le calculateur.</p>
        </div>
        <template v-else>
          <!-- Vue Tableau — Desktop uniquement (≥1025px) -->
          <div class="manage-table-view">
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>N° Devis</th>
                    <th>Pièce</th>
                    <th>Client</th>
                    <th class="th-hide-sm">Matière</th>
                    <th>Total TTC</th>
                    <th>Statut</th>
                    <th class="th-hide-md">Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in paginatedManageQuotes" :key="q.id"
                      :class="sendableQuotes.some(s => s.id === q.id) ? 'tr--sendable' : ''">
                    <td class="td-num">{{ q.quote_number || '—' }}</td>
                    <td class="td-name">{{ q.project_name || '—' }}</td>
                    <td class="td-client">{{ q.client_name || '—' }}</td>
                    <td class="td-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
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
                    <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
                    <td class="td-actions">
                      <button class="btn-edit" @click="editQuote(q)" title="Modifier">
                        <Pencil class="del-icon" />
                      </button>
                      <button class="btn-pdf" @click="generateQuotePDF(q)" title="PDF">
                        <Download class="del-icon" />
                      </button>
                      <button v-if="sendableQuotes.some(s => s.id === q.id)"
                        class="btn-send-row"
                        @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                        title="Transmettre par e-mail">
                        <Send class="del-icon" />
                      </button>
                      <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer">
                        <Trash2 class="del-icon" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="totalManagePages > 1" class="pagination manage-pgn">
              <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
              <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
              <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
            </div>
          </div>

          <!-- Vue Grille 2 colonnes — Tablette (641px–1024px) -->
          <div class="manage-tab-grid">
            <div v-for="q in paginatedManageQuotes" :key="q.id" class="mtcard">
              <div class="mtcard-head">
                <span class="mtcard-client">{{ q.client_name || '—' }}</span>
                <span :class="['mtcard-badge', 'arch-status--' + (q.status || 'pending')]">
                  {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
                </span>
              </div>
              <div class="mtcard-body">
                <div class="mtcard-field">
                  <span class="mtcard-label">Pièce</span>
                  <span class="mtcard-value">{{ q.project_name || '—' }}</span>
                </div>
                <div class="mtcard-field">
                  <span class="mtcard-label">N° Devis</span>
                  <span class="mtcard-value mtcard-value--mono">{{ q.quote_number || '—' }}</span>
                </div>
                <div class="mtcard-row2">
                  <div class="mtcard-field">
                    <span class="mtcard-label">Matière</span>
                    <span class="mat-tag">{{ q.material || '—' }}</span>
                  </div>
                  <div class="mtcard-field">
                    <span class="mtcard-label">Date</span>
                    <span class="mtcard-value">{{ fmtDate(q.created_at) }}</span>
                  </div>
                </div>
                <div class="mtcard-total">{{ fmtEur(q.total_cost) }}</div>
              </div>
              <div class="mtcard-foot">
                <select :class="['status-select', 'status-' + (q.status || 'pending'), 'mtcard-status-sel']"
                  :value="q.status || 'pending'"
                  @change="changeStatus(q, $event.target.value)">
                  <option value="pending">En attente</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="refused">Refusé</option>
                </select>
                <div class="mtcard-btns">
                  <button class="btn-edit" @click="editQuote(q)" title="Modifier">
                    <Pencil class="del-icon" />
                  </button>
                  <button class="btn-pdf" @click="generateQuotePDF(q)" title="PDF">
                    <Download class="del-icon" />
                  </button>
                  <button v-if="sendableQuotes.some(s => s.id === q.id)"
                    class="btn-send-row"
                    @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                    title="Transmettre par e-mail">
                    <Send class="del-icon" />
                  </button>
                  <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer">
                    <Trash2 class="del-icon" />
                  </button>
                </div>
              </div>
            </div>
            <div v-if="totalManagePages > 1" class="pagination manage-pgn manage-tab-pgn">
              <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
              <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
              <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
            </div>
          </div>

          <!-- Vue Cartes — Mobile (≤640px) -->
          <div class="manage-cards-view">
            <div v-for="q in paginatedManageQuotes" :key="q.id" class="mcard">
              <div class="mcard-top">
                <span class="mcard-client">{{ q.client_name || '—' }}</span>
                <span :class="['mcard-badge', 'arch-status--' + (q.status || 'pending')]">
                  {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
                </span>
              </div>
              <div class="mcard-meta">
                <p class="mcard-piece">{{ q.project_name || '—' }}</p>
                <p class="mcard-sub">N° {{ q.quote_number || '—' }} · {{ q.material || '—' }}</p>
              </div>
              <div class="mcard-row">
                <span class="mcard-date">{{ fmtDate(q.created_at) }}</span>
                <span class="mcard-total">{{ fmtEur(q.total_cost) }}</span>
              </div>
              <div class="mcard-bottom">
                <select :class="['status-select', 'status-' + (q.status || 'pending'), 'mcard-status-sel']"
                  :value="q.status || 'pending'"
                  @change="changeStatus(q, $event.target.value)">
                  <option value="pending">En attente</option>
                  <option value="sent">Envoyé</option>
                  <option value="accepted">Accepté</option>
                  <option value="refused">Refusé</option>
                </select>
                <div class="mcard-actions">
                  <button class="btn-edit" @click="editQuote(q)" title="Modifier">
                    <Pencil class="del-icon" />
                  </button>
                  <button class="btn-pdf" @click="generateQuotePDF(q)" title="PDF">
                    <Download class="del-icon" />
                  </button>
                  <button v-if="sendableQuotes.some(s => s.id === q.id)"
                    class="btn-send-row"
                    @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                    title="Transmettre par e-mail">
                    <Send class="del-icon" />
                  </button>
                  <button class="btn-del" @click="confirmDeleteQuote(q)" title="Supprimer">
                    <Trash2 class="del-icon" />
                  </button>
                </div>
              </div>
            </div>
            <div v-if="totalManagePages > 1" class="pagination manage-pgn">
              <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
              <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
              <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
            </div>
          </div>
        </template>
      </template>

      <!-- ══ Page 2 : Transmettre un devis ══ -->
      <div v-if="managePage === 2" class="manage-single-col">
        <button class="btn-manage-prev" @click="managePage = 1">
          ← Retour aux devis sauvegardés
        </button>

        <div class="manage-send-card">
          <!-- Sélecteur -->
          <div class="manage-send-section">
            <p class="manage-send-label"><Send class="manage-send-label-icon" /> Sélectionner un devis à transmettre</p>
            <select class="ecf-select" v-model="selectedQuoteId" @change="onQuoteSelect">
              <option value="">— Choisir un devis —</option>
              <option v-for="opt in quoteSelectOptions" :key="opt.id" :value="opt.id">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="quoteSelectOptions.length === 0" class="ecf-hint ecf-hint--warn">
              Aucun devis avec adresse e-mail client trouvé.
            </p>
          </div>

          <!-- Destinataire -->
          <div v-if="selectedQuote" class="ecf-recipient">
            <span class="ecf-recipient-label">Destinataire</span>
            <span class="ecf-recipient-email">{{ selectedQuote.client_email }}</span>
            <span class="ecf-recipient-badge">✓</span>
          </div>

          <!-- Aperçu mail -->
          <div v-if="selectedQuote" class="ecf-preview-block manage-preview-block">
            <p class="ecf-preview-label">Aperçu de l'email</p>
            <p class="ecf-preview-subject">{{ resolvedSubject(selectedQuote) }}</p>
            <p v-if="resolvedIntro(selectedQuote)" class="ecf-preview-intro">{{ resolvedIntro(selectedQuote) }}</p>
            <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction — configurez le modèle dans l'onglet Emails.</div>
          </div>

          <!-- Stripe Payment Link -->
          <div v-if="selectedQuote" class="stripe-link-row">
            <label class="stripe-link-label">🔗 Lien de paiement Stripe</label>
            <div class="stripe-link-wrap">
              <input type="url" class="stripe-link-input"
                v-model="selectedQuote.stripe_payment_link"
                placeholder="https://buy.stripe.com/…"
                @change="saveStripeLink(selectedQuote)" />
              <button v-if="selectedQuote.stripe_payment_link"
                class="stripe-copy-btn"
                @click="copyStripeLink(selectedQuote.stripe_payment_link)"
                title="Copier le lien">
                📋
              </button>
            </div>
            <p class="stripe-link-hint">Générez ce lien depuis le <a href="https://dashboard.stripe.com/payment-links" target="_blank">Dashboard Stripe</a>, collez-le ici, puis envoyez-le au client par email.</p>
          </div>

          <!-- Actions -->
          <div v-if="selectedQuote" class="manage-send-actions">
            <button
              v-if="!['Prêt','Fini','Accepté','accepted','sent'].includes(selectedQuote.status)"
              class="btn-validate-quote"
              @click="saveQuote">
              <CheckCircle class="btn-send-icon-sm" />
              Marquer comme Prêt
            </button>
            <button class="btn-confirm-send" @click="sendTarget = selectedQuote">
              <Send class="btn-send-icon-sm" />
              Envoyer {{ selectedQuote.quote_number }}
            </button>
          </div>
          <div v-else class="manage-empty-send">
            <Send class="empty-icon manage-empty-icon" />
            <p class="empty-title">Sélectionnez un devis ci-dessus</p>
            <p class="empty-hint">Seuls les devis avec une adresse e-mail client sont disponibles.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Onglet Archives ── -->
    <div v-if="activeTab === 'archives'" class="panel-card">
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
                  {{ { pending:'En attente', sent:'Envoyé', accepted:'Accepté', refused:'Refusé', 'Prêt':'Prêt', 'Fini':'Fini', 'Accepté':'Accepté' }[q.status] || q.status || 'En attente' }}
                </span>
              </td>
              <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
              <td class="td-actions">
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

    <!-- ── Onglet Statistiques ── -->
    <div v-if="activeTab === 'stats'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">Statistiques & Business</h2>
      </div>
      <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
      <div v-else class="stats-panel">

        <!-- KPIs -->
        <div class="stat-kpi-grid">
          <div class="stat-kpi">
            <p class="stat-kpi-label">CA total (tous devis)</p>
            <p class="stat-kpi-value stat-kpi-value--teal">{{ fmtEur(totalRevenue) }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">CA devis acceptés</p>
            <p class="stat-kpi-value stat-kpi-value--green">{{ fmtEur(statsRevenueAccepted) }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">Panier moyen</p>
            <p class="stat-kpi-value stat-kpi-value--teal">{{ fmtEur(avgCost) }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">Taux d'acceptation</p>
            <p class="stat-kpi-value stat-kpi-value--green">{{ statsAcceptanceRate }}%</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">Acceptés</p>
            <p class="stat-kpi-value stat-kpi-value--green">{{ statsAccepted }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">Refusés</p>
            <p class="stat-kpi-value stat-kpi-value--red">{{ statsRefused }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">Envoyés</p>
            <p class="stat-kpi-value stat-kpi-value--blue">{{ statsSent }}</p>
          </div>
          <div class="stat-kpi">
            <p class="stat-kpi-label">En attente</p>
            <p class="stat-kpi-value">{{ statsPending }}</p>
          </div>
        </div>

        <!-- Répartition par statut — barre visuelle -->
        <div class="stats-section" v-if="quotes.length">
          <p class="stats-section-title">Répartition par statut</p>
          <div class="stats-status-bar">
            <div v-if="statsAccepted" class="stats-status-seg stats-status-seg--green"
              :style="{ width: (statsAccepted / quotes.length * 100) + '%' }"
              :title="'Acceptés : ' + statsAccepted"></div>
            <div v-if="statsSent" class="stats-status-seg stats-status-seg--blue"
              :style="{ width: (statsSent / quotes.length * 100) + '%' }"
              :title="'Envoyés : ' + statsSent"></div>
            <div v-if="statsPending" class="stats-status-seg stats-status-seg--amber"
              :style="{ width: (statsPending / quotes.length * 100) + '%' }"
              :title="'En attente : ' + statsPending"></div>
            <div v-if="statsRefused" class="stats-status-seg stats-status-seg--red"
              :style="{ width: (statsRefused / quotes.length * 100) + '%' }"
              :title="'Refusés : ' + statsRefused"></div>
          </div>
          <div class="stats-status-legend">
            <span class="stats-legend-dot stats-legend-dot--green"></span>Acceptés ({{ statsAccepted }})
            <span class="stats-legend-dot stats-legend-dot--blue"></span>Envoyés ({{ statsSent }})
            <span class="stats-legend-dot stats-legend-dot--amber"></span>En attente ({{ statsPending }})
            <span class="stats-legend-dot stats-legend-dot--red"></span>Refusés ({{ statsRefused }})
          </div>
        </div>

        <!-- CA par matière -->
        <div class="stats-section" v-if="statsByMaterial.length">
          <p class="stats-section-title">Chiffre d'affaires par matière</p>
          <div class="stats-bar-list">
            <div v-for="item in statsByMaterial" :key="item.mat" class="stats-bar-row">
              <span class="stats-bar-label">{{ item.mat }}</span>
              <div class="stats-bar-track">
                <div class="stats-bar-fill"
                  :style="{ width: totalRevenue > 0 ? (item.revenue / totalRevenue * 100) + '%' : '0%' }">
                </div>
              </div>
              <span class="stats-bar-value">{{ fmtEur(item.revenue) }}</span>
              <span class="stats-bar-count">{{ item.count }} devis</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Onglet Catalogue ── -->
    <div v-if="activeTab === 'catalogue'" class="panel-card">
      <CatalogueSection
        :materials="materials"
        :materials-loading="materialsLoading"
        :materials-saving="materialsSaving"
        :mat-uploading="matUploading"
        :current-page="matPage"
        :per-page="matPerPage"
        :known-brands="knownBrands"
        @add-row="addMaterialRow(); matPage = totalMatPages"
        @save="saveMaterials"
        @delete="(mat, idx) => deleteMaterial(mat, idx)"
        @upload="(mat, event) => onMatImageUpload(mat, event)"
        @clear-image="clearMatImage"
        @update:current-page="matPage = $event"
      />

    </div>

    <!-- ── Onglet Paramètres ── -->
    <div v-if="activeTab === 'settings'" class="panel-card">
      <div class="panel-header">
        <h2 class="panel-title">
          {{ settingsPage === 1 ? 'Paramètres de calcul' : 'Simulateur de coût rapide' }}
        </h2>
        <div class="settings-page-indicator">
          <span :class="['spi-dot', settingsPage === 1 && 'spi-dot--active']" @click="settingsPage = 1"></span>
          <span :class="['spi-dot', settingsPage === 2 && 'spi-dot--active']" @click="settingsPage = 2"></span>
        </div>
        <span v-if="settingsLoading" class="settings-loading-badge">Chargement…</span>
      </div>

      <!-- ══ Page 1 : Paramètres de calcul ══ -->
      <div v-if="settingsPage === 1" class="settings-single-col">
        <div class="settings-main-card">

          <!-- Header violet — miroir exact de sim-header -->
          <div class="settings-card-hdr">
            <SlidersHorizontal class="settings-card-hdr-icon" />
            <span class="settings-card-hdr-title">Paramètres de calcul</span>
          </div>

          <!-- Corps scrollable — flex:1 absorbe tout l'espace disponible -->
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

            <!-- Catalogue info — bannière sous la grille -->
            <div class="settings-section settings-section--wide">
              <p class="settings-section-title">Informations catalogue</p>
              <div class="settings-row">
                <span class="settings-label">Filaments enregistrés</span>
                <span class="settings-catalogue-count">{{ materials.length }} filament{{ materials.length > 1 ? 's' : '' }}</span>
              </div>
              <p class="settings-intro-inline" style="padding: 0 0.75rem 0.4rem;">
                Gérez vos matières depuis l'onglet
                <button class="settings-link-tab" @click="activeTab = 'catalogue'">Catalogue →</button>
              </p>
            </div>

          </div>
          <!-- /settings-card-body -->

          <!-- Footer ancré en bas — miroir de sim-nav -->
          <div class="settings-single-footer">
            <button class="btn-save-settings" @click="saveSettings" :disabled="settingsSaving || settingsLoading">
              <span v-if="settingsSaved">✓ Sauvegardé</span>
              <span v-else-if="settingsSaving">Sauvegarde…</span>
              <span v-else>Sauvegarder les paramètres</span>
            </button>
            <button class="btn-settings-next" @click="settingsPage = 2; simStep = 1">
              Simulateur de coût →
            </button>
          </div>

        </div>
      </div>

      <!-- ══ Page 2 : Simulateur pleine largeur ══ -->
      <div v-if="settingsPage === 2" class="settings-single-col settings-single-col--sim">

        <!-- Retour page 1 -->
        <button class="btn-settings-prev" @click="settingsPage = 1">
          ← Paramètres de calcul
        </button>

        <!-- Simulateur pleine largeur -->
        <div class="sim-card sim-card--wide">

          <!-- En-tête -->
          <div class="sim-header">
            <BarChart2 class="sim-header-icon" />
            <span class="sim-header-title">Simulateur de coût rapide</span>
          </div>

          <!-- Indicateur d'étapes -->
          <div class="sim-steps-bar">
            <button :class="['sim-step-dot', simStep === 1 && 'sim-step-dot--active', simStep > 1 && 'sim-step-dot--done']"
                    @click="simStep = 1" title="Données techniques">1</button>
            <div :class="['sim-step-line', simStep > 1 && 'sim-step-line--done']"></div>
            <button :class="['sim-step-dot', simStep === 2 && 'sim-step-dot--active', simStep > 2 && 'sim-step-dot--done']"
                    @click="simStep = 2" title="Matière & Projet">2</button>
            <div :class="['sim-step-line', simStep > 2 && 'sim-step-line--done']"></div>
            <button :class="['sim-step-dot', simStep === 3 && 'sim-step-dot--active']"
                    @click="simStep = 3" title="Résultats financiers">3</button>
          </div>

          <!-- Étape 1 : Données techniques -->
          <div v-if="simStep === 1" class="sim-body sim-body--wide">
            <p class="sim-step-label">① Données techniques</p>
            <div class="sim-wide-grid">
              <div class="sim-field">
                <label class="sim-field-label">Poids de la pièce</label>
                <div class="sim-input-wrap">
                  <input class="sim-input sim-input--lg" type="number" min="0" step="1" v-model.number="simWeight" />
                  <span class="sim-unit">g</span>
                </div>
              </div>
              <div class="sim-field">
                <label class="sim-field-label">Durée d'impression</label>
                <div class="sim-duration-row">
                  <div class="sim-input-wrap">
                    <input class="sim-input" type="number" min="0" max="99" step="1" v-model.number="simPrintHours" />
                    <span class="sim-unit">h</span>
                  </div>
                  <div class="sim-input-wrap">
                    <input class="sim-input" type="number" min="0" max="59" step="5" v-model.number="simPrintMinutes" />
                    <span class="sim-unit">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 2 : Matière & Projet -->
          <div v-if="simStep === 2" class="sim-body sim-body--wide">
            <p class="sim-step-label">② Matière & Projet</p>
            <div class="sim-wide-grid">
              <div class="sim-field">
                <label class="sim-field-label">Matière</label>
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
              <div class="sim-field">
                <label class="sim-field-label">Type de projet</label>
                <select class="sim-select" v-model="simProjectType">
                  <option v-for="pt in projectTypes" :key="pt.id" :value="pt.id">{{ pt.label }}</option>
                </select>
                <div v-if="simProjectCoeff !== 1" class="sim-coeff-badge" style="margin-top:0.4rem">
                  <span class="sim-coeff-text">Coefficient :</span>
                  <strong class="sim-coeff-value">{{ simProjectCoeff > 1 ? '+' : '' }}{{ Math.round((simProjectCoeff - 1) * 100) }}%</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Étape 3 : Résultats financiers -->
          <div v-if="simStep === 3" class="sim-body sim-body--wide">
            <p class="sim-step-label">③ Résultats financiers</p>
            <div class="sim-results sim-results--wide">
              <div class="sim-result-row">
                <span class="sim-result-label">Matière{{ simSelectedMaterial ? ' (' + simSelectedMaterial.name + ')' : '' }}</span>
                <span class="sim-result-value">{{ fmtEur(simMaterialCost) }}</span>
              </div>
              <div class="sim-result-row">
                <span class="sim-result-label">Machine + électricité</span>
                <span class="sim-result-value">{{ fmtEur(simMachineCost) }}</span>
              </div>
              <div class="sim-result-divider"></div>
              <div class="sim-result-row sim-result-row--sub">
                <span class="sim-result-label">Coût de revient</span>
                <span class="sim-result-value sim-result-value--neutral">{{ fmtEur(simTotalCost) }}</span>
              </div>
              <div class="sim-result-row sim-result-row--margin">
                <span class="sim-result-label">Marge ({{ priceMarginDefault }}%)</span>
                <span class="sim-result-value sim-result-value--margin">+ {{ fmtEur(simMarginAmount) }}</span>
              </div>
              <div class="sim-result-divider"></div>
              <div class="sim-result-row sim-result-row--total">
                <span class="sim-result-label">Prix de vente estimé</span>
                <span class="sim-result-value sim-result-value--total">{{ fmtEur(simSalePrice) }}</span>
              </div>
            </div>
            <p class="sim-disclaimer">*Indicatif — hors emballage, post-traitement et remises.</p>
          </div>

          <!-- Navigation Précédent / Suivant -->
          <div class="sim-nav">
            <button v-if="simStep > 1" class="sim-nav-btn sim-nav-btn--prev" @click="simStep--">← Préc.</button>
            <span class="sim-nav-counter">{{ simStep }} / 3</span>
            <button v-if="simStep < 3" class="sim-nav-btn sim-nav-btn--next" @click="simStep++">Suiv. →</button>
          </div>

        </div>
      </div>
    </div>

    <!-- ── Modal envoi devis ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="sendTarget" class="modal-overlay" @click.self="sendTarget = null">
          <div class="modal-box modal-box--send">
            <div class="send-modal-header">
              <div class="modal-icon-wrap modal-icon-wrap--teal">
                <Send class="modal-icon modal-icon--teal" />
              </div>
              <h3 class="modal-title">Envoyer ce devis</h3>
            </div>
            <div class="send-modal-summary">
              <div class="summary-row">
                <span class="summary-label">N° devis</span>
                <span class="summary-val summary-val--mono">{{ sendTarget.quote_number }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Pièce</span>
                <span class="summary-val">{{ sendTarget.project_name || '—' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Client</span>
                <span class="summary-val">{{ sendTarget.client_name || '—' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Email</span>
                <span class="summary-val summary-val--email">{{ sendTarget.client_email }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total TTC</span>
                <span class="summary-val summary-val--total">{{ fmtEur(sendTarget.total_cost) }}</span>
              </div>
            </div>
            <div class="send-modal-preview">
              <p class="preview-label">Aperçu de l'email</p>
              <div class="preview-subject">{{ resolvedSubject(sendTarget) }}</div>
              <div v-if="resolvedIntro(sendTarget)" class="preview-intro">{{ resolvedIntro(sendTarget) }}</div>
              <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction configuré.</div>
            </div>
            <!-- Indicateur pièce jointe PDF -->
            <div class="send-pdf-indicator" :class="attachPdfAuto ? 'send-pdf-indicator--on' : 'send-pdf-indicator--off'">
              <FileText class="send-pdf-icon" />
              <span v-if="attachPdfAuto">Devis PDF joint automatiquement</span>
              <span v-else>PDF non joint (désactivé dans la configuration)</span>
              <span class="send-pdf-status">{{ attachPdfAuto ? '✓' : '○' }}</span>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="sendTarget = null">Annuler</button>
              <button class="btn-confirm-send" :disabled="isSending" @click="sendQuote">
                <Send class="btn-send-icon-sm" />
                {{ isSending ? 'Envoi…' : 'Envoyer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { generateQuotePDF, generateQuotePDFDoc, pdfToBase64 } from '../utils/generateQuotePDF'
import { useCalculatorStore } from '../stores/calculator'
import ToastMessage       from '../components/ToastMessage.vue'
import CatalogueSection   from '../components/CatalogueSection.vue'
import {
  ShieldCheck, Users, FileText, Wallet, TrendingUp, Trash2,
  Download, Pencil, Mail, Bell, Settings, Send, CheckCircle, Archive,
  BarChart2, SlidersHorizontal, Package, ChevronDown,
  Image as ImageIcon, Upload, Palette, Save,
} from 'lucide-vue-next'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default {
  name: 'AdminDashboard',
  components: {
    ToastMessage, CatalogueSection,
    ShieldCheck, Users, FileText, Wallet, TrendingUp,
    Trash2, Download, Pencil, Mail, Bell, Settings, Send, CheckCircle,
    Archive, BarChart2, SlidersHorizontal, Package, ChevronDown,
    ImageIcon, Upload, Palette, Save,
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
      emailSettingsId: null,
      emailSaving: false,
      emailSaved: false,
      testEmailSending: false,
      testEmailSent: false,
      sendTarget: null,
      isSending: false,
      selectedQuoteId: '',
      selectedQuote: null,
      quotesPage: 1,
      quotesPerPage: 10,
      attachPdfAuto:       saved.attachPdfAuto ?? true,
      attachDragOver:      false,
      globalAttachmentName: localStorage.getItem('bambu_global_attachment_name') || '',
      globalAttachment:    null,
      // ── Archives ──────────────────────────────────────────────────────────
      archiveYear: new Date().getFullYear(),
      // ── Paramètres de prix (chargés depuis Supabase → bambu_settings) ─────
      pricePlaPerKg:      16.99,
      priceHourlyRate:    20,
      priceElecPerHour:   0.5,
      priceLossPercent:   5,
      priceMarginDefault: 50,
      settingsSaved:   false,
      settingsSaving:  false,
      settingsLoading: false,
      // ── Simulateur de coût rapide ─────────────────────────────────────────
      simWeight:       50,
      simPrintHours:   1,
      simPrintMinutes: 30,
      // ── Catalogue matières ────────────────────────────────────────────────
      materials:        [],
      materialsLoading: false,
      materialsSaving:  false,
      knownBrands: ['Bambu Lab', 'Eryone', 'Sunlu'],
      TYPE_DEFAULTS: {
        'PLA':        { cost_per_kg: 20, default_waste_percentage: 10 },
        'Matt':       { cost_per_kg: 20, default_waste_percentage: 10 },
        'PLA+':       { cost_per_kg: 22, default_waste_percentage: 10 },
        'PLA+ 2.0':   { cost_per_kg: 22, default_waste_percentage: 10 },
        'PLA HS':     { cost_per_kg: 24, default_waste_percentage: 10 },
        'PLA HS 2.0': { cost_per_kg: 24, default_waste_percentage: 10 },
        'PLA Galaxy': { cost_per_kg: 25, default_waste_percentage: 10 },
        'PLA Silk':   { cost_per_kg: 25, default_waste_percentage: 10 },
        'PETG':       { cost_per_kg: 22, default_waste_percentage: 12 },
      },
      fallbackMaterials: [
        { id: null, _local: true, name: 'Sunlu PLA',          brand: 'Sunlu',  type: 'PLA',      cost_per_kg: 20, default_waste_percentage: 10, color_or_image: '#3B82F6', image_url: null, stock_status: 'En Stock' },
        { id: null, _local: true, name: 'Eryone PLA+',        brand: 'Eryone', type: 'PLA+',     cost_per_kg: 22, default_waste_percentage: 10, color_or_image: '#EF4444', image_url: null, stock_status: 'En Stock' },
        { id: null, _local: true, name: 'Eryone PLA HS 2.0',  brand: 'Eryone', type: 'PLA HS 2.0', cost_per_kg: 24, default_waste_percentage: 10, color_or_image: '#22C55E', image_url: null, stock_status: 'En Stock' },
        { id: null, _local: true, name: 'Eryone PLA Silk',    brand: 'Eryone', type: 'PLA Silk', cost_per_kg: 25, default_waste_percentage: 10, color_or_image: '#F59E0B', image_url: null, stock_status: 'En Stock' },
        { id: null, _local: true, name: 'Eryone PLA Galaxy',  brand: 'Eryone', type: 'PLA Galaxy', cost_per_kg: 25, default_waste_percentage: 10, color_or_image: '#8B5CF6', image_url: null, stock_status: 'En Stock' },
        { id: null, _local: true, name: 'Sunlu PETG',         brand: 'Sunlu',  type: 'PETG',     cost_per_kg: 22, default_waste_percentage: 12, color_or_image: '#6B7280', image_url: null, stock_status: 'En Stock' },
      ],
      // ── Simulateur — sélecteurs étendus ───────────────────────────────────
      simMaterialId:  null,
      simProjectType: 'standard',
      simStep:        1,
      // ── Images préréglées Catalogue ───────────────────────────────────────
      presetImages: [
        { path: '/bambuLab Filament.webp', label: 'Bobine filament' },
      ],
      // ── Pagination & upload état Catalogue ────────────────────────────────
      matPage:      1,
      matPerPage:   4,
      matUploading: false,
      // ── UI état ──────────────────────────────────────────────────────────
      dossierDropdownOpen: false,
      burgerOpen: false,
      settingsPage:        1,
      managePage:          1,
      managePaginePage:    1,
      emailStep:           1,
    }
  },
  computed: {
    tabs() {
      return [
        { id: 'manage',    label: 'Gestion Devis', icon: 'Send',             count: this.sendableQuotes.length + this.sentQuotes.length },
        { id: 'emails',    label: 'Emails',        icon: 'Mail' },
        { id: 'archives',  label: 'Archives',      icon: 'Archive',          count: this.filteredArchives.length },
        { id: 'stats',     label: 'Statistiques',  icon: 'BarChart2' },
        { id: 'catalogue', label: 'Catalogue',     icon: 'Package',          count: this.materials.length },
        { id: 'settings',  label: 'Paramètres',    icon: 'SlidersHorizontal' },
      ]
    },
    currentTabIcon() {
      if (this.activeTab === 'clients') return 'Users'
      if (this.activeTab === 'quotes')  return 'FileText'
      const t = this.tabs.find(t => t.id === this.activeTab)
      return t ? t.icon : 'Menu'
    },
    currentTabLabel() {
      if (this.activeTab === 'clients') return 'Liste des clients'
      if (this.activeTab === 'quotes')  return 'Tous les devis'
      const t = this.tabs.find(t => t.id === this.activeTab)
      return t ? t.label : ''
    },
    sentQuotes() {
      return this.quotes.filter(q => q.status === 'sent')
    },
    sendableQuotes() {
      return this.quotes.filter(q =>
        ['Fini', 'Prêt', 'Accepté', 'accepted'].includes(q.status) && q.client_email
      )
    },
    quoteSelectOptions() {
      return this.quotes
        .filter(q => q.client_email)
        .map(q => {
          const civ  = q.client_civility ? q.client_civility + ' ' : ''
          const name = q.client_last_name
            ? `${civ}${q.client_last_name}`
            : (q.client_name || q.client_email || '—')
          const statusBadge = q.status === 'accepted' ? ' ✓' : ''
          return { id: q.id, label: `${q.quote_number || '—'} — ${name}${statusBadge}` }
        })
    },
    totalRevenue() { return this.quotes.reduce((a, q) => a + (q.total_cost || 0), 0) },
    avgCost()      { return this.quotes.length ? this.totalRevenue / this.quotes.length : 0 },
    // ── Archives ──────────────────────────────────────────────────────────────
    archiveYears() {
      const years = [...new Set(
        this.quotes.filter(q => q.created_at).map(q => new Date(q.created_at).getFullYear())
      )].sort((a, b) => b - a)
      return years.length ? years : [new Date().getFullYear()]
    },
    filteredArchives() {
      return this.quotes.filter(q => {
        if (!q.created_at) return false
        return new Date(q.created_at).getFullYear() === this.archiveYear
      })
    },
    // ── Statistiques ──────────────────────────────────────────────────────────
    statsAccepted()        { return this.quotes.filter(q => ['accepted','Accepté'].includes(q.status)).length },
    statsRefused()         { return this.quotes.filter(q => q.status === 'refused').length },
    statsSent()            { return this.quotes.filter(q => q.status === 'sent').length },
    statsPending()         { return this.quotes.filter(q => !q.status || q.status === 'pending').length },
    statsRevenueAccepted() {
      return this.quotes
        .filter(q => ['accepted','Accepté'].includes(q.status))
        .reduce((a, q) => a + (q.total_cost || 0), 0)
    },
    statsByMaterial() {
      const map = {}
      for (const q of this.quotes) {
        const mat = q.material || 'Inconnu'
        if (!map[mat]) map[mat] = { count: 0, revenue: 0 }
        map[mat].count++
        map[mat].revenue += q.total_cost || 0
      }
      return Object.entries(map)
        .map(([mat, d]) => ({ mat, ...d }))
        .sort((a, b) => b.revenue - a.revenue)
    },
    statsAcceptanceRate() {
      return this.quotes.length ? Math.round(this.statsAccepted / this.quotes.length * 100) : 0
    },
    // ── Simulateur de coût rapide ──────────────────────────────────────────
    simPrintDuration() {
      return (this.simPrintHours || 0) + (this.simPrintMinutes || 0) / 60
    },
    simSelectedMaterial() {
      if (!this.simMaterialId) return null
      return this.materials.find(m => m.id === this.simMaterialId) || null
    },
    simEffectivePricePerKg() {
      return this.simSelectedMaterial ? (this.simSelectedMaterial.cost_per_kg || 0) : (this.pricePlaPerKg || 0)
    },
    simEffectiveLossPercent() {
      return this.simSelectedMaterial ? (this.simSelectedMaterial.default_waste_percentage || 0) : (this.priceLossPercent || 0)
    },
    projectTypes() {
      return [
        { id: 'standard',    label: 'Standard (×1.0)',           coeff: 1.00 },
        { id: 'figurine',    label: 'Figurine (+30%)',           coeff: 1.30 },
        { id: 'serie',       label: 'Série porte-clés (−15%)',   coeff: 0.85 },
        { id: 'cartevisite', label: 'Cartes de visite 3D (+5%)', coeff: 1.05 },
        { id: 'standqr',     label: 'Stand QR Code (+10%)',      coeff: 1.10 },
        { id: 'deco',        label: 'Décoration (×1.0)',         coeff: 1.00 },
      ]
    },
    simProjectCoeff() {
      const pt = this.projectTypes.find(p => p.id === this.simProjectType)
      return pt ? pt.coeff : 1
    },
    simMaterialCost() {
      const w = (this.simWeight || 0) / 1000
      return w * this.simEffectivePricePerKg * (1 + this.simEffectiveLossPercent / 100)
    },
    simMachineCost() {
      return this.simPrintDuration * ((this.priceHourlyRate || 0) + (this.priceElecPerHour || 0))
    },
    simTotalCost() {
      return this.simMaterialCost + this.simMachineCost
    },
    simSalePrice() {
      return this.simTotalCost * this.simProjectCoeff * (1 + (this.priceMarginDefault || 0) / 100)
    },
    simMarginAmount() {
      return this.simSalePrice - this.simTotalCost
    },
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
    paginatedQuotes() {
      const start = (this.quotesPage - 1) * this.quotesPerPage
      return this.filteredQuotes.slice(start, start + this.quotesPerPage)
    },
    totalQuotesPages() {
      return Math.max(1, Math.ceil(this.filteredQuotes.length / this.quotesPerPage))
    },
    paginatedManageQuotes() {
      const start = (this.managePaginePage - 1) * this.quotesPerPage
      return this.filteredQuotes.slice(start, start + this.quotesPerPage)
    },
    totalManagePages() {
      return Math.max(1, Math.ceil(this.filteredQuotes.length / this.quotesPerPage))
    },
    paginatedMaterials() {
      const start = (this.matPage - 1) * this.matPerPage
      return this.materials.slice(start, start + this.matPerPage)
    },
    totalMatPages() {
      return Math.max(1, Math.ceil(this.materials.length / this.matPerPage))
    },
  },
  watch: {
    filterUserId() { this.quotesPage = 1; this.managePaginePage = 1 },
  },
  async created() {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      this.$router.replace({ name: 'login' })
      return
    }
    this.currentUserId = data.user.id
    const meta = data.user.user_metadata || {}
    const full = meta.full_name || meta.name || ''
    this.displayName = full.split(' ')[0] || data.user.email?.split('@')[0] || ''
    await Promise.all([this.loadData(), this.loadEmailSettings(), this.loadGlobalSettings(), this.loadMaterials()])
    this.autoSelectFirstQuote()
  },
  mounted() {
    this._lockScroll = () => {
      document.body.style.overflowY = window.innerWidth > 1023 ? 'hidden' : ''
    }
    this._lockScroll()
    window.addEventListener('resize', this._lockScroll)
  },
  beforeUnmount() {
    document.body.style.overflowY = ''
    if (this._lockScroll) window.removeEventListener('resize', this._lockScroll)
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
      this.quotesPage = 1
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
    async saveQuote() {
      if (!this.selectedQuote) return
      try {
        const { error } = await supabase
          .from('quotes')
          .update({ status: 'Prêt' })
          .eq('id', this.selectedQuote.id)
        if (error) throw error
        // Mise à jour réactive locale
        const idx = this.quotes.findIndex(q => q.id === this.selectedQuote.id)
        if (idx !== -1) this.quotes[idx].status = 'Prêt'
        this.selectedQuote = { ...this.selectedQuote, status: 'Prêt' }
        this.$refs.toast?.show(`Devis ${this.selectedQuote.quote_number} marqué comme "Prêt" — visible dans l'onglet Envoyer.`, 'success', 3000)
      } catch (err) {
        console.error('[saveQuote]', err)
        this.$refs.toast?.show(`Erreur : ${err.message}`, 'error')
      }
    },

    async saveStripeLink(quote) {
      if (!quote?.id) return
      const { error } = await supabase
        .from('quotes')
        .update({ stripe_payment_link: quote.stripe_payment_link || null })
        .eq('id', quote.id)
      if (error) {
        this.$refs.toast?.show('Erreur sauvegarde lien Stripe : ' + error.message, 'error')
      } else {
        this.$refs.toast?.show('Lien Stripe sauvegardé.', 'success', 2000)
      }
    },
    copyStripeLink(url) {
      if (!url) return
      navigator.clipboard.writeText(url)
        .then(() => this.$refs.toast?.show('Lien copié !', 'success', 1500))
        .catch(() => this.$refs.toast?.show('Impossible de copier.', 'error'))
    },

    async sendTestEmail() {
      console.log('[sendTestEmail] called, selectedQuote=', this.selectedQuote?.quote_number ?? 'aucun')
      this.testEmailSending = true
      try {
        const { data: authData } = await supabase.auth.getUser()
        const adminEmail = authData?.user?.email || ''
        if (!adminEmail) throw new Error('Email admin introuvable — vérifiez votre session.')

        const testQuote = {
          quote_number:      'DEV-TEST-0000',
          project_name:      'Pièce de test',
          material:          'PLA+',
          quantity:          1,
          total_cost:        42.50,
          client_email:      adminEmail,
          client_name:       this.displayName || 'Admin',
          client_first_name: this.displayName || 'Admin',
          client_civility:   'M.',
          payment_method:    'virement',
          deposit_percent:   0,
        }

        // ── PDF en pièce jointe ───────────────────────────────────────────────
        let pdfBase64  = null
        let pdfFilename = null
        if (this.attachPdfAuto) {
          try {
            const quoteForPdf = this.selectedQuote  // copie locale pour éviter les accès implicites
            let doc
            if (quoteForPdf) {
              doc = generateQuotePDFDoc(quoteForPdf)
              pdfFilename = `devis-${quoteForPdf.quote_number || 'bambucalc'}.pdf`
            } else {
              // Fallback : PDF minimal de test (aucun devis sélectionné)
              doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
              doc.setFillColor(46, 156, 171)
              doc.rect(0, 0, 210, 24, 'F')
              doc.setTextColor(255, 255, 255)
              doc.setFontSize(18)
              doc.setFont('helvetica', 'bold')
              doc.text('BambuCalc', 14, 14)
              doc.setFontSize(10)
              doc.setFont('helvetica', 'normal')
              doc.text('Impression 3D professionnelle', 14, 20)
              doc.setFontSize(13)
              doc.setFont('helvetica', 'bold')
              doc.setTextColor(27, 47, 57)
              doc.text('Document de test — Vérification configuration e-mail', 14, 38)
              doc.setFontSize(9)
              doc.setFont('helvetica', 'normal')
              doc.setTextColor(113, 128, 150)
              doc.text('Généré automatiquement pour valider l\'intégration Resend.', 14, 48)
              doc.text(`Expéditeur  : ${this.senderName || 'BambuCalc'}`, 14, 58)
              doc.text(`Destinataire : ${adminEmail}`, 14, 64)
              doc.text(`Date         : ${new Date().toLocaleDateString('fr-FR')}`, 14, 70)
              pdfFilename = 'test-bambucalc.pdf'
            }
            pdfBase64 = pdfToBase64(doc)
            console.log('[sendTestEmail] PDF prêt, longueur base64 :', pdfBase64.length)
          } catch (pdfErr) {
            console.warn('[sendTestEmail] génération PDF échouée, envoi sans pièce jointe :', pdfErr)
          }
        }

        // ── Appel edge function ───────────────────────────────────────────────
        const { error } = await supabase.functions.invoke('send-quote-email', {
          body: {
            quote:    testQuote,
            pdfBase64: pdfBase64 ?? null,
            filename: pdfFilename ?? null,
          },
        })
        if (error) throw new Error(error.message || JSON.stringify(error))

        this.testEmailSent = true
        setTimeout(() => { this.testEmailSent = false }, 4000)
        if (this.$refs.toast) {
          this.$refs.toast.show(`Mail de test envoyé à ${adminEmail}`, 'success', 4000)
        } else {
          alert(`Mail de test envoyé à ${adminEmail}`)
        }
      } catch (err) {
        console.error('[sendTestEmail]', err)
        if (this.$refs.toast) {
          this.$refs.toast.show(`Erreur : ${err.message || 'edge function indisponible'}`, 'error')
        } else {
          alert(`Erreur : ${err.message || 'edge function indisponible'}`)
        }
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
      if (error) {
        if (error.code === 'PGRST116') {
          // Table vide — premier démarrage, normal, le premier Save fera un INSERT
          return
        }
        if (error.code === '42501') {
          // Politique RLS non encore propagée ou absente — démarrage silencieux
          // avec les valeurs du localStorage ou les valeurs par défaut.
          // Ne pas bloquer l'UI : l'utilisateur peut quand même utiliser l'onglet Emails.
          console.warn('[loadEmailSettings] RLS 42501 — démarrage avec valeurs par défaut')
          return
        }
        // Toute autre erreur (réseau, schéma, etc.) → log discret, pas de bandeau
        console.error('[loadEmailSettings]', error.code, error.message)
        return
      }
      if (!data) return
      this.emailSettingsId     = data.id
      this.senderName          = data.sender_name          || 'BambuCalc'
      this.replyTo             = data.reply_to             || ''
      this.emailSubject        = data.email_subject        || 'Votre devis BambuCalc — [numéro]'
      this.emailIntroClient    = data.email_intro_client   || ''
      this.notifNewQuote       = data.notif_new_quote      ?? true
      this.notifAccepted       = data.notif_accepted       ?? true
      this.notifClientConfirm  = data.notif_client_confirm ?? true
      this.notifStatusChange   = data.notif_status_change  ?? true
      this._syncEmailCache()
    },
    autoSelectFirstQuote() {
      if (this.quoteSelectOptions.length > 0 && !this.selectedQuoteId) {
        this.selectedQuoteId = this.quoteSelectOptions[0].id
        this.selectedQuote   = this.quotes.find(q => q.id === this.selectedQuoteId) || null
      }
    },
    onQuoteSelect() {
      this.selectedQuote = this.quotes.find(q => q.id === this.selectedQuoteId) || null
    },
    _syncEmailCache() {
      localStorage.setItem('bambu_email_settings', JSON.stringify({
        senderName: this.senderName, replyTo: this.replyTo,
        emailSubject: this.emailSubject, emailIntroClient: this.emailIntroClient,
        notifNewQuote: this.notifNewQuote, notifAccepted: this.notifAccepted,
        notifClientConfirm: this.notifClientConfirm, notifStatusChange: this.notifStatusChange,
        attachPdfAuto: this.attachPdfAuto,
      }))
    },
    async saveEmailSettings() {
      this.emailSaving = true
      try {
        // Payload sans `id` — Postgres génère nextval() pour un INTEGER
        const payload = {
          sender_name:          this.senderName,
          reply_to:             this.replyTo,
          email_subject:        this.emailSubject,
          email_intro_client:   this.emailIntroClient,
          notif_new_quote:      this.notifNewQuote,
          notif_accepted:       this.notifAccepted,
          notif_client_confirm: this.notifClientConfirm,
          notif_status_change:  this.notifStatusChange,
          updated_at:           new Date().toISOString(),
        }

        let opError
        if (this.emailSettingsId) {
          // UPDATE — cible la ligne par son id INTEGER récupéré au chargement
          const result = await supabase
            .from('email_settings')
            .update(payload)
            .eq('id', this.emailSettingsId)
          opError = result.error
        } else {
          // INSERT — id absent du payload, Postgres assigne nextval() automatiquement
          const result = await supabase
            .from('email_settings')
            .insert(payload)
            .select('id')
            .single()
          opError = result.error
          if (result.data?.id) this.emailSettingsId = result.data.id
        }

        if (opError) {
          console.error('[saveEmailSettings]', { code: opError.code, message: opError.message, details: opError.details, hint: opError.hint })
          throw new Error(opError.message || JSON.stringify(opError))
        }

        this._syncEmailCache()
        this.emailSaved = true
        setTimeout(() => { this.emailSaved = false }, 2000)
        this.$refs.toast?.show('Paramètres e-mail sauvegardés.', 'success', 2500)
      } catch (err) {
        console.error('[saveEmailSettings] caught:', err)
        if (this.$refs.toast) {
          this.$refs.toast.show(`Erreur sauvegarde : ${err.message}`, 'error')
        } else {
          alert(`Erreur sauvegarde : ${err.message}`)
        }
      } finally {
        this.emailSaving = false
      }
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
    resolvedSubject(quote) {
      const civility  = quote.client_civility ? quote.client_civility + ' ' : ''
      const lastName  = quote.client_last_name || ''
      const firstName = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
      return (this.emailSubject || 'Votre devis BambuCalc — [numéro]')
        .replace(/\[numéro\]/gi, quote.quote_number || '')
        .replace(/\[senderName\]/gi, this.senderName || 'BambuCalc')
        .replace(/\[projet\]/gi, quote.project_name || '')
        .replace(/\[client\]/gi, firstName)
        .replace(/\[client_nom\]/gi, civility + (lastName || firstName))
    },
    resolvedIntro(quote) {
      const civility   = quote.client_civility ? quote.client_civility + ' ' : ''
      const lastName   = quote.client_last_name || ''
      const firstName  = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
      const fullPolite = civility + (lastName || firstName)
      return (this.emailIntroClient || '')
        .replace(/\[client\]/gi, firstName)
        .replace(/\[client_nom\]/gi, fullPolite)
        .replace(/\[civilité\]/gi, civility.trim())
        .replace(/\[numéro\]/gi, quote.quote_number || '')
        .replace(/\[projet\]/gi, quote.project_name || '')
        .replace(/\[total\]/gi, this.fmtEur(quote.total_cost))
    },
    async sendQuote() {
      if (!this.sendTarget) return
      this.isSending = true
      try {
        // ── Génération PDF Base64 (si toggle activé) ──────────────────────────
        let pdfBase64  = null
        let pdfFilename = null
        if (this.attachPdfAuto) {
          try {
            const doc = generateQuotePDFDoc(this.sendTarget)
            pdfBase64   = pdfToBase64(doc)
            pdfFilename = `devis-${this.sendTarget.quote_number || 'bambucalc'}.pdf`
          } catch (pdfErr) {
            console.warn('[sendQuote] PDF generation failed, sending without attachment:', pdfErr)
          }
        }

        // ── Appel edge function ───────────────────────────────────────────────
        const { error } = await supabase.functions.invoke('send-quote-email', {
          body: {
            quote:      this.sendTarget,
            pdfBase64,
            filename:   pdfFilename,
          },
        })
        if (error) throw new Error(error.message || JSON.stringify(error))

        // ── Mise à jour statut ────────────────────────────────────────────────
        const { error: updateErr } = await supabase
          .from('quotes').update({ status: 'sent' }).eq('id', this.sendTarget.id)
        if (!updateErr) {
          const idx = this.quotes.findIndex(q => q.id === this.sendTarget.id)
          if (idx !== -1) this.quotes[idx].status = 'sent'
          if (this.selectedQuote?.id === this.sendTarget.id) this.selectedQuote.status = 'sent'
        }

        this.$refs.toast?.show(`Email envoyé à ${this.sendTarget.client_email} !`, 'success')
        this.sendTarget = null
      } catch (err) {
        console.error('[sendQuote]', err)
        this.$refs.toast?.show(`Erreur d'envoi : ${err.message || 'edge function indisponible'}`, 'error')
      } finally {
        this.isSending = false
      }
    },
    handleAttachFile(e) {
      const file = e.target.files[0]
      if (file) {
        this.globalAttachment = file
        this.globalAttachmentName = file.name
        localStorage.setItem('bambu_global_attachment_name', file.name)
      }
    },
    handleAttachDrop(e) {
      this.attachDragOver = false
      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/pdf') {
        this.globalAttachment = file
        this.globalAttachmentName = file.name
        localStorage.setItem('bambu_global_attachment_name', file.name)
      }
    },
    clearAttachment() {
      this.globalAttachment = null
      this.globalAttachmentName = ''
      if (this.$refs.attachInput) this.$refs.attachInput.value = ''
      localStorage.removeItem('bambu_global_attachment_name')
    },
    async loadGlobalSettings() {
      this.settingsLoading = true
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
        this.pricePlaPerKg      = parseFloat(data.price_pla_per_kg)     || 16.99
        this.priceHourlyRate    = parseFloat(data.price_hourly_rate)     || 20
        this.priceElecPerHour   = parseFloat(data.price_elec_per_hour)   || 0.5
        this.priceLossPercent   = parseFloat(data.price_loss_percent)    || 5
        this.priceMarginDefault = parseFloat(data.price_margin_default)  || 50
      } finally {
        this.settingsLoading = false
      }
    },
    async saveSettings() {
      this.settingsSaving = true
      try {
        const { error } = await supabase
          .from('bambu_settings')
          .upsert({
            id:                   1,
            price_pla_per_kg:     this.pricePlaPerKg,
            price_hourly_rate:    this.priceHourlyRate,
            price_elec_per_hour:  this.priceElecPerHour,
            price_loss_percent:   this.priceLossPercent,
            price_margin_default: this.priceMarginDefault,
            updated_at:           new Date().toISOString(),
          }, { onConflict: 'id' })
        if (error) throw error
        this.settingsSaved = true
        setTimeout(() => { this.settingsSaved = false }, 2500)
        this.$refs.toast?.show('Paramètres de prix sauvegardés dans Supabase.', 'success', 2500)
      } catch (err) {
        console.error('[saveSettings]', err)
        this.$refs.toast?.show(`Erreur sauvegarde : ${err.message}`, 'error')
      } finally {
        this.settingsSaving = false
      }
    },
    async loadMaterials() {
      this.materialsLoading = true
      try {
        const { data, error } = await supabase
          .from('bambu_materials')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) {
          // Affiche le vrai code d'erreur pour diagnostiquer (RLS, table manquante, réseau…)
          console.error('[loadMaterials] Supabase error —', error.code, ':', error.message, error.hint || '')
          // Catalogue de secours local pour ne jamais laisser l'UI vide
          if (!this.materials.length) this.materials = this.fallbackMaterials.map(m => ({ ...m }))
          return
        }

        if (!data || data.length === 0) {
          // Table vide → seed automatique du catalogue par défaut
          const defaults = this.fallbackMaterials.map(({ id, _local, ...m }) => m)
          const { error: seedErr } = await supabase.from('bambu_materials').insert(defaults)
          if (seedErr) {
            console.error('[loadMaterials] seed failed —', seedErr.code, ':', seedErr.message)
            this.materials = this.fallbackMaterials.map(m => ({ ...m }))
            return
          }
          const { data: seeded, error: reloadErr } = await supabase
            .from('bambu_materials').select('*').order('created_at', { ascending: true })
          if (reloadErr || !seeded?.length) {
            this.materials = this.fallbackMaterials.map(m => ({ ...m }))
            return
          }
          this.materials = seeded
          return
        }

        this.materials = data
      } finally {
        this.materialsLoading = false
      }
    },
    async saveMaterials() {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        this.$refs.toast?.show('Session expirée. Rechargez la page et reconnectez-vous.', 'error', 5000)
        return
      }

      this.materialsSaving = true
      try {
        const now = new Date().toISOString()
        const matPayload = (m, withId) => ({
          ...(withId ? { id: m.id } : {}),
          name:                     m.name || '',
          brand:                    m.brand || '',
          type:                     m.type || 'PLA',
          cost_per_kg:              parseFloat(m.cost_per_kg) || 0,
          default_waste_percentage: parseFloat(m.default_waste_percentage) || 5,
          color_or_image:           this.isHexColor(m.color_or_image) ? m.color_or_image : '#2e9cab',
          image_url:                m.image_url || null,
          stock_status:             m.stock_status || 'En Stock',
          poids_depart:             parseInt(m.poids_depart) || 1000,
          poids_restant:            m.poids_restant !== null && m.poids_restant !== undefined
                                      ? parseInt(m.poids_restant)
                                      : parseInt(m.poids_depart) || 1000,
          updated_at:               now,
        })
        const toUpsert = this.materials.filter(m => m.id && !m._new).map(m => matPayload(m, true))
        const toInsert = this.materials.filter(m => !m.id || m._new).map(m => matPayload(m, false))
        if (toUpsert.length) {
          const { error } = await supabase.from('bambu_materials').upsert(toUpsert, { onConflict: 'id' })
          if (error) throw error
        }
        if (toInsert.length) {
          const { data: inserted, error } = await supabase.from('bambu_materials').insert(toInsert).select()
          if (error) throw error
          // Mise à jour des IDs réels sans rechargement complet
          if (inserted?.length) {
            let i = 0
            this.materials.forEach(m => {
              if ((!m.id || m._new) && inserted[i]) {
                m.id   = inserted[i].id
                m._new = false
                i++
              }
            })
          }
        }
        this.$refs.toast?.show('Catalogue matières sauvegardé.', 'success', 2500)
      } catch (err) {
        this.$refs.toast?.show(`Erreur : ${err.message}`, 'error')
      } finally {
        this.materialsSaving = false
      }
    },
    addMaterialRow() {
      this.materials.push({
        id: null, _new: true,
        name: '', brand: 'Eryone', type: 'PLA',
        cost_per_kg: 20, default_waste_percentage: 10,
        color_or_image: '#2e9cab', image_url: null,
        stock_status: 'En Stock',
        poids_depart: 1000, poids_restant: null,
      })
    },
    async deleteMaterial(mat, idx) {
      // Optimistic : retire immédiatement de l'UI
      this.materials.splice(idx, 1)
      if (this.simMaterialId === mat.id) this.simMaterialId = null
      // Ajuste la page si elle devient vide
      if (this.matPage > this.totalMatPages) this.matPage = this.totalMatPages

      if (mat.id && !mat._new) {
        const { error } = await supabase.from('bambu_materials').delete().eq('id', mat.id)
        if (error) {
          // Rollback : réinsère à sa position d'origine
          this.materials.splice(idx, 0, mat)
          this.$refs.toast?.show(`Erreur suppression : ${error.message}`, 'error')
        }
      }
    },
    // ── Catalogue : type, marque, nom auto ───────────────────────────────
    onTypeChange(mat) {
      const defaults = this.TYPE_DEFAULTS[mat.type]
      if (defaults) {
        mat.cost_per_kg              = defaults.cost_per_kg
        mat.default_waste_percentage = defaults.default_waste_percentage
      }
      this.autoFillName(mat)
    },
    onBrandChange(mat, value) {
      if (value !== 'Autre') {
        mat.brand = value
        this.autoFillName(mat)
      }
      // Si "Autre" : on garde mat.brand tel quel, l'input texte apparaît
    },
    autoFillName(mat) {
      const generated = [mat.brand, mat.type].filter(Boolean).join(' ')
      if (!mat.name) mat.name = generated
    },
    stockLedClass(status) {
      if (status === 'Stock Faible')        return 'mat-stock-led--low'
      if (status === 'Rupture')             return 'mat-stock-led--out'
      if (status === 'Réapprovisionnement') return 'mat-stock-led--reorder'
      return 'mat-stock-led--ok'
    },
    // ── Catalogue : gestion upload image et bascule de mode ──────────────
    triggerImageUpload(idx) {
      const ref = this.$refs['imgUpload_' + idx]
      if (ref) ref.click()
    },
    async onMatImageUpload(mat, event) {
      const file = event.target.files?.[0]
      if (!file) return
      event.target.value = ''

      // Vérification de session — un 403 serait sinon silencieux
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        this.$refs.toast?.show('Session expirée. Rechargez la page et reconnectez-vous.', 'error', 5000)
        return
      }

      this.matUploading = true
      try {
        // 0. Nouveau matériau sans ID → auto-insert en DB avant l'upload
        //    pour éviter que le fichier Storage devienne orphelin
        if (!mat.id || mat._new) {
          const { data: inserted, error: insertErr } = await supabase
            .from('bambu_materials')
            .insert({
              name:                     mat.name  || 'Nouveau filament',
              brand:                    mat.brand || '',
              type:                     mat.type  || 'PLA',
              cost_per_kg:              parseFloat(mat.cost_per_kg)             || 20,
              default_waste_percentage: parseFloat(mat.default_waste_percentage) || 10,
              color_or_image:           this.isHexColor(mat.color_or_image) ? mat.color_or_image : '#2e9cab',
              image_url:                null,
              stock_status:             mat.stock_status || 'En Stock',
              updated_at:               new Date().toISOString(),
            })
            .select()
            .single()
          if (insertErr) {
            this.$refs.toast?.show(
              `Erreur auto-sauvegarde avant upload : ${insertErr.message}`,
              'error', 5000
            )
            return
          }
          mat.id   = inserted.id
          mat._new = false
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)
        const fileName = `${Date.now()}_${safeName}`

        // 1. Upload vers Supabase Storage bucket "filaments"
        const { error: uploadError } = await supabase.storage
          .from('filaments')
          .upload(fileName, file, { upsert: true, contentType: file.type || 'image/webp' })
        if (uploadError) throw uploadError

        // 2. Récupération de l'URL publique permanente
        const { data: urlData } = supabase.storage.from('filaments').getPublicUrl(fileName)
        const publicUrl = urlData.publicUrl

        // 3. UPDATE immédiat en DB — le matériau a toujours un ID ici
        const { error: dbErr } = await supabase
          .from('bambu_materials')
          .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
          .eq('id', mat.id)
        if (dbErr) {
          console.error('[onMatImageUpload] Erreur DB update :', dbErr.message)
          this.$refs.toast?.show(
            `Photo uploadée mais sauvegarde DB échouée : ${dbErr.message}`,
            'error', 6000
          )
          mat.image_url = publicUrl
          return
        }

        // 4. Mise à jour réactive locale
        mat.image_url = publicUrl
        this.$refs.toast?.show('Photo uploadée et sauvegardée.', 'success', 2500)
      } catch (err) {
        const status = err?.statusCode ?? err?.status ?? 0
        console.error('[onMatImageUpload] Erreur Storage :', status, err?.message, err)
        if (status === 403 || status === 401) {
          this.$refs.toast?.show(
            `Accès refusé (${status}). Relancez le script SQL des politiques Storage dans Supabase.`,
            'error', 7000
          )
        } else {
          this.$refs.toast?.show(`Erreur upload : ${err.message}`, 'error', 5000)
        }
      } finally {
        this.matUploading = false
      }
    },
    async clearMatImage(mat) {
      mat.image_url = null
      if (mat.id && !mat._new) {
        const { error } = await supabase
          .from('bambu_materials')
          .update({ image_url: null, updated_at: new Date().toISOString() })
          .eq('id', mat.id)
        if (error) console.error('[clearMatImage]', error.message)
      }
      this.$refs.toast?.show('Photo supprimée.', 'success', 1800)
    },
    openImageMode(mat) {
      mat.image_url = this.presetImages[0]?.path ?? null
    },
    // ── FONCTION DE DÉTECTION TYPE D'APPARENCE ────────────────────────────
    isHexColor(val) {
      return typeof val === 'string' && /^#[0-9A-Fa-f]{3,6}$/.test(val)
    },
    // ── FONCTION DE DÉTECTION IMAGE ──────────────────────────────────────
    // Retourne true si la valeur est une image (URL absolue, chemin relatif avec extension image,
    // ou data URL base64 générée par FileReader). Retourne false pour les codes HEX et les chaînes vides.
    isImageUrl(val) {
      if (typeof val !== 'string' || !val.trim()) return false
      return val.startsWith('http://') || val.startsWith('https://') ||
        val.startsWith('data:image/') ||
        /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(val)
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
  height: calc(100dvh - 4.5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  padding: 1.5rem 1.5rem 1rem;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Bannière hero admin ── */
.admin-banner {
  /* escapes the 1.5rem padding on top + sides to go edge-to-edge */
  height: 5rem;
  margin: -1.5rem -1.5rem 0;
  flex-shrink: 0;
  background:
    url('/hero-adminDashboard.svg') center / cover no-repeat,
    linear-gradient(135deg, #7c3aed 0%, #8b5cf6 60%, #3fb2bf 100%);
}

/* ── Hero ── */
.admin-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: -1.45rem;   /* overlap the banner for premium feel */
  margin-bottom: 0.75rem; /* tightened vs original 1.5rem */
  flex-wrap: wrap;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.admin-hero-left { display: flex; align-items: center; gap: 0.85rem; }
.admin-avatar {
  width: 3rem; height: 3rem; border-radius: 999px;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(124,58,237,0.4); flex-shrink: 0;
  border: 3px solid #fff;
}
.admin-avatar-icon { width: 1.4rem; height: 1.4rem; color: #fff; }
.admin-eyebrow {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #7c3aed; margin: 0 0 0.1rem;
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
  gap: 0.75rem; margin-bottom: 0.75rem;
  flex-shrink: 0;
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

/* ── Burger menu mobile (masqué par défaut, visible ≤640px) ── */
.tabs-burger {
  display: none;
  position: relative;
  width: 100%;
  margin-bottom: 0.65rem;
  flex-shrink: 0;
  z-index: 50;
}
.burger-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.58rem 0.85rem;
  border-radius: 12px;
  border: 1.5px solid rgba(124, 58, 237, 0.22);
  background: rgba(255, 255, 255, 0.97);
  color: #6d28d9;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.10);
  text-align: left;
}
.burger-trigger-icon { width: 1rem; height: 1rem; flex-shrink: 0; }
.burger-trigger-label { flex: 1; }
.burger-trigger-chevron {
  width: 0.85rem; height: 0.85rem; flex-shrink: 0;
  transition: transform 0.2s ease;
}
.burger-trigger-chevron--open { transform: rotate(180deg); }

.burger-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0; right: 0;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden;
  padding: 0.3rem;
}
.burger-group-label {
  font-size: 0.6rem;
  font-weight: 800;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.65rem 0.15rem;
}
.burger-sep {
  height: 1px;
  background: #f0f4f8;
  margin: 0.2rem 0;
}
.burger-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.52rem 0.65rem;
  border-radius: 9px;
  border: none;
  background: none;
  color: #4a5568;
  font-size: 0.83rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}
.burger-item:hover { background: #f7f5ff; color: #6d28d9; }
.burger-item--active { background: #f3f0ff; color: #7c3aed; }
.burger-item-icon { width: 0.9rem; height: 0.9rem; flex-shrink: 0; }
.burger-item-count {
  margin-left: auto;
  font-size: 0.65rem; font-weight: 700;
  background: rgba(124,58,237,0.10);
  color: #7c3aed;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
}

/* ── Onglets — Violet Admin ── */
.tabs-bar { display: flex; gap: 0.4rem; margin-bottom: 0.5rem; flex-shrink: 0; }
.tab-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.48rem 1rem; border-radius: 10px;
  border: 1.5px solid rgba(124, 58, 237, 0.18);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  color: #6d28d9;
  font-size: 0.84rem; font-weight: 600; cursor: pointer; font-family: inherit;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  transition: all 0.18s ease;
}
.tab-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #7c3aed; color: #7c3aed;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.18);
}
.tab-btn--active {
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  border-color: transparent; color: #fff;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45);
}
.tab-icon { width: 0.85rem; height: 0.85rem; }
.tab-count {
  font-size: 0.67rem; font-weight: 700;
  background: rgba(0,0,0,0.09); color: inherit;
  padding: 0.08rem 0.42rem; border-radius: 999px;
}
.tab-btn--active .tab-count { background: rgba(255,255,255,0.28); color: #fff; }

/* ── Dropdown "Clients & Devis" ── */
.tab-dropdown-wrap { position: relative; flex-shrink: 0; }
.tab-chevron { width: 0.75rem; height: 0.75rem; transition: transform 0.2s ease; flex-shrink: 0; }
.tab-chevron--open { transform: rotate(180deg); }
.tab-dropdown {
  position: absolute; top: calc(100% + 0.4rem); left: 0; z-index: 200;
  min-width: 200px; background: #fff; border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  overflow: hidden; padding: 0.25rem;
  display: flex; flex-direction: column; gap: 0.1rem;
}
.tab-dropdown-item {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.5rem 0.75rem; border-radius: 8px;
  border: none; background: none; cursor: pointer; width: 100%;
  font-family: inherit; font-size: 0.82rem; font-weight: 600;
  color: #4a5568; text-align: left; transition: all 0.15s ease;
}
.tab-dropdown-item:hover { background: #f7f0ff; color: #7c3aed; }
.tab-dropdown-item--active { background: #f0e6ff; color: #7c3aed; }
.tab-dropdown-icon { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }
.tab-dropdown-count {
  margin-left: auto; font-size: 0.67rem; font-weight: 700;
  background: rgba(124,58,237,0.1); color: #7c3aed;
  padding: 0.05rem 0.4rem; border-radius: 999px; flex-shrink: 0;
}
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0; transform: translateY(-6px) scale(0.97);
}

/* ── Panel card ── */
.panel-card {
  background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06); overflow: hidden;
  flex: 1; min-height: 0; display: flex; flex-direction: column;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.25rem; border-bottom: 1px solid #f0f4f8;
  gap: 0.75rem; flex-wrap: wrap; flex-shrink: 0;
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
  flex: 1;
}
.empty-icon { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
.data-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 0.82rem; }
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

.btn-edit, .btn-pdf, .btn-del, .btn-send-row {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }
.btn-edit:hover     { background: #ebf0ff; color: #5a67d8; }
.btn-pdf:hover      { background: #ebf8ff; color: #2e9cab; }
.btn-send-row:hover { background: #e8f7f9; color: #2e9cab; }
.btn-del:hover      { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }

/* ── Email panel 3 colonnes ── */
.email-header-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }

.email-grid {
  display: grid;
  /* config fixe | rédaction large (2/3) | pièces jointes (1/3) */
  grid-template-columns: 230px 2fr 1fr;
  border-top: 1px solid #f0f4f8;
  flex: 1; min-height: 0; overflow: hidden;
}
.email-col {
  border-right: 1px solid #f0f4f8;
  display: flex; flex-direction: column;
  min-height: 0; overflow: hidden;
}
.email-col:last-child { border-right: none; }
.email-col-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1.1rem;
  background: #f7f9fc; border-bottom: 1px solid #f0f4f8;
  font-size: 0.65rem; font-weight: 800; color: #a0aec0;
  text-transform: uppercase; letter-spacing: 0.07em;
  flex-shrink: 0;
}
.email-col-icon { width: 0.8rem; height: 0.8rem; flex-shrink: 0; }
.email-col-body {
  padding: 1rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.7rem;
  flex: 1; overflow-y: auto;
}
.email-col-footer {
  padding: 0.75rem 1.1rem;
  border-top: 1px solid #f0f4f8;
  flex-shrink: 0;
  display: flex; flex-direction: column; gap: 0.65rem;
}

/* ── Sous-grille interne de la col 3 (Texte | Pièces jointes) ── */
.email-col3-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 3fr 2fr;
  overflow: hidden;
}
.email-col3-text {
  padding: 0.85rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  overflow-y: auto;
  min-height: 0; /* required for grid-item to clip correctly */
  border-right: 1px solid #f0f4f8;
}
.email-col3-attach {
  padding: 0.85rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  overflow-y: auto;
  min-height: 0;
}

/* ── Pied du panneau email (boutons Sauvegarder / Tester) ── */
.email-panel-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.65rem 1.25rem;
  border-top: 1px solid #f0f4f8;
  flex-shrink: 0;
  background: #fff;
}

/* Champs dans les colonnes */
.ecf-group { display: flex; flex-direction: column; gap: 0.25rem; }
.ecf-group--grow { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.ecf-group--grow .ecf-textarea { flex: 1; min-height: 60px; }
.ecf-label { font-size: 0.72rem; font-weight: 700; color: #4a5568; }
.ecf-input {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.45rem 0.65rem; font-size: 0.82rem;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; width: 100%; transition: border-color 0.2s;
  box-sizing: border-box;
}
.ecf-input:focus { border-color: #2e9cab; }
.ecf-textarea { resize: none; line-height: 1.5; }
.ecf-hint { font-size: 0.67rem; color: #a0aec0; margin: 0; }

/* ── Select devis ── */
.ecf-select {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.45rem 0.65rem; font-size: 0.82rem;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; width: 100%; transition: border-color 0.2s;
  box-sizing: border-box; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a0aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.65rem center;
  padding-right: 2rem;
}
.ecf-select:focus { border-color: #2e9cab; }
.ecf-hint--warn { color: #d69e2e; }

/* ── Destinataire auto-rempli ── */
.ecf-recipient {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.42rem 0.7rem; border-radius: 8px;
  background: #e8f7f9; border: 1px solid #b2e8ef;
  flex-shrink: 0;
}
.ecf-recipient-label { font-size: 0.65rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.ecf-recipient-email { font-size: 0.8rem; font-weight: 700; color: #2e9cab; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ecf-recipient-badge { font-size: 0.85rem; color: #2e9cab; font-weight: 800; flex-shrink: 0; }

/* ── Aperçu résolu du mail ── */
.ecf-preview-block {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0.7rem 0.85rem; display: flex; flex-direction: column; gap: 0.3rem;
  flex-shrink: 0;
}
.ecf-preview-label   { font-size: 0.58rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.07em; margin: 0; }
.ecf-preview-subject { font-size: 0.8rem; font-weight: 700; color: #1b2f39; margin: 0; }
.ecf-preview-intro   { font-size: 0.75rem; color: #4a5568; line-height: 1.55; margin: 0; white-space: pre-wrap; }

/* ── Actions dans le bloc aperçu ── */
.ecf-preview-actions {
  display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;
}
.btn-validate-quote {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.52rem 1.15rem; border: none; border-radius: 999px;
  background: #e8f7f9; color: #2e9cab;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.2s ease;
}
.btn-validate-quote:hover { background: #d0eff4; }

/* ── Bouton inline "Envoyer ce devis" (dans le bloc aperçu) ── */
.btn-send-inline {
  display: inline-flex; align-items: center; gap: 0.4rem;
  margin-top: 0.75rem;
  padding: 0.52rem 1.15rem; border: none; border-radius: 999px;
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.3); transition: filter 0.2s ease;
  white-space: nowrap;
}
.btn-send-inline:hover { filter: brightness(1.07); }

/* Pousse test+save vers la droite quand "Envoyer ce devis" est présent */
.email-footer-spacer { flex: 1; }

/* Sous-section dans le panneau gauche */
.ecf-section-label {
  display: flex; align-items: center; gap: 0.3rem;
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: #7c3aed; margin: 0;
}
.ecf-section-icon { width: 0.72rem; height: 0.72rem; flex-shrink: 0; }
.ecf-sep {
  height: 1px; background: #f0f4f8;
  margin: 0.2rem 0; flex-shrink: 0;
}

/* Notifications dans col 2 */
.notif-sub {
  font-size: 0.62rem; font-weight: 800; color: #cbd5e0;
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
}
.notif-sub--spaced { margin-top: 0.4rem; }
.notif-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.5rem 0.65rem;
  background: #f7f9fc; border-radius: 10px; border: 1px solid #e2e8f0;
}
.notif-text { flex: 1; }
.notif-label { font-size: 0.78rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.1rem; }
.notif-desc  { font-size: 0.67rem; color: #a0aec0; margin: 0; }

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
  display: inline-flex; align-items: center;
  padding: 0.52rem 1.25rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab;
  font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s ease;
}
.btn-test-email:hover:not(:disabled) {
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
}
.btn-test-email:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-save-email {
  display: inline-flex; align-items: center;
  padding: 0.52rem 1.4rem; border: none; border-radius: 999px;
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3); transition: filter 0.2s ease;
}
.btn-save-email:hover:not(:disabled) { filter: brightness(1.06); }
.btn-save-email:disabled { opacity: 0.65; cursor: not-allowed; }

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

/* ── Send / Sent tabs ── */
.send-list { display: flex; flex-direction: column; gap: 0; flex: 1; overflow-y: auto; }
.send-card--sent { background: #f9fffe; }
.sent-badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.75rem; font-weight: 700; color: #2e9cab;
  background: #e8f7f9; padding: 0.3rem 0.75rem; border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
}
.sent-badge-icon { width: 0.85rem; height: 0.85rem; }
.send-card {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f0f4f8; transition: background 0.15s ease;
}
.send-card:last-child { border-bottom: none; }
.send-card:hover { background: #f8f7ff; }

.send-card-info {
  display: flex; align-items: center; gap: 0.85rem;
  flex-wrap: wrap; flex: 1; min-width: 0;
}
.send-card-num  { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #718096; white-space: nowrap; }
.send-card-name { font-size: 0.85rem; font-weight: 700; color: #1b2f39; }
.send-card-client { font-size: 0.82rem; color: #4a5568; }
.send-card-email { font-size: 0.78rem; color: #2e9cab; }
.send-card-total { font-size: 0.88rem; font-weight: 800; color: #2e9cab; margin-left: auto; white-space: nowrap; }

.btn-send-quote {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.45rem 1rem; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  box-shadow: 0 3px 10px rgba(46,156,171,0.25); transition: filter 0.2s ease;
}
.btn-send-quote:hover { filter: brightness(1.07); }
.btn-send-icon { width: 0.8rem; height: 0.8rem; }

.empty-hint { font-size: 0.82rem; color: #a0aec0; margin: 0; text-align: center; }

/* Send modal */
.modal-box--send { max-width: 440px; align-items: flex-start; text-align: left; }
.send-modal-header {
  display: flex; align-items: center; gap: 0.75rem; width: 100%; margin-bottom: 0.5rem;
}
.modal-icon-wrap--teal { background: #e8f7f9; }
.modal-icon--teal { color: #2e9cab; }

.send-modal-summary {
  width: 100%; background: #f7f9fc; border: 1px solid #e2e8f0;
  border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem;
}
.summary-row {
  display: flex; align-items: baseline; gap: 0.75rem;
  padding: 0.5rem 0.85rem; border-bottom: 1px solid #f0f4f8;
}
.summary-row:last-child { border-bottom: none; }
.summary-label { font-size: 0.72rem; font-weight: 700; color: #a0aec0; width: 70px; flex-shrink: 0; }
.summary-val   { font-size: 0.85rem; font-weight: 600; color: #1b2f39; }
.summary-val--mono  { font-family: 'Courier New', monospace; font-size: 0.78rem; color: #718096; }
.summary-val--email { color: #2e9cab; }
.summary-val--total { color: #2e9cab; font-weight: 800; }

.send-modal-preview {
  width: 100%; background: #f7f9fc; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 0.75rem 0.85rem; margin-bottom: 0.25rem;
}
.preview-label { font-size: 0.65rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 0.5rem; }
.preview-subject { font-size: 0.82rem; font-weight: 700; color: #1b2f39; margin-bottom: 0.4rem; }
.preview-intro { font-size: 0.8rem; color: #4a5568; line-height: 1.55; white-space: pre-wrap; }
.preview-intro--muted { color: #a0aec0; font-style: italic; }

/* ── Indicateur PDF dans la modale d'envoi ── */
.send-pdf-indicator {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 0.75rem; border-radius: 8px;
  font-size: 0.78rem; font-weight: 700;
  width: 100%; margin-bottom: 0.1rem;
}
.send-pdf-indicator--on  { background: #e8f7f9; border: 1px solid #b2e8ef; color: #2e9cab; }
.send-pdf-indicator--off { background: #f7f9fc; border: 1px solid #e2e8f0; color: #a0aec0; }
.send-pdf-icon   { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }
.send-pdf-status { margin-left: auto; font-size: 0.85rem; }

.btn-confirm-send {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem; border: none; border-radius: 10px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.3); transition: filter 0.15s ease;
}
.btn-confirm-send:hover:not(:disabled) { filter: brightness(1.07); }
.btn-confirm-send:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-send-icon-sm { width: 0.85rem; height: 0.85rem; }

/* ── Pagination ── */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 1rem 1.25rem;
  border-top: 1px solid #f0f4f8;
  flex-shrink: 0;
}
.page-btn {
  padding: 0.4rem 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease; white-space: nowrap;
}
.page-btn:hover:not(:disabled) { border-color: #5a67d8; color: #5a67d8; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.25rem; flex-wrap: wrap; justify-content: center; }
.page-num {
  width: 2rem; height: 2rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  display: flex; align-items: center; justify-content: center;
}
.page-num:hover { border-color: #5a67d8; color: #5a67d8; }
.page-num--active { border-color: #5a67d8; background: #ebf0ff; color: #5a67d8; }

/* ── Responsive column hiding ── */
.th-hide-sm, .td-hide-sm { }
.th-hide-md, .td-hide-md { }

/* ── Pièces jointes (email col 3) ── */
/* ── Archives — badge statut ── */
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

/* ── Stats panel ── */
.stats-panel {
  flex: 1; overflow-y: auto; padding: 1.25rem;
  display: flex; flex-direction: column; gap: 1.5rem;
}
.stat-kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;
}
.stat-kpi {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.25rem;
}
.stat-kpi-label { font-size: 0.67rem; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.stat-kpi-value { font-size: 1.25rem; font-weight: 800; color: #1b2f39; margin: 0; letter-spacing: -0.02em; }
.stat-kpi-value--teal  { color: #2e9cab; }
.stat-kpi-value--green { color: #276749; }
.stat-kpi-value--red   { color: #c53030; }
.stat-kpi-value--blue  { color: #2b6cb0; }

.stats-section { display: flex; flex-direction: column; gap: 0.75rem; }
.stats-section-title {
  font-size: 0.72rem; font-weight: 800; color: #7c3aed;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}

/* Barre de répartition par statut */
.stats-status-bar {
  display: flex; height: 1rem; border-radius: 999px; overflow: hidden;
  background: #e2e8f0;
}
.stats-status-seg {
  transition: width 0.4s ease;
}
.stats-status-seg--green { background: #48bb78; }
.stats-status-seg--blue  { background: #4299e1; }
.stats-status-seg--amber { background: #ecc94b; }
.stats-status-seg--red   { background: #fc8181; }
.stats-status-legend {
  display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;
  font-size: 0.72rem; font-weight: 600; color: #718096;
}
.stats-legend-dot {
  display: inline-block; width: 0.6rem; height: 0.6rem;
  border-radius: 50%; margin-right: 0.25rem;
}
.stats-legend-dot--green { background: #48bb78; }
.stats-legend-dot--blue  { background: #4299e1; }
.stats-legend-dot--amber { background: #ecc94b; }
.stats-legend-dot--red   { background: #fc8181; }

/* Barre par matière */
.stats-bar-list { display: flex; flex-direction: column; gap: 0.5rem; }
.stats-bar-row  { display: flex; align-items: center; gap: 0.75rem; }
.stats-bar-label {
  font-size: 0.78rem; font-weight: 700; color: #4a5568;
  width: 80px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.stats-bar-track {
  flex: 1; height: 0.55rem; background: #e2e8f0; border-radius: 999px; overflow: hidden;
}
.stats-bar-fill {
  height: 100%; background: linear-gradient(90deg, #3fb2bf 0%, #2e9cab 100%);
  border-radius: 999px; transition: width 0.4s ease;
}
.stats-bar-value { font-size: 0.78rem; font-weight: 800; color: #2e9cab; white-space: nowrap; width: 80px; text-align: right; flex-shrink: 0; }
.stats-bar-count { font-size: 0.67rem; color: #a0aec0; white-space: nowrap; flex-shrink: 0; }

/* ── Paramètres : layout 3 colonnes ── */
.settings-loading-badge {
  font-size: 0.72rem; font-weight: 700; color: #7c3aed;
  background: #f3e8ff; padding: 0.2rem 0.65rem; border-radius: 999px;
}

/*
 * 2-column grid: 1fr (catalogue) | 1fr (droite tabulée)
 * minmax(0, Xfr) = clé anti-blowout (autorise les colonnes à rétrécir sous min-content)
 */
.settings-v3-grid {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  overflow: hidden;
  border-top: 1px solid #f0f4f8;
}
.settings-v3-col {
  display: flex; flex-direction: column;
  min-height: 0; min-width: 0; overflow: hidden;
}
.settings-v3-col--catalog { border-right: 1px solid #e2e8f0; }
.settings-v3-col--right   { background: #fafbfd; }

/* ── Onglets du panneau droit ── */
.settings-right-tabs {
  display: flex; flex-shrink: 0;
  background: #f7f9fc;
  border-bottom: 1.5px solid #e2e8f0;
}
.srt-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.3rem;
  padding: 0.58rem 0.5rem;
  border: none; border-bottom: 2.5px solid transparent;
  background: transparent; font-size: 0.74rem; font-weight: 600; color: #718096;
  cursor: pointer; font-family: inherit;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  margin-bottom: -1.5px;
}
.srt-btn:hover { color: #7c3aed; background: #f3e8ff; }
.srt-btn--active { color: #7c3aed; border-bottom-color: #7c3aed; background: #fff; }
.srt-icon { width: 0.78rem; height: 0.78rem; flex-shrink: 0; }

/* Panneaux de contenu du côté droit */
.settings-right-panel {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 0.9rem 1rem;
  display: flex; flex-direction: column; gap: 0.85rem;
}
.settings-right-panel--sim {
  padding: 0.85rem;
  gap: 0;
}

/* En-tête de la colonne catalogue */
.settings-v3-col-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.6rem; padding: 0.55rem 0.9rem;
  background: #f7f9fc; border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.settings-intro-inline { font-size: 0.65rem; color: #a0aec0; margin: 0.1rem 0 0; }
.settings-top-actions  { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
.btn-add-mat {
  padding: 0.35rem 0.8rem; border: 1.5px solid #7c3aed; border-radius: 999px;
  background: #fff; color: #7c3aed; font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.btn-add-mat:hover { background: #f3e8ff; }
.btn-save-mat { font-size: 0.75rem; padding: 0.35rem 0.9rem; }

/* Tableau matières */
.mat-table-wrap {
  flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.mat-table { width: 100%; min-width: 900px; border-collapse: collapse; font-size: 0.75rem; table-layout: fixed; }
.mat-th {
  padding: 0.26rem 0.38rem; text-align: left;
  font-size: 0.54rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #fff; border-bottom: 1px solid #e2e8f0;
  white-space: nowrap; position: sticky; top: 0; z-index: 1;
}
.mat-th--color  { width: 108px; }
.mat-th--photo  { width: 68px; }
.mat-th--name   { width: 150px; }
.mat-th--brand  { width: 100px; }
.mat-th--type   { width: 90px; }
.mat-th--num    { width: 50px; text-align: right; }
.mat-th--restant { color: #2e9cab; width: 72px; }
.mat-th--poids  { width: 74px; }
.mat-th--stock  { width: 108px; }
.mat-th--action { width: 30px; }
.mat-row { border-bottom: 1px solid #f0f4f8; transition: background 0.1s; }
.mat-row:hover { background: #f8f7ff; }
.mat-td { padding: 0.20rem 0.35rem; vertical-align: middle; }
.mat-td--color  { width: 108px; }
.mat-td--photo  { width: 68px; }
.mat-td--num    { text-align: right; }
.mat-td--stock  { vertical-align: middle; }
.mat-td--action { text-align: center; }
.mat-poids-cell { display: flex; align-items: center; gap: 2px; justify-content: flex-end; }
.mat-unit-label { font-size: 0.58rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }
.mat-input--restant { color: #2e9cab; font-weight: 700; }

.mat-empty-cell {
  padding: 1.5rem; text-align: center;
  font-size: 0.78rem; color: #a0aec0; font-style: italic;
}

/* ── Colonne Couleur : picker compact ── */
.mat-color-compact {
  display: flex; align-items: center; gap: 0.3rem;
}

/* ── Colonne Photo bobine ── */
.mat-photo-cell {
  display: flex; align-items: center; gap: 0.28rem;
}
.mat-photo-preview {
  flex-shrink: 0;
}
.mat-photo-thumb {
  width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
  border: 2px solid #e2e8f0; display: block;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
}
.mat-photo-empty {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px dashed #d1d5db; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
}
.mat-photo-empty-icon { width: 0.9rem; height: 0.9rem; color: #cbd5e0; }
.mat-photo-btns { display: flex; flex-direction: column; gap: 0.15rem; }
.mat-mode-btn--del-img:hover { background: #fff5f5; border-color: #fc8181; color: #e53e3e; }
.mat-color-swatch {
  width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.1); display: inline-block;
}
.mat-color-swatch--lg {
  width: 30px; height: 30px; border-radius: 50%; display: inline-block;
  border: 2px solid rgba(0,0,0,0.1);
}

/* ── Mode COULEUR ── */
.mat-color-controls {
  display: flex; align-items: center; gap: 0.3rem; flex: 1; min-width: 0;
}
/* Color picker natif : apparence personnalisée (carré arrondi cliquable) */
.mat-color-picker {
  -webkit-appearance: none; appearance: none;
  width: 26px; height: 26px; border: none; border-radius: 6px;
  padding: 0; cursor: pointer; flex-shrink: 0;
  background: transparent;
  box-shadow: 0 0 0 1.5px #e2e8f0;
  transition: box-shadow 0.15s;
}
.mat-color-picker:hover  { box-shadow: 0 0 0 2px #9f7aea; }
.mat-color-picker::-webkit-color-swatch-wrapper { padding: 0; border-radius: 6px; }
.mat-color-picker::-webkit-color-swatch { border: none; border-radius: 5px; }
.mat-color-picker::-moz-color-swatch    { border: none; border-radius: 5px; }
/* Affichage code hex */
.mat-hex-label {
  font-size: 0.67rem; font-family: monospace; font-weight: 700;
  color: #4a5568; letter-spacing: 0.03em;
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Mode IMAGE ── */
.mat-image-controls {
  display: flex; align-items: center; gap: 0.3rem; flex: 1; min-width: 0;
}
.mat-presets {
  display: flex; align-items: center; gap: 0.2rem; flex-wrap: nowrap;
}
.mat-preset-thumb {
  width: 24px; height: 24px; border-radius: 50%; object-fit: cover;
  cursor: pointer; border: 2px solid #e2e8f0; flex-shrink: 0;
  transition: border-color 0.15s, transform 0.15s;
}
.mat-preset-thumb:hover        { border-color: #9f7aea; transform: scale(1.12); }
.mat-preset-thumb--active      { border-color: #7c3aed; box-shadow: 0 0 0 2px #ede9fe; }

/* ── Boutons / labels de bascule de mode ── */
.mat-mode-btn {
  width: 24px; height: 24px; border-radius: 6px; border: 1.5px solid #e2e8f0;
  background: #fff; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease; padding: 0; color: #718096;
  box-sizing: border-box; font-family: inherit; /* normalise <label> vs <button> */
  user-select: none;
}
.mat-mode-btn:hover { background: #f0e6ff; border-color: #9f7aea; color: #7c3aed; }
.mat-mode-btn--upload:hover { background: #e8f7f9; border-color: #2e9cab; color: #2e9cab; }
.mat-mode-btn--color:hover  { background: #f0e6ff; border-color: #7c3aed; color: #7c3aed; }
.mat-mode-icon { width: 0.72rem; height: 0.72rem; }

/* Inputs dans le tableau matières */
.mat-input {
  width: 100%; box-sizing: border-box; border: 1.5px solid #e2e8f0; border-radius: 6px;
  padding: 0.22rem 0.42rem; font-size: 0.76rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none;
  transition: border-color 0.2s; box-sizing: border-box;
}
.mat-input:focus { border-color: #7c3aed; }
.mat-input--name  { /* largeur libre — le td s'en charge */ }
.mat-input--brand { max-width: 108px; }
.mat-input--num   { width: 52px; text-align: right; }
.mat-input--poids { width: 58px; }
.mat-select {
  width: 100%; box-sizing: border-box; border: 1.5px solid #e2e8f0; border-radius: 6px;
  padding: 0.22rem 0.32rem; font-size: 0.76rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.mat-select:focus { border-color: #7c3aed; }
.mat-select--compact  { width: auto; min-width: 62px; max-width: 100px; }
.mat-select--type     { width: 100%; }
.mat-select--brand    { width: 100%; margin-bottom: 0.18rem; }
.mat-select--stock    { flex: 1; min-width: 0; font-size: 0.72rem; }
.mat-input--brand-other {
  width: 100%; margin-top: 0.18rem;
  box-sizing: border-box; border: 1.5px solid #e2e8f0; border-radius: 6px;
  padding: 0.22rem 0.42rem; font-size: 0.76rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none;
}
.mat-input--brand-other:focus { border-color: #7c3aed; }
/* ── Voyant stock LED ── */
.mat-stock-cell {
  display: flex; align-items: center; gap: 0.3rem;
}
.mat-stock-led {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
  box-shadow: 0 0 5px currentColor;
}
.mat-stock-led--ok     { background: #22c55e; color: #22c55e; }
.mat-stock-led--low    { background: #f59e0b; color: #f59e0b; }
.mat-stock-led--out    { background: #ef4444; color: #ef4444; }
.mat-stock-led--reorder{ background: #3b82f6; color: #3b82f6; }
.btn-del-mat {
  width: 1.65rem; height: 1.65rem; border: none; background: none;
  border-radius: 7px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s, color 0.15s;
}
.btn-del-mat:hover { background: #fff5f5; color: #e53e3e; }

/* Col Frais Fixes — scrollable inner */
.settings-v3-col-inner {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 0.9rem 1rem;
  display: flex; flex-direction: column; gap: 0.85rem;
}

/* Col Simulateur */
.settings-v3-col--sim { padding: 0.85rem; overflow-y: auto; }
.settings-section { display: flex; flex-direction: column; gap: 0.45rem; }
.settings-section-title {
  font-size: 0.62rem; font-weight: 800; color: #7c3aed;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}
.settings-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.45rem 0.75rem;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 9px;
}
.settings-label { font-size: 0.78rem; font-weight: 700; color: #1b2f39; flex: 1; min-width: 0; }
.settings-input-wrap { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
.settings-input {
  width: 72px; border: 1.5px solid #e2e8f0; border-radius: 7px;
  padding: 0.3rem 0.5rem; font-size: 0.82rem; font-weight: 700;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; text-align: right; transition: border-color 0.2s;
}
.settings-input:focus { border-color: #7c3aed; }
.settings-unit { font-size: 0.7rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }
.settings-footer { padding-top: 0.25rem; margin-top: auto; }
.btn-save-settings {
  display: inline-flex; align-items: center; padding: 0.5rem 1.3rem;
  border: none; border-radius: 999px;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(124,58,237,0.3); transition: filter 0.2s ease;
}
.btn-save-settings:hover:not(:disabled) { filter: brightness(1.07); }
.btn-save-settings:disabled { opacity: 0.65; cursor: not-allowed; }

/* ── Catalogue : bouton sauvegarde icône seulement ── */
.btn-save-mat-icon {
  width: 38px; height: 38px; border-radius: 12px; border: none; flex-shrink: 0;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(124,58,237,0.30);
  transition: filter 0.18s ease, transform 0.18s ease;
}
.btn-save-mat-icon:hover:not(:disabled) { filter: brightness(1.1); transform: scale(1.06); }
.btn-save-mat-icon:disabled { opacity: 0.65; cursor: not-allowed; }

/* ── Simulateur — sélecteur matière avec indicateur visuel ── */
.sim-mat-select-wrap {
  display: flex; align-items: center; gap: 0.35rem;
}
.sim-mat-indicator {
  flex-shrink: 0;
}
.sim-mat-indicator--swatch {
  display: inline-block;
  width: 14px; height: 14px; border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.12);
}
.sim-mat-indicator--img {
  width: 20px; height: 20px; border-radius: 50%;
  object-fit: cover; border: 1px solid #e2e8f0;
}
.sim-select {
  flex: 1; width: 100%; border: 1.5px solid #e2e8f0; border-radius: 7px;
  padding: 0.28rem 1.6rem 0.28rem 0.5rem; font-size: 0.74rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none; cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a0aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.5rem center;
}
.sim-select:focus { border-color: #7c3aed; }

/* Badge coefficient difficulté */
.sim-coeff-badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.22rem 0.6rem; border-radius: 999px;
  background: #f0e6ff; border: 1px solid #d6bcfa;
  font-size: 0.7rem; align-self: flex-start;
}
.sim-coeff-text  { color: #718096; }
.sim-coeff-value { color: #7c3aed; font-size: 0.76rem; }

/* ── Simulateur de coût ── */
.sim-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
  display: flex; flex-direction: column;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: visible;
}
/* Dans la col simulateur, la carte suit son contenu — la colonne gère le scroll */
.sim-card--column {
  flex-shrink: 0;
}
.sim-card--column .sim-body {
  flex: none;
}
.sim-header {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.45rem 0.85rem; border-radius: 14px 14px 0 0;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
}
.sim-header-icon  { width: 0.8rem; height: 0.8rem; color: rgba(255,255,255,0.85); flex-shrink: 0; }
.sim-header-title { font-size: 0.68rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.07em; }
.sim-body { padding: 0.65rem 0.85rem; display: flex; flex-direction: column; gap: 0.55rem; }
.sim-subtitle { font-size: 0.72rem; color: #a0aec0; margin: 0; line-height: 1.4; }

.sim-inputs { display: flex; flex-direction: column; gap: 0.45rem; }
.sim-inline-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.sim-inline-row .sim-field { flex: 1; min-width: 0; }
.sim-field  { display: flex; flex-direction: column; gap: 0.18rem; }
.sim-field-label { font-size: 0.67rem; font-weight: 700; color: #4a5568; }
.sim-input-wrap  { display: flex; align-items: center; gap: 0.3rem; }
.sim-input {
  width: 68px; border: 1.5px solid #e2e8f0; border-radius: 7px;
  padding: 0.3rem 0.45rem; font-size: 0.82rem; font-weight: 700;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; text-align: right; transition: border-color 0.2s;
}
.sim-input--sm { width: 52px; }
.sim-input:focus { border-color: #7c3aed; }
.sim-unit { font-size: 0.68rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }
.sim-duration-row { display: flex; gap: 0.45rem; }

.sim-results {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 10px;
  overflow: hidden;
}
.sim-result-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.32rem 0.75rem; gap: 0.5rem;
}
.sim-result-row + .sim-result-row { border-top: 1px solid #f0f4f8; }
.sim-result-row--sub    { background: #fff; }
.sim-result-row--margin { background: #fef9ff; }
.sim-result-row--total  { background: linear-gradient(135deg, #f0e6ff 0%, #e8f4ff 100%); }
.sim-result-label { font-size: 0.73rem; font-weight: 600; color: #718096; }
.sim-result-value { font-size: 0.82rem; font-weight: 800; color: #1b2f39; white-space: nowrap; }
.sim-result-value--neutral { color: #4a5568; }
.sim-result-value--margin  { color: #7c3aed; }
.sim-result-value--total   { color: #2e9cab; font-size: 0.9rem; }
.sim-result-divider { height: 1px; background: #e2e8f0; }
.sim-disclaimer {
  font-size: 0.62rem; color: #a0aec0; margin: 0;
  text-align: center; font-style: italic;
}

/* ── btn-download-row (Sauvegardés) ── */
.btn-download-row {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-download-row:hover { background: #ebf8ff; color: #2e9cab; }

/* Responsive stats + paramètres */
@media (max-width: 900px) {
  /* Passe à 1 colonne : catalogue + droite empilés */
  .settings-v3-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow-y: auto;
  }
  .settings-v3-col { overflow: visible; }
  .settings-v3-col--catalog { max-height: 280px; border-right: none; border-bottom: 1px solid #e2e8f0; }
  .settings-v3-col--right   { min-height: 340px; border-top: none; }
  .settings-right-panel     { overflow-y: visible; }
}
@media (max-width: 760px) {
  .stat-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .settings-v3-col-header { flex-direction: column; align-items: flex-start; }
  .settings-top-actions { width: 100%; }
}
@media (max-width: 540px) {
  .stat-kpi-grid { grid-template-columns: 1fr 1fr; }
  .settings-v3-col-inner { padding: 0.75rem; }
  .settings-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .settings-input-wrap { width: 100%; }
  .settings-input { width: 100%; text-align: left; }
  .srt-btn { font-size: 0.68rem; padding: 0.5rem 0.35rem; }
}

/* ── Onglet Gestion Devis : split 2 colonnes ── */
.manage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  flex: 1; min-height: 0; overflow: hidden;
  border-top: 1px solid #f0f4f8;
}
.manage-col {
  display: flex; flex-direction: column;
  min-height: 0; overflow: hidden;
}
.manage-col--send { border-right: 1px solid #e2e8f0; }
.manage-col-header {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 1rem;
  background: #f7f9fc; border-bottom: 1px solid #f0f4f8;
  font-size: 0.65rem; font-weight: 800; color: #718096;
  text-transform: uppercase; letter-spacing: 0.06em;
  flex-shrink: 0;
}
.manage-col-icon { width: 0.78rem; height: 0.78rem; flex-shrink: 0; }
.manage-col-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1.3rem; height: 1.3rem;
  font-size: 0.65rem; font-weight: 800; color: #fff;
  background: #7c3aed; border-radius: 999px; padding: 0 0.35rem;
  margin-left: 0.25rem;
}
.manage-col-badge--teal { background: #2e9cab; }
.empty-state--compact { padding: 2rem 1.5rem; flex: 1; }

/* ── Simulateur 3 étapes — barre indicateur ── */
.sim-steps-bar {
  display: flex; align-items: center;
  padding: 0.55rem 0.85rem 0.3rem;
  gap: 0; flex-shrink: 0;
}
.sim-step-dot {
  width: 1.55rem; height: 1.55rem; border-radius: 50%;
  border: 2px solid #d6bcfa; background: #fff;
  color: #c4b5fd; font-size: 0.67rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: all 0.2s ease;
  font-family: inherit;
}
.sim-step-dot--active {
  border-color: #7c3aed; background: #7c3aed; color: #fff;
  box-shadow: 0 2px 8px rgba(124,58,237,0.35);
}
.sim-step-dot--done {
  border-color: #9f7aea; background: #f0e6ff; color: #7c3aed;
}
.sim-step-line {
  flex: 1; height: 2px; background: #e9d8fd; border-radius: 999px;
  margin: 0 0.15rem; transition: background 0.3s ease;
}
.sim-step-line--done { background: #9f7aea; }

/* Label de l'étape dans sim-body */
.sim-step-label {
  font-size: 0.62rem; font-weight: 800; color: #9f7aea;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}

/* Navigation Précédent / Suivant */
.sim-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.45rem 0.85rem 0.55rem;
  border-top: 1px solid #f0f4f8;
  flex-shrink: 0; gap: 0.5rem;
}
.sim-nav-btn {
  padding: 0.3rem 0.85rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #fff; color: #7c3aed; font-size: 0.73rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  white-space: nowrap;
}
.sim-nav-btn:hover { background: #f0e6ff; border-color: #9f7aea; }
.sim-nav-btn--next {
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  border-color: transparent; color: #fff;
  box-shadow: 0 3px 10px rgba(124,58,237,0.3);
}
.sim-nav-btn--next:hover { filter: brightness(1.07); background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%); }
.sim-nav-counter {
  font-size: 0.65rem; font-weight: 700; color: #a0aec0;
  flex: 1; text-align: center;
}

/* Variante sim-card pour le mode paginé (dans la col Paramètres) */
.sim-card--steps {
  flex: 1; min-height: 0; overflow: hidden;
  display: flex; flex-direction: column;
}
.sim-card--steps .sim-body { flex: 1; overflow-y: auto; }

/* Colonnes de l'onglet Paramètres */
.settings-v3-col--params {
  border-right: 1px solid #e2e8f0;
}
.settings-v3-col--sim2 {
  background: #fafbfd;
  padding: 0.85rem;
  overflow: hidden;
  display: flex; flex-direction: column;
}

/* Widget info catalogue dans Paramètres */
.settings-catalogue-count {
  font-size: 0.82rem; font-weight: 800; color: #7c3aed;
}
.settings-link-tab {
  border: none; background: none; color: #2e9cab;
  font-size: 0.65rem; font-weight: 700; cursor: pointer;
  font-family: inherit; padding: 0; text-decoration: underline;
  text-underline-offset: 2px; transition: color 0.15s;
}
.settings-link-tab:hover { color: #1f7f97; }

/* Table pleine largeur dans l'onglet Catalogue */
.mat-table-wrap--full {
  flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto;
  width: 100%;
}

.ecf-divider { height: 1px; background: #f0f4f8; margin: 0.1rem 0; flex-shrink: 0; }

.attach-drop {
  border: 2px dashed #e2e8f0; border-radius: 10px;
  padding: 0.85rem 1rem; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem;
  text-align: center; position: relative;
  transition: border-color 0.2s, background 0.2s;
  min-height: 4rem;
}
.attach-drop:hover { border-color: #2e9cab; background: #f0fafa; }
.attach-drop--over { border-color: #2e9cab; background: #e8f7f9; border-style: solid; }
.attach-hint { font-size: 0.78rem; font-weight: 700; color: #4a5568; margin: 0; }
.attach-sub  { font-size: 0.67rem; color: #a0aec0; }
.attach-filename { font-size: 0.75rem; font-weight: 600; color: #2e9cab; margin: 0; padding: 0 1.5rem; word-break: break-all; }
.attach-clear {
  position: absolute; top: 0.3rem; right: 0.3rem;
  width: 1.35rem; height: 1.35rem; border-radius: 50%;
  border: none; background: #e2e8f0; color: #718096;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit; line-height: 1; padding: 0;
  transition: background 0.15s, color 0.15s;
}
.attach-clear:hover { background: #feb2b2; color: #c53030; }

/* ── Reversal no-scroll ≤1023px ── */
@media (max-width: 1023px) {
  .admin-banner { height: 4rem; }
  .admin-page {
    height: auto;
    min-height: calc(100dvh - 4.5rem);
    overflow: visible;
    padding-bottom: 3rem;
  }
  .panel-card  { flex: none; overflow: visible; }
  .table-wrap  { flex: none; min-height: auto; overflow-y: visible; }
  .email-grid  { flex: none; min-height: auto; overflow: visible; }
  .email-col   { min-height: auto; overflow: visible; }
  .email-col-body    { flex: none; overflow-y: visible; }
  .email-col-footer  { flex-shrink: unset; }
  .email-col3-grid   { flex: none; min-height: auto; overflow: visible; }
  .email-col3-text   { overflow-y: visible; }
  .email-col3-attach { overflow-y: visible; }
  .email-panel-footer { flex-shrink: unset; }
  .send-list      { flex: none; overflow-y: visible; }
  .empty-state    { flex: none; }
  .manage-grid    { flex: none; min-height: auto; overflow: visible; }
  .manage-col     { overflow: visible; }
  .sim-card--steps { flex: none; overflow: visible; }
  .sim-card--steps .sim-body { flex: none; overflow-y: visible; }
  .settings-v3-grid  { flex: none; min-height: auto; overflow: visible; }
  .settings-v3-col   { overflow: visible; }
  .settings-v3-col-inner { overflow-y: visible; }
  .stats-panel    { flex: none; overflow-y: visible; }
  /* Onglets : 2 rangées centrées sur tablette */
  .tabs-bar { flex-wrap: wrap; justify-content: center; }
}

/* ── Tablette paysage (761px–1023px) : layout identique au desktop ──
   Panel remplit la hauteur restante, table scrolle en interne.        */
@media (min-width: 761px) and (max-width: 1023px) {
  .admin-page {
    height: calc(100dvh - 4.5rem);
    overflow: hidden;
    padding-bottom: 1rem;
  }
  .panel-card     { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .table-wrap     { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
  .mat-table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
  .mat-table-wrap--full { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .email-grid     { flex: 1; min-height: 0; overflow: hidden; }
  .email-col      { min-height: 0; overflow: hidden; }
  .email-col-body { flex: 1; overflow-y: auto; }
  .send-list      { flex: 1; min-height: 0; overflow-y: auto; }
  .manage-grid    { flex: 1; min-height: 0; overflow: hidden; }
  .settings-v3-grid  { flex: 1; min-height: 0; overflow: hidden; }
  .stats-panel    { flex: 1; overflow-y: auto; }
}

/* ── Mobile (≤760px) : stats 2 colonnes, tout en haut ── */
@media (max-width: 760px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

/* ── Responsive ── */
@media (max-width: 760px) {
  .th-hide-md, .td-hide-md { display: none; }
  /* Mobile : scroll horizontal, scrollbar invisible, fade à droite */
  .tabs-bar {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    padding-bottom: 0.25rem;
    -webkit-mask-image: linear-gradient(to right, black 82%, transparent 100%);
    mask-image: linear-gradient(to right, black 82%, transparent 100%);
  }
  .tabs-bar::-webkit-scrollbar { display: none; }
  .tab-btn  { white-space: nowrap; flex-shrink: 0; }
  .email-grid { grid-template-columns: 1fr; }
  .email-col  { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .email-col:last-child { border-bottom: none; }
  .email-col3-grid { grid-template-columns: 1fr; }
  .email-col3-text { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .email-grid { grid-template-columns: 1fr; }
  .email-col--config, .email-col--compose { border-bottom: 1px solid #f0f4f8; border-right: none; }
  .send-card { flex-direction: column; align-items: flex-start; gap: 0.65rem; }
  .send-card-total { margin-left: 0; }
  .manage-grid { grid-template-columns: 1fr; }
  .manage-col--send { border-right: none; border-bottom: 1px solid #e2e8f0; }
}
@media (max-width: 540px) {
  .admin-page { padding: 1rem 0.75rem 2rem; }
  .admin-banner { height: 3.5rem; margin: -1rem -0.75rem 0; } /* match 540px padding */
  .admin-hero { margin-top: -1.1rem; }
  .stats-row  { grid-template-columns: repeat(2, 1fr); }
  .admin-title { font-size: 1.1rem; }
  .admin-hero { flex-direction: column; align-items: flex-start; }
  .admin-hero-actions { width: 100%; }
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
  .email-header-actions { width: 100%; margin-left: 0; }
  .th-hide-sm, .td-hide-sm { display: none; }
  .btn-save-email, .btn-test-email { flex: 1; justify-content: center; }
  .email-panel-footer { flex-wrap: wrap; }
  .pagination { gap: 0.35rem; }
  .page-numbers { display: none; }
}

/* ── Mobile ≤640px : burger menu + masquage colonnes catalogue ── */
@media (max-width: 640px) {
  .tabs-burger { display: block; }
  .tabs-bar    { display: none; }
  .mat-hide-sm { display: none; }
  /* Colonnes plus étroites sur mobile pour limiter le scroll (table-layout:fixed = th contrôle) */
  .mat-table        { min-width: 390px; }
  .mat-th--color    { width: 60px; }
  .mat-th--name     { width: 115px; }
  .mat-th--num.mat-th--kg { width: 42px; }
  .mat-th--restant  { width: 58px; }
  .mat-th--stock    { width: 82px; }
  .mat-th--action   { width: 28px; }
  /* Gradient fade → indique qu'il y a du contenu à droite */
  .mat-table-wrap--full {
    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
    mask-image: linear-gradient(to right, black 85%, transparent 100%);
  }
}

/* ── Paramètres — layout 1 colonne paginé ── */
.settings-single-col {
  padding: 1rem 1.25rem;
  display: flex; flex-direction: column; gap: 0.85rem;
  overflow-y: auto; flex: 1;
}
.settings-single-col--sim {
  padding: 0.85rem 1.25rem;
  background: #fafbfd;
  gap: 0.65rem;
}
.settings-single-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; flex-wrap: wrap;
  border-top: 1px solid #f0f4f8; padding-top: 0.85rem; margin-top: auto;
}
.btn-settings-next {
  display: inline-flex; align-items: center;
  padding: 0.5rem 1.3rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #f7f0ff; color: #7c3aed;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.18s ease;
  margin-left: auto;
}
.btn-settings-next:hover { background: #ede9fe; border-color: #9f7aea; box-shadow: 0 2px 8px rgba(124,58,237,0.18); }
.btn-settings-prev {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.38rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  align-self: flex-start;
}
.btn-settings-prev:hover { background: #f7f9fc; border-color: #cbd5e0; color: #4a5568; }

/* Page indicator dots in panel-header */
.settings-page-indicator { display: flex; align-items: center; gap: 0.45rem; }
.spi-dot {
  width: 0.55rem; height: 0.55rem; border-radius: 50%;
  background: #e2e8f0; cursor: pointer; transition: all 0.2s ease;
}
.spi-dot--active { background: #7c3aed; transform: scale(1.25); }

/* Texte intro inline dans paramètres */
.settings-intro-inline { font-size: 0.73rem; color: #a0aec0; margin: 0; }

/* Simulateur pleine largeur (page 2 Paramètres) */
.sim-card--wide {
  flex: 1; min-height: 0; overflow: visible;
  display: flex; flex-direction: column;
}
.sim-body--wide { padding: 0.75rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.65rem; }
.sim-wide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.sim-results--wide { max-width: 520px; }
.sim-input--lg { width: 90px; }

@media (max-width: 640px) {
  .sim-wide-grid { grid-template-columns: 1fr; }
  .settings-single-footer { flex-direction: column; align-items: stretch; }
  .btn-settings-next { margin-left: 0; justify-content: center; }
}

/* ── Paramètres — Desktop (≥ 1025px) : grande carte unique (même architecture que le Simulateur) ── */
@media (min-width: 1025px) {
  /* Container : flex-colonne avec padding, pas de grid */
  .settings-single-col {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 0;
    overflow: hidden;
  }

  /* Grande carte englobante — flex:1 = remplit tout l'espace (exactement comme sim-card--wide) */
  .settings-main-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #e8edf3;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  /* En-tête violet — miroir exact de sim-header */
  .settings-card-hdr {
    display: flex; align-items: center; gap: 0.45rem;
    padding: 0.45rem 1.25rem; flex-shrink: 0;
    background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
    border-radius: 20px 20px 0 0;
  }
  .settings-card-hdr-icon  { width: 0.8rem; height: 0.8rem; color: rgba(255,255,255,0.85); flex-shrink: 0; }
  .settings-card-hdr-title { font-size: 0.68rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.07em; }

  /* Corps scrollable de la grande carte — flex:1 absorbe tout l'espace, scrolle si besoin */
  .settings-card-body {
    flex: 1; min-height: 0;
    display: flex; flex-direction: column;
    overflow-y: auto;
  }

  /* Grille 2 colonnes intérieure — flex-shrink:0, la settings-card-body scrolle si besoin */
  .settings-params-grid {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1.25rem;
  }

  /* Sous-cartes Machine & Marge : légèrement grisées pour contraster avec la carte blanche */
  .settings-params-grid .settings-section {
    background: #f7f9fc;
    border: 1px solid #f0f4f8;
    border-radius: 14px;
    padding: 1.25rem;
    gap: 0.65rem;
  }
  .settings-params-grid .settings-section-title {
    font-size: 0.65rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #f0e6ff;
    margin-bottom: 0.1rem;
  }
  .settings-params-grid .settings-row {
    background: #fff;
    border-color: #e8edf3;
    border-radius: 10px;
  }

  /* Bannière Catalogue : barre horizontale en bas de la grille, ancrée dans la carte */
  .settings-section--wide {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid #f0f4f8;
    background: #fafbfd;
    border-radius: 0;
    flex-shrink: 0;
  }
  .settings-section--wide .settings-section-title {
    padding-bottom: 0;
    border-bottom: none;
    margin-bottom: 0;
  }
  .settings-section--wide .settings-row {
    flex: 1;
    min-width: 200px;
    background: transparent;
    border: none;
    padding: 0;
  }
  .settings-section--wide .settings-intro-inline {
    flex-shrink: 0;
    padding: 0 !important;
  }

  /* Footer : ancré en bas de la grande carte, boutons à droite */
  .settings-single-footer {
    justify-content: flex-end;
    margin-top: 0;
    padding: 0.85rem 1.25rem;
    border-top: 1px solid #f0e6ff;
    flex-shrink: 0;
  }

  /* Boutons : largeur naturelle */
  .btn-save-settings {
    padding: 0.65rem 2.25rem;
    font-size: 0.85rem;
  }
  .btn-settings-next {
    margin-left: 0;
    padding: 0.65rem 1.5rem;
    font-size: 0.85rem;
  }
}

/* ── Onglet Gestion Devis — page 2 (send) ── */
.manage-single-col {
  padding: 0.85rem 1.25rem 1rem;
  display: flex; flex-direction: column; gap: 0.85rem;
  overflow-y: auto; flex: 1;
}
.btn-manage-transmit {
  display: inline-flex; align-items: center;
  padding: 0.42rem 1rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #f7f0ff; color: #7c3aed;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  white-space: nowrap;
}
.btn-manage-transmit:hover { background: #ede9fe; border-color: #9f7aea; }
.btn-manage-prev {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.38rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  align-self: flex-start;
}
.btn-manage-prev:hover { background: #f7f9fc; border-color: #cbd5e0; color: #4a5568; }
/* Ligne sendable : légère teinte verte pour les devis prêts à l'envoi */
.tr--sendable { background: #f0fff8; }
.tr--sendable:hover { background: #e6fff3; }
/* Card envoi */
.manage-send-card {
  background: #fafbfd; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 1rem;
  flex: 1;
}
.manage-send-section { display: flex; flex-direction: column; gap: 0.45rem; }
.manage-send-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; font-weight: 800; color: #7c3aed;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}
.manage-send-label-icon { width: 0.75rem; height: 0.75rem; }
.manage-preview-block { border-radius: 10px; }
.manage-send-actions {
  display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;
  padding-top: 0.25rem; margin-top: auto;
}
.stripe-link-row { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f0f4f8; }
.stripe-link-label { font-size: 0.75rem; font-weight: 700; color: #4a5568; display: block; margin-bottom: 0.35rem; }
.stripe-link-wrap { display: flex; gap: 0.4rem; align-items: center; }
.stripe-link-input {
  flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.3rem 0.6rem; font-size: 0.78rem; font-family: inherit;
  outline: none; transition: border-color 0.2s;
}
.stripe-link-input:focus { border-color: #7c3aed; }
.stripe-copy-btn {
  padding: 0.3rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 0.9rem; transition: background 0.15s;
}
.stripe-copy-btn:hover { background: #f0e6ff; border-color: #9f7aea; }
.stripe-link-hint { font-size: 0.7rem; color: #a0aec0; margin: 0.3rem 0 0; }
.stripe-link-hint a { color: #7c3aed; }
.manage-empty-send { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 0.5rem; flex: 1; }
.manage-empty-icon { width: 2.2rem; height: 2.2rem; color: #cbd5e0; }

/* ── Onglet Emails — colonne unique 3 étapes ── */
.email-steps-bar {
  padding: 0; flex: 0 0 auto; min-width: 130px;
}
.email-single-col {
  padding: 0.9rem 1.25rem 0.75rem;
  display: flex; flex-direction: column; gap: 0.85rem;
  overflow-y: auto; flex: 1;
}
.email-step-section {
  display: flex; flex-direction: column; gap: 0.45rem;
  background: #fff; border: 1px solid #f0f4f8; border-radius: 12px;
  padding: 0.85rem 1rem;
}
.email-step-footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.65rem; flex-wrap: wrap; flex-shrink: 0;
  border-top: 1px solid #f0f4f8; padding-top: 0.75rem; margin-top: auto;
}
.email-step-actions {
  display: flex; align-items: center; gap: 0.5rem; margin-left: auto;
}
.btn-email-next {
  display: inline-flex; align-items: center;
  padding: 0.5rem 1.3rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #f7f0ff; color: #7c3aed;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.18s ease;
  margin-left: auto;
}
.btn-email-next:hover { background: #ede9fe; border-color: #9f7aea; box-shadow: 0 2px 8px rgba(124,58,237,0.18); }
.btn-email-prev {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.38rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.btn-email-prev:hover { background: #f7f9fc; border-color: #cbd5e0; color: #4a5568; }
.ecf-textarea--lg { min-height: 100px; resize: vertical; }
.email-empty-step {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.5rem 1rem; gap: 0.4rem; text-align: center;
}
/* Responsive email / manage */
@media (max-width: 640px) {
  .email-step-footer { flex-direction: column; align-items: stretch; }
  .btn-email-next  { margin-left: 0; justify-content: center; }
  .email-step-actions { width: 100%; justify-content: flex-end; }
  .manage-send-actions { flex-direction: column; }
}

/* ── Catalogue : pagination ── */
.mat-pagination {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.6rem 1rem; border-top: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.mat-page-numbers { display: flex; gap: 0.25rem; }
.page-btn {
  padding: 0.28rem 0.7rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.page-btn:hover:not(:disabled) { background: #f0e6ff; border-color: #9f7aea; color: #7c3aed; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-num {
  width: 1.6rem; height: 1.6rem; border-radius: 6px; border: 1.5px solid #e2e8f0;
  background: #fff; color: #718096;
  font-size: 0.73rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
  display: flex; align-items: center; justify-content: center;
}
.page-num:hover { background: #f0e6ff; border-color: #9f7aea; color: #7c3aed; }
.page-num--active { background: #7c3aed; border-color: #7c3aed; color: #fff; }
.mat-page-info { font-size: 0.7rem; color: #a0aec0; font-weight: 700; margin-left: auto; }

/* ── Spinner upload ── */
@keyframes mat-spin { to { transform: rotate(360deg); } }
.mat-spinner {
  width: 0.65rem; height: 0.65rem; border-radius: 50%;
  border: 2px solid #e2e8f0; border-top-color: #2e9cab;
  animation: mat-spin 0.7s linear infinite; flex-shrink: 0; display: inline-block;
}
.mat-mode-btn--uploading { opacity: 0.7; cursor: not-allowed; }

/* ── Badge teal (état upload) ── */
.settings-loading-badge--teal { background: #e8f7f9; color: #2e9cab; border-color: #b2e8ef; }


/* ═══════════════════════════════════════════════════════════════════
   ONGLET "GESTION DEVIS" — Responsive
   ─────────────────────────────────────────────────────────────────
   Base  : tableau visible, cartes cachées
   ≤640px: cartes visibles, tableau caché
═══════════════════════════════════════════════════════════════════ */

/* Visibilité par défaut */
.quotes-table-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.quotes-cards-view { display: none; }

/* Pagination compacte (remplace les boutons numérotés) */
.quotes-pgn { gap: 0.55rem; }
.quotes-pgn .page-numbers { display: none; }
.quotes-pgn-info {
  font-size: 0.78rem;
  font-weight: 600;
  color: #718096;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}

/* ── Mobile (≤ 640 px) : Card Layout devis ── */
@media (max-width: 640px) {
  .quotes-table-view { display: none; }
  .quotes-cards-view {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.85rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  /* Carte individuelle */
  .qcard {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }

  /* Ligne 1 : client + statut */
  .qcard-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .qcard-client {
    font-size: 0.95rem;
    font-weight: 800;
    color: #1b2f39;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-align: left;
    font-family: inherit;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s;
  }
  .qcard-client:hover { color: #7c3aed; }
  .qcard-badge { flex-shrink: 0; font-size: 0.65rem; }

  /* Ligne 2 : pièce + numéro */
  .qcard-meta { display: flex; flex-direction: column; gap: 0.12rem; }
  .qcard-piece { font-size: 0.88rem; font-weight: 700; color: #2d3748; margin: 0; }
  .qcard-sub {
    font-size: 0.72rem; color: #a0aec0; margin: 0;
    display: flex; align-items: center; gap: 0.4rem;
  }

  /* Ligne 3 : date + total */
  .qcard-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.3rem;
    border-top: 1px solid #f0f4f8;
  }
  .qcard-date  { font-size: 0.75rem; color: #718096; }
  .qcard-total { font-size: 1.05rem; font-weight: 800; color: #1b2f39; }

  /* Ligne 4 : statut select + actions */
  .qcard-bottom { display: flex; align-items: center; gap: 0.5rem; }
  .qcard-status-sel { flex: 1; font-size: 0.78rem; }
  .qcard-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }
  .qcard-actions .btn-edit,
  .qcard-actions .btn-pdf,
  .qcard-actions .btn-send-row,
  .qcard-actions .btn-del {
    width: 34px;
    height: 34px;
  }
}

/* ── Tablette (641 px – 1024 px) : scroll horizontal devis ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .quotes-table-view .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .data-table { font-size: 0.85rem; }
}


/* ═══════════════════════════════════════════════════════════════════
   ONGLET "PARAMÈTRES" — Responsive
   ─────────────────────────────────────────────────────────────────
   Desktop  : centré avec max-width pour éviter les inputs géants
   Tablette : grille 2 colonnes pour les sections
   Mobile   : tout empilé, gap confortable (1rem)
═══════════════════════════════════════════════════════════════════ */

/* Desktop (≥ 1025 px) : limiter la largeur des inputs */
@media (min-width: 1025px) {
  .settings-single-col {
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
  }
  .settings-single-col--sim { max-width: none; margin: 0; }
}

/* Tablette (641 px – 1024 px) : grille 2 colonnes pour les sections */
@media (min-width: 641px) and (max-width: 1024px) {
  .settings-single-col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    align-content: start;
  }
  /* Le simulateur reste en colonne simple */
  .settings-single-col--sim {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
  /* Footer → pleine largeur de la grille */
  .settings-single-col .settings-single-footer {
    grid-column: 1 / -1;
    margin-top: 0;
  }
}

/* Mobile (≤ 640 px) : inputs empilés, grand gap */
@media (max-width: 640px) {
  .settings-single-col { padding: 0.85rem; gap: 1rem; }
  .settings-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .settings-input-wrap { align-self: flex-start; }
  .settings-input { width: 110px; text-align: right; }
  .settings-single-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }
  .btn-settings-next { margin-left: 0; justify-content: center; }
}

/* ═══════════════════════════════════════════════════════════════════
   ONGLET "GESTION DEVIS" page 1 (Devis sauvegardés) — Responsive
   ≥ 1025px     : tableau pleine largeur
   641 – 1024px : grille 2 colonnes de cartes (.mtcard)
   ≤ 640px      : cartes verticales empilées (.mcard)
═══════════════════════════════════════════════════════════════════ */

/* Visibilité par défaut (desktop ≥1025px : tableau) */
.manage-table-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.manage-tab-grid   { display: none; }
.manage-cards-view { display: none; }

/* Tableau desktop : pleine largeur, colonnes auto */
.manage-table-view .data-table {
  table-layout: auto;
  width: 100%;
  min-width: 0;
  font-size: 0.9rem;
}

/* Pagination compacte (partagée par les 3 vues) */
.manage-pgn { gap: 0.55rem; }
.manage-pgn .page-numbers { display: none; }
.manage-pgn-info {
  font-size: 0.78rem;
  font-weight: 600;
  color: #718096;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}

/* ── Tablette (641px – 1024px) : Grille 2 colonnes de cartes ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .manage-table-view { display: none; }
  .manage-tab-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1rem 1.25rem;
    overflow-y: auto;
    align-content: start;
  }
  .manage-tab-pgn { grid-column: 1 / -1; margin-top: 0.25rem; }

  .mtcard {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .mtcard-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .mtcard-client {
    font-size: 1rem;
    font-weight: 800;
    color: #1b2f39;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mtcard-badge { flex-shrink: 0; font-size: 0.7rem; }

  .mtcard-body { display: flex; flex-direction: column; gap: 0.5rem; }
  .mtcard-field { display: flex; flex-direction: column; gap: 0.1rem; }
  .mtcard-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
  .mtcard-label {
    font-size: 0.62rem;
    font-weight: 700;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .mtcard-value { font-size: 0.9rem; font-weight: 700; color: #2d3748; }
  .mtcard-value--mono {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #718096;
  }
  .mtcard-total {
    font-size: 1.25rem;
    font-weight: 800;
    color: #7c3aed;
    padding-top: 0.35rem;
    border-top: 1px solid #f0f4f8;
  }

  .mtcard-foot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.25rem;
    border-top: 1px solid #f0f4f8;
  }
  .mtcard-status-sel { flex: 1; font-size: 0.82rem; }
  .mtcard-btns { display: flex; gap: 0.3rem; flex-shrink: 0; }
  .mtcard-btns .btn-edit,
  .mtcard-btns .btn-pdf,
  .mtcard-btns .btn-send-row,
  .mtcard-btns .btn-del { width: 38px; height: 38px; border-radius: 10px; }
}

/* ── Mobile (≤ 640px) : cartes verticales empilées ── */
@media (max-width: 640px) {
  .manage-table-view { display: none; }
  .manage-cards-view {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.85rem;
    overflow-y: auto;
    flex: 1;
  }

  .mcard {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }

  .mcard-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .mcard-client {
    font-size: 0.95rem;
    font-weight: 800;
    color: #1b2f39;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mcard-badge { flex-shrink: 0; font-size: 0.65rem; }

  .mcard-meta { display: flex; flex-direction: column; gap: 0.12rem; }
  .mcard-piece { font-size: 0.88rem; font-weight: 700; color: #2d3748; margin: 0; }
  .mcard-sub   { font-size: 0.72rem; color: #a0aec0; margin: 0; }

  .mcard-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.3rem;
    border-top: 1px solid #f0f4f8;
  }
  .mcard-date  { font-size: 0.75rem; color: #718096; }
  .mcard-total { font-size: 1.05rem; font-weight: 800; color: #2e9cab; }

  .mcard-bottom { display: flex; align-items: center; gap: 0.5rem; }
  .mcard-status-sel { flex: 1; font-size: 0.78rem; }
  .mcard-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }
  .mcard-actions .btn-edit,
  .mcard-actions .btn-pdf,
  .mcard-actions .btn-send-row,
  .mcard-actions .btn-del { width: 34px; height: 34px; }
}
</style>
