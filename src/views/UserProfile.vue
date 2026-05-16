<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, ArrowLeft, Save } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import PasswordField from '../components/PasswordField.vue'
import ToastMessage from '../components/ToastMessage.vue'

const router = useRouter()

const toast        = ref(null)
const loading      = ref(true)
const saving       = ref(false)
const savingPwd    = ref(false)

// Données profil
const email        = ref('')
const firstName    = ref('')
const lastName     = ref('')

// Changement de mot de passe
const newPassword  = ref('')
const confirmPwd   = ref('')
const pwdError     = ref(null)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) { router.push('/login'); return }

  email.value = user.email || ''
  const meta  = user.user_metadata || {}
  const full  = meta.full_name || meta.name || ''
  const parts = full.split(' ')
  firstName.value = meta.first_name || parts[0] || ''
  lastName.value  = meta.last_name  || parts.slice(1).join(' ') || ''
  loading.value   = false
})

async function saveProfile() {
  saving.value = true
  const fullName = [firstName.value.trim(), lastName.value.trim()].filter(Boolean).join(' ')

  const { error: authErr } = await supabase.auth.updateUser({
    data: { full_name: fullName, first_name: firstName.value.trim(), last_name: lastName.value.trim() },
  })

  if (!authErr) {
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
  }

  saving.value = false
  if (authErr) {
    toast.value?.show('Erreur lors de la sauvegarde.', 'error')
  } else {
    toast.value?.show('Profil mis à jour !', 'success')
  }
}

async function savePassword() {
  pwdError.value = null
  if (newPassword.value.length < 8) {
    pwdError.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (newPassword.value !== confirmPwd.value) {
    pwdError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  savingPwd.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  savingPwd.value = false
  if (error) {
    pwdError.value = error.message || 'Erreur lors du changement de mot de passe.'
  } else {
    newPassword.value = ''
    confirmPwd.value  = ''
    toast.value?.show('Mot de passe modifié !', 'success')
  }
}
</script>

<template>
  <div class="profile-page">
    <ToastMessage ref="toast" />

    <div class="profile-card">

      <!-- Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <User class="profile-avatar-icon" />
        </div>
        <div>
          <p class="profile-eyebrow">Mon compte</p>
          <h1 class="profile-title">Mon profil</h1>
        </div>
      </div>

      <button class="btn-back" @click="router.back()">
        <ArrowLeft class="btn-back-icon" /> Retour
      </button>

      <div v-if="loading" class="profile-loading">
        <div class="spinner" />
        <p>Chargement…</p>
      </div>

      <template v-else>

        <!-- ── Section identité ── -->
        <section class="profile-section">
          <h2 class="section-title">Identité</h2>

          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Prénom</label>
              <input class="field-input" v-model="firstName" placeholder="Jean" />
            </div>
            <div class="field-group">
              <label class="field-label">Nom</label>
              <input class="field-input" v-model="lastName" placeholder="Dupont" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Email</label>
            <input class="field-input field-input--disabled" :value="email" disabled />
            <p class="field-hint">L'email ne peut pas être modifié ici.</p>
          </div>

          <button class="btn-save" @click="saveProfile" :disabled="saving">
            <Save class="btn-save-icon" />
            {{ saving ? 'Sauvegarde…' : 'Sauvegarder le profil' }}
          </button>
        </section>

        <div class="section-sep" />

        <!-- ── Section mot de passe ── -->
        <section class="profile-section">
          <h2 class="section-title">Changer le mot de passe</h2>

          <PasswordField
            id="new-pwd"
            label="Nouveau mot de passe"
            :show-strength="true"
            v-model="newPassword"
          />

          <div class="pwd-gap">
            <PasswordField
              id="confirm-pwd"
              label="Confirmer le mot de passe"
              v-model="confirmPwd"
            />
          </div>

          <p v-if="pwdError" class="field-error">{{ pwdError }}</p>

          <button class="btn-save btn-save--outline" @click="savePassword" :disabled="savingPwd">
            {{ savingPwd ? 'Enregistrement…' : 'Changer le mot de passe' }}
          </button>
        </section>

      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100dvh;
  background: #f0f4f8;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2.5rem 1rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

.profile-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 540px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}
.profile-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  flex-shrink: 0;
}
.profile-avatar-icon { width: 1.3rem; height: 1.3rem; color: #fff; }
.profile-eyebrow {
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #2e9cab; margin: 0 0 0.1rem;
}
.profile-title { font-size: 1.35rem; font-weight: 800; color: #1b2f39; margin: 0; letter-spacing: -0.02em; }

/* Back */
.btn-back {
  display: inline-flex; align-items: center; gap: 0.3rem;
  margin-top: 1.25rem; margin-bottom: 1.75rem;
  padding: 0.4rem 1rem; border-radius: 999px;
  border: 1.5px solid #e2e8f0; background: transparent;
  color: #718096; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.btn-back:hover { border-color: #2e9cab; color: #2e9cab; }
.btn-back-icon { width: 0.9rem; height: 0.9rem; }

/* Loading */
.profile-loading {
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  padding: 2rem 0; color: #718096; font-size: 0.9rem;
}
.spinner {
  width: 1.6rem; height: 1.6rem;
  border: 3px solid #e2e8f0; border-top-color: #2e9cab;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Sections */
.profile-section { padding: 0; }
.section-title {
  font-size: 0.8rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.08em; color: #a0aec0; margin: 0 0 1.25rem;
}
.section-sep {
  height: 1px; background: #f0f4f8; margin: 1.75rem 0;
}

/* Fields */
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.field-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
.field-label { font-size: 0.82rem; font-weight: 600; color: #4a5568; }
.field-input {
  padding: 0.6rem 0.85rem; border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem; font-size: 0.9rem; color: #1b2f39;
  font-family: inherit; background: #fff; transition: border-color 0.2s;
  outline: none;
}
.field-input:focus { border-color: #2e9cab; }
.field-input--disabled { background: #f7f9fc; color: #a0aec0; cursor: not-allowed; }
.field-hint { font-size: 0.78rem; color: #a0aec0; margin: 0.2rem 0 0; }
.field-error {
  font-size: 0.83rem; color: #c0392b;
  background: rgba(220,53,69,0.07); border: 1px solid rgba(220,53,69,0.2);
  border-radius: 0.4rem; padding: 0.5rem 0.75rem; margin: 0.5rem 0 0;
}

/* Buttons */
.btn-save {
  display: inline-flex; align-items: center; gap: 0.4rem;
  margin-top: 1.25rem; padding: 0.65rem 1.5rem;
  border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.9rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 14px rgba(46,156,171,0.28);
  transition: filter 0.2s;
}
.btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { filter: brightness(1.07); }
.btn-save-icon { width: 0.95rem; height: 0.95rem; }

.btn-save--outline {
  background: transparent;
  border: 1.5px solid #2e9cab;
  color: #2e9cab;
  box-shadow: none;
}
.btn-save--outline:hover:not(:disabled) { background: #e8f7f9; filter: none; }

.pwd-gap { margin-top: 1rem; }
</style>
