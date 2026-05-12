-- ══════════════════════════════════════════════
--  BambuCalc — Schéma PostgreSQL
-- ══════════════════════════════════════════════

-- ── 1. PROFILES ────────────────────────────────
-- Étend auth.users avec les infos du profil utilisateur
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Créer automatiquement un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. QUOTES ──────────────────────────────────
-- Stocke les devis du calculateur
create table if not exists public.quotes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- Infos projet
  project_name        text not null default 'Sans titre',
  print_profile       text default 'normal',
  printer_model       text default 'p2s-mono',
  nozzle_size         text default '0.4',

  -- Filament
  material            text default 'PLA',
  cost_per_kg         numeric(10,2) default 0,
  weight              numeric(10,2) default 0,  -- grammes

  -- Temps
  hours               integer default 0,
  minutes             integer default 0,
  work_time           numeric(10,2) default 0,  -- minutes

  -- Emballage & taxes
  packaging_cost      numeric(10,2) default 0,
  tax_rate            numeric(5,2) default 20,

  -- Production en série
  series_mode         boolean default false,
  series_settings     jsonb default '{
    "quantity": 10,
    "volumeDiscount": 5,
    "scrapRate": 2,
    "setupCost": 50,
    "prepTimeMinutes": 15,
    "changeMaterialMinutes": 10,
    "packagingCostUnit": 0.2,
    "productionDays": 7
  }'::jsonb,

  -- Tarification
  selected_pricing    text default 'standard',
  custom_margin       numeric(5,2) default 50,

  -- Résultats calculés (snapshot au moment de la sauvegarde)
  material_cost       numeric(10,2) default 0,
  equipment_cost      numeric(10,2) default 0,
  work_cost           numeric(10,2) default 0,
  total_cost          numeric(10,2) default 0,
  cost_per_unit       numeric(10,2) default 0,
  quantity            integer default 1,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ── 3. ROW LEVEL SECURITY ──────────────────────
-- Chaque utilisateur ne voit que ses propres données

alter table public.profiles enable row level security;
alter table public.quotes enable row level security;

-- Profiles : lecture et modification uniquement pour le propriétaire
create policy "profiles: lecture propriétaire"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: modification propriétaire"
  on public.profiles for update
  using (auth.uid() = id);

-- Quotes : CRUD uniquement pour le propriétaire
create policy "quotes: lecture propriétaire"
  on public.quotes for select
  using (auth.uid() = user_id);

create policy "quotes: insertion propriétaire"
  on public.quotes for insert
  with check (auth.uid() = user_id);

create policy "quotes: modification propriétaire"
  on public.quotes for update
  using (auth.uid() = user_id);

create policy "quotes: suppression propriétaire"
  on public.quotes for delete
  using (auth.uid() = user_id);

-- ── 4. INDEX ───────────────────────────────────
create index if not exists quotes_user_id_idx on public.quotes(user_id);
create index if not exists quotes_created_at_idx on public.quotes(created_at desc);
