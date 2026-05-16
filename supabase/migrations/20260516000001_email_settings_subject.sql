-- Ajout du champ "sujet du mail" dans les paramètres d'envoi
ALTER TABLE public.email_settings
  ADD COLUMN IF NOT EXISTS email_subject text NOT NULL DEFAULT 'Votre devis BambuCalc — [numéro]';
