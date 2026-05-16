-- Table singleton pour les paramètres d'envoi d'email
-- Une seule ligne possible (CHECK id = 1), insérée ici avec les valeurs par défaut

CREATE TABLE IF NOT EXISTS public.email_settings (
  id              int  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sender_name     text NOT NULL DEFAULT 'BambuCalc',
  reply_to        text NOT NULL DEFAULT '',
  email_intro_client text NOT NULL DEFAULT '',
  notif_new_quote     boolean NOT NULL DEFAULT true,
  notif_accepted      boolean NOT NULL DEFAULT true,
  notif_client_confirm boolean NOT NULL DEFAULT true,
  notif_status_change  boolean NOT NULL DEFAULT true,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Ligne initiale avec les valeurs par défaut
INSERT INTO public.email_settings DEFAULT VALUES
ON CONFLICT (id) DO NOTHING;

-- RLS : seuls les admins peuvent lire et modifier
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_email_settings" ON public.email_settings
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "admin_update_email_settings" ON public.email_settings
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
