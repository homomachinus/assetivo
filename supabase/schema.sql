create extension if not exists pgcrypto;

drop table if exists public.home_collections cascade;
drop table if exists public.products cascade;

create table if not exists public.product_lines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.product_lines(id) on delete restrict,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (line_id, name)
);

create table if not exists public.variant_types (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.product_categories(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

create table if not exists public.variant_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references public.product_lines(id) on delete restrict,
  category_id uuid not null references public.product_categories(id) on delete restrict,
  variant_type_id uuid not null references public.variant_types(id) on delete restrict,
  variant_color_id uuid not null references public.variant_colors(id) on delete restrict,
  title text not null,
  description text,
  price integer not null,
  currency text not null default 'IDR',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_gateways (
  id integer primary key,
  name text not null,
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Insert default gateways if not exists
insert into public.payment_gateways (id, name, is_active)
values 
  (0, 'Midtrans', true),
  (1, 'Paymenku', false)
on conflict (id) do nothing;

create table if not exists public.home_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text,
  subtitle text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  amount integer not null,
  currency text not null default 'IDR',
  status text not null,
  provider text,
  method text,
  reference text,
  items jsonb,
  metadata jsonb,
  link_claimed boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists product_categories_line_id_idx
  on public.product_categories(line_id);

create index if not exists variant_types_category_id_idx
  on public.variant_types(category_id);

create index if not exists products_line_id_idx
  on public.products(line_id);

create index if not exists products_category_id_idx
  on public.products(category_id);

create index if not exists products_variant_type_id_idx
  on public.products(variant_type_id);

create index if not exists products_variant_color_id_idx
  on public.products(variant_color_id);

create index if not exists home_collections_active_idx
  on public.home_collections(is_active);

create index if not exists admin_users_email_idx
  on public.admin_users(email);

create index if not exists payment_history_status_idx
  on public.payment_history(status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_home_collections_updated_at
before update on public.home_collections
for each row execute function public.set_updated_at();

create trigger set_product_lines_updated_at
before update on public.product_lines
for each row execute function public.set_updated_at();

create trigger set_product_categories_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

create trigger set_variant_types_updated_at
before update on public.variant_types
for each row execute function public.set_updated_at();

create trigger set_variant_colors_updated_at
before update on public.variant_colors
for each row execute function public.set_updated_at();

create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create trigger set_payment_gateways_updated_at
before update on public.payment_gateways
for each row execute function public.set_updated_at();

alter table public.product_lines enable row level security;
alter table public.product_categories enable row level security;
alter table public.variant_types enable row level security;
alter table public.variant_colors enable row level security;
alter table public.products enable row level security;
alter table public.home_collections enable row level security;
alter table public.admin_users enable row level security;
alter table public.payment_history enable row level security;
alter table public.payment_gateways enable row level security;

create policy "public read product lines"
  on public.product_lines for select
  using (true);

create policy "public read product categories"
  on public.product_categories for select
  using (true);

create policy "public read variant types"
  on public.variant_types for select
  using (true);

create policy "public read variant colors"
  on public.variant_colors for select
  using (true);

create policy "public read products"
  on public.products for select
  using (true);

create policy "public read home collections"
  on public.home_collections for select
  using (true);

create policy "public insert payment history"
  on public.payment_history for insert
  with check (true);

create policy "public read payment history"
  on public.payment_history for select
  using (true);

create policy "public read payment gateways"
  on public.payment_gateways for select
  using (true);
