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

create index if not exists recipes_owner_updated_idx on recipes(owner_id, updated_at desc);
create index if not exists share_links_token_idx on share_links(token);
create index if not exists soap_abacus_memberships_customer_idx on soap_abacus_memberships(stripe_customer_id);
create index if not exists user_ingredient_costs_user_idx on user_ingredient_costs(user_id, ingredient_id);
