-- ══════════════════════════════════════════════════════════════════
--  BambuCalc — Migration : Colonnes Stripe sur la table quotes
--  Date     : 2026-05-19
--  Objectif : Stocker l'état du paiement et l'ID PaymentIntent Stripe
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Ajout des colonnes ────────────────────────────────────────────────────

alter table public.quotes
  add column if not exists payment_status text
    not null
    default 'pending'
    constraint quotes_payment_status_check
      check (payment_status in ('pending', 'processing', 'paid', 'failed', 'refunded')),

  add column if not exists stripe_payment_intent_id text
    unique; -- Un PaymentIntent ne peut appartenir qu'à un seul devis

-- ── 2. Index pour les performances ──────────────────────────────────────────

-- Le webhook Stripe va chercher le devis par son stripe_payment_intent_id
-- (lookup fréquent → index partiel sur les lignes non-nulles uniquement)
create index if not exists quotes_stripe_intent_idx
  on public.quotes (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Filtrer les devis par statut de paiement depuis le dashboard admin
create index if not exists quotes_payment_status_idx
  on public.quotes (payment_status);

-- ── 3. Documentation des colonnes ────────────────────────────────────────────

comment on column public.quotes.payment_status is
  'Statut du paiement Stripe — valeurs autorisées :
   pending    : Devis créé, aucun paiement initié
   processing : PaymentIntent créé côté Stripe, paiement en cours
   paid       : Paiement confirmé via le webhook payment_intent.succeeded
   failed     : Paiement échoué (carte refusée, fonds insuffisants…)
   refunded   : Remboursement effectué via charge.refunded';

comment on column public.quotes.stripe_payment_intent_id is
  'Identifiant unique du PaymentIntent Stripe (format : pi_xxxx…).
   Utilisé par le webhook pour retrouver et mettre à jour le devis.
   Contrainte UNIQUE : impossible d''associer deux devis au même paiement.';

-- ── 4. RLS — pas de modification nécessaire ──────────────────────────────────
-- La politique "quotes: modification propriétaire" existante couvre déjà
-- les nouvelles colonnes (elle s'applique à la ligne entière via auth.uid() = user_id).
-- Le webhook Stripe utilise la SERVICE_ROLE_KEY qui contourne le RLS — c'est voulu
-- et sécurisé car la SERVICE_ROLE_KEY ne sort jamais des Edge Functions.

-- Vérification rapide : lister les politiques actives sur quotes
-- select policyname, cmd from pg_policies where tablename = 'quotes';
