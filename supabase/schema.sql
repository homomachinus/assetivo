create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  line text not null,
  category text not null,
  variant_type text not null,
  variant_color text not null,
  title text not null,
  description text,
  price integer not null,
  currency text not null default 'IDR',
  image_url text,
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
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists products_line_category_idx
  on public.products(line, category);

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

alter table public.products enable row level security;
alter table public.payment_history enable row level security;

create policy "public read products"
  on public.products for select
  using (true);

create policy "public insert payment history"
  on public.payment_history for insert
  with check (true);

create policy "public read payment history"
  on public.payment_history for select
  using (true);
