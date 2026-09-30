-- Watchlog : création de la table et des règles de sécurité.
-- À coller dans Supabase → SQL Editor, puis cliquer "Run".
-- ⚠️ Remplace les 4 fois 'TON-UID-ICI' par ton "User UID" (Authentication → Users).

-- 1) La table des titres
create table titles (
  id             uuid primary key default gen_random_uuid(), -- identifiant unique
  created_at     timestamptz not null default now(),         -- date d'ajout
  type           text not null check (type in ('serie', 'anime')),
  status         text not null default 'Pas commencé'
                 check (status in ('Pas commencé', 'En cours', 'Terminé')),
  title          text not null,
  poster         text,             -- adresse de l'affiche
  total_episodes integer,          -- vide si inconnu
  total_seasons  integer,
  season         integer not null default 1, -- ma progression
  episode        integer not null default 0,
  source         text not null check (source in ('tmdb', 'anilist')),
  source_id      text not null,    -- identifiant chez TMDB / AniList
  unique (source, source_id)       -- empêche d'ajouter deux fois le même titre
);

-- 1 bis) Autorisations de base sur la table (GRANT).
--    Visiteurs (anon) : lecture seulement.
--    Connectés (authenticated) : tout, mais les règles RLS ci-dessous
--    limitent l'écriture à mon compte uniquement.
grant select on table titles to anon;
grant select, insert, update, delete on table titles to authenticated;

-- 2) On active la sécurité par ligne (RLS) :
--    sans règle, plus personne ne peut rien faire.
alter table titles enable row level security;

-- 3) Tout le monde (visiteurs compris) peut LIRE la liste
create policy "Lecture publique"
  on titles for select
  to anon, authenticated
  using (true);

-- 4) Seul mon compte peut AJOUTER, MODIFIER et SUPPRIMER
create policy "Ajout par moi seulement"
  on titles for insert
  to authenticated
  with check (auth.uid() = 'ecef866b-3517-4d7d-affb-83f8af9db401');

create policy "Modification par moi seulement"
  on titles for update
  to authenticated
  using (auth.uid() = 'ecef866b-3517-4d7d-affb-83f8af9db401')
  with check (auth.uid() = 'ecef866b-3517-4d7d-affb-83f8af9db401');

create policy "Suppression par moi seulement"
  on titles for delete
  to authenticated
  using (auth.uid() = 'ecef866b-3517-4d7d-affb-83f8af9db401');

-- ============================================================
-- Réglages privés (ex. ma clé TMDB) : lisibles par MOI seulement.
-- La clé n'est jamais écrite dans ce fichier : on l'ajoute à part.
-- ============================================================

create table private_settings (
  name  text primary key, -- nom du réglage, ex. 'tmdb_api_key'
  value text not null
);

-- Pas de GRANT pour les visiteurs (anon) : ils n'y ont aucun accès
grant select on table private_settings to authenticated;

alter table private_settings enable row level security;

create policy "Lecture par moi seulement"
  on private_settings for select
  to authenticated
  using (auth.uid() = 'ecef866b-3517-4d7d-affb-83f8af9db401');

-- ============================================================
-- Étape 7 : nombre d'épisodes de chaque saison (pour la barre de progression)
-- ex. {10, 10, 8} = saison 1 : 10 épisodes, saison 2 : 10, saison 3 : 8
-- ============================================================

alter table titles add column if not exists season_episodes integer[];

-- Demande à Supabase de rafraîchir sa liste de colonnes
notify pgrst, 'reload schema';
