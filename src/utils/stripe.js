/**
 * src/utils/stripe.js — Utilitaire de chargement conditionnel Stripe
 *
 * RÈGLE DE SÉCURITÉ :
 *   Stripe.js ne doit être chargé QUE si l'utilisateur a explicitement accepté
 *   les cookies tiers (cookie_consent === 'all').
 *   Sans consentement, cette fonction retourne null et ne charge rien.
 *
 * Stripe.js est chargé via un import() dynamique asynchrone (code splitting)
 * ce qui évite que le script ne soit inclus dans le bundle principal.
 *
 * Usage :
 *   import { loadStripeConditionally } from '@/utils/stripe'
 *
 *   const stripe = await loadStripeConditionally()
 *   if (!stripe) {
 *     // Afficher un message demandant à l'utilisateur d'accepter les cookies
 *     return
 *   }
 *   // Utiliser stripe normalement…
 */

const STORAGE_KEY = 'cookie_consent'

/** Instance singleton — on ne crée qu'une seule instance Stripe par session */
let stripeInstance = null

/**
 * Charge et retourne l'instance Stripe SI et SEULEMENT SI
 * l'utilisateur a consenti aux cookies tiers (valeur 'all').
 *
 * @returns {Promise<import('@stripe/stripe-js').Stripe | null>}
 */
export async function loadStripeConditionally() {
  const consent = localStorage.getItem(STORAGE_KEY)

  if (consent !== 'all') {
    console.warn(
      '[Stripe] Chargement bloqué — consentement absent ou refusé.',
      'Valeur actuelle :', consent ?? 'null',
      '— Demandez à l\'utilisateur d\'accepter les cookies.'
    )
    return null
  }

  // Réutiliser l'instance existante si déjà chargée (singleton)
  if (stripeInstance) {
    console.log('[Stripe] Instance existante réutilisée')
    return stripeInstance
  }

  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

  if (!publicKey) {
    console.error(
      '[Stripe] VITE_STRIPE_PUBLIC_KEY manquante.',
      'Ajoutez-la dans .env.local (dev) et dans l\'UI Netlify (prod).'
    )
    return null
  }

  try {
    // Import dynamique — Stripe.js n'est pas inclus dans le bundle principal
    const { loadStripe } = await import('@stripe/stripe-js')
    stripeInstance = await loadStripe(publicKey)

    if (!stripeInstance) {
      console.error('[Stripe] loadStripe() a retourné null — clé publique invalide ?')
      return null
    }

    console.log('[Stripe] ✓ Instance chargée après consentement utilisateur')
    return stripeInstance

  } catch (err) {
    console.error('[Stripe] Erreur lors du chargement de @stripe/stripe-js :', err)
    return null
  }
}

/**
 * Réinitialise l'instance Stripe.
 * À appeler si l'utilisateur retire son consentement en cours de session.
 */
export function unloadStripe() {
  stripeInstance = null
  console.log('[Stripe] Instance déchargée — consentement retiré')
}

/**
 * Vérifie si l'utilisateur a donné son consentement pour Stripe.
 * Utile pour afficher conditionnellement le bouton "Payer".
 *
 * @returns {boolean}
 */
export function hasStripeConsent() {
  return localStorage.getItem(STORAGE_KEY) === 'all'
}
