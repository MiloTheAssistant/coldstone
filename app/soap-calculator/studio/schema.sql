create table if not exists recipes (
  id text primary key,
  owner_id text not null,
  name text not null,
  slug text not null,
  description text not null default '',
  mode text not null default 'easy',
  visibility text not null default 'private',
  current_version_id text,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipe_versions (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  version integer not null,
  previous_version_id text,
  editor_id text,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists recipe_ingredients (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  ingredient_type text not null,
  ingredient_id text not null,
  display_name text not null,
  percent numeric,
  weight numeric,
  unit text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists recipe_costs (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  ingredient_id text not null,
  supplier text,
  price_per_unit numeric not null default 0,
  unit_size numeric not null default 0,
  unit text not null default 'oz',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists recipe_fragrances (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  fragrance_id text not null,
  usage_percent numeric not null default 0,
  cost numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists pdf_exports (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  version_id text,
  owner_id text not null,
  file_url text,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists share_links (
  id text primary key,
  recipe_id text not null references recipes(id) on delete cascade,
  version_id text,
  token text not null unique,
  permission text not null default 'read',
  created_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create table if not exists soap_abacus_memberships (
  user_id text primary key,
  tier text not null default 'free',
  status text not null default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  trial_type text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  trial_used_at timestamptz,
  current_period_ends_at timestamptz,
  source text not null default 'app',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_ingredient_costs (
  id text primary key,
  user_id text not null,
  ingredient_id text not null,
  ingredient_type text not null default 'oil',
  supplier text,
  price_per_unit numeric not null default 0,
  unit_size numeric not null default 0,
  unit text not null default 'oz',
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ingredient_id)
);

create table if not exists recipe_publications (
  id text primary key,
  owner_id text not null,
  recipe_id text not null references recipes(id) on delete cascade,
  current_revision_id text,
  src_code text not null unique,
  status text not null default 'active',
  title text not null,
  slug text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipe_publication_revisions (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  recipe_id text not null references recipes(id) on delete cascade,
  recipe_version_id text not null,
  owner_id text not null,
  revision_number integer not null,
  revision_notes text not null default '',
  release_notes_public text not null default '',
  recipe_snapshot jsonb not null,
  ingredient_list_snapshot jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (publication_id, revision_number)
);

create table if not exists ingredient_list_codes (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  revision_id text not null references recipe_publication_revisions(id) on delete cascade,
  owner_id text not null,
  ilc_code text not null unique,
  ingredients jsonb not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists partner_export_events (
  id text primary key,
  publication_id text not null references recipe_publications(id) on delete cascade,
  revision_id text references recipe_publication_revisions(id) on delete set null,
  partner_key text not null,
  status text not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'recipe_publication_revisions_id_publication_id_key'
      and conrelid = 'recipe_publication_revisions'::regclass
  ) then
    alter table recipe_publication_revisions
      add constraint recipe_publication_revisions_id_publication_id_key
      unique (id, publication_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'recipe_publications_current_revision_publication_fk'
      and conrelid = 'recipe_publications'::regclass
  ) then
    alter table recipe_publications
      add constraint recipe_publications_current_revision_publication_fk
      foreign key (current_revision_id, id) references recipe_publication_revisions(id, publication_id)
      deferrable initially deferred;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredient_list_codes_revision_publication_fk'
      and conrelid = 'ingredient_list_codes'::regclass
  ) then
    alter table ingredient_list_codes
      add constraint ingredient_list_codes_revision_publication_fk
      foreign key (revision_id, publication_id) references recipe_publication_revisions(id, publication_id)
      on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'partner_export_events_revision_publication_fk'
      and conrelid = 'partner_export_events'::regclass
  ) then
    alter table partner_export_events
      add constraint partner_export_events_revision_publication_fk
      foreign key (revision_id, publication_id) references recipe_publication_revisions(id, publication_id)
      on delete set null (revision_id);
  end if;
end $$;

create index if not exists recipes_owner_updated_idx on recipes(owner_id, updated_at desc);
create index if not exists share_links_token_idx on share_links(token);
create index if not exists soap_abacus_memberships_customer_idx on soap_abacus_memberships(stripe_customer_id);
create index if not exists user_ingredient_costs_user_idx on user_ingredient_costs(user_id, ingredient_id);
create index if not exists recipe_publications_owner_updated_idx on recipe_publications(owner_id, updated_at desc);
create index if not exists recipe_publications_src_code_idx on recipe_publications(src_code);
create index if not exists recipe_publication_revisions_publication_idx on recipe_publication_revisions(publication_id, revision_number desc);
create index if not exists ingredient_list_codes_publication_idx on ingredient_list_codes(publication_id, revision_id);
create index if not exists partner_export_events_publication_idx on partner_export_events(publication_id, created_at desc);
