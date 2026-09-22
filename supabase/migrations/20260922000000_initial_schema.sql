create extension if not exists "pgcrypto";

create type public.product_status as enum ('draft', 'published', 'archived');
create type public.staff_role as enum ('owner', 'admin', 'editor');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  price_cents integer not null check (price_cents >= 0),
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents >= price_cents),
  short_description text,
  description text,
  sku text unique,
  inventory_quantity integer not null default 0 check (inventory_quantity >= 0),
  availability text not null default 'in_stock' check (availability in ('in_stock', 'sold_out', 'coming_soon')),
  is_featured boolean not null default false,
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.staff_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_index on public.products(status);
create index products_category_index on public.products(category_id);
create index product_images_product_index on public.product_images(product_id, sort_order);

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = auth.uid()
  );
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.staff_profiles enable row level security;

create policy "Anyone can view categories"
  on public.categories for select using (true);
create policy "Staff manage categories"
  on public.categories for all using (public.is_staff()) with check (public.is_staff());

create policy "Anyone can view published products"
  on public.products for select using (status = 'published' or public.is_staff());
create policy "Staff manage products"
  on public.products for all using (public.is_staff()) with check (public.is_staff());

create policy "Anyone can view published product images"
  on public.product_images for select using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
      and (products.status = 'published' or public.is_staff())
    )
  );
create policy "Staff manage product images"
  on public.product_images for all using (public.is_staff()) with check (public.is_staff());

create policy "Staff view own staff profile"
  on public.staff_profiles for select using (user_id = auth.uid() or public.is_staff());
create policy "Owners manage staff profiles"
  on public.staff_profiles for all using (
    exists (select 1 from public.staff_profiles where user_id = auth.uid() and role = 'owner')
  ) with check (
    exists (select 1 from public.staff_profiles where user_id = auth.uid() and role = 'owner')
  );

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Anyone can view product image files"
  on storage.objects for select using (bucket_id = 'product-images');
create policy "Staff upload product image files"
  on storage.objects for insert with check (bucket_id = 'product-images' and public.is_staff());
create policy "Staff update product image files"
  on storage.objects for update using (bucket_id = 'product-images' and public.is_staff());
create policy "Staff delete product image files"
  on storage.objects for delete using (bucket_id = 'product-images' and public.is_staff());