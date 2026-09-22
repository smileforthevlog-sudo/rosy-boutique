-- Rosy Boutique production catalog foundation.
-- This migration extends the initial schema without recreating or deleting tables.

create schema if not exists private;

alter table public.categories
  add column if not exists sort_order integer not null default 0,
  add column if not exists active boolean not null default true;

alter table public.products
  add column if not exists compare_at_price_cents integer,
  add column if not exists short_description text,
  add column if not exists sku text,
  add column if not exists inventory_quantity integer not null default 0;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'availability'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'availability_status'
  ) then
    alter table public.products rename column availability to availability_status;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'is_featured'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'featured'
  ) then
    alter table public.products rename column is_featured to featured;
  end if;
end $$;

alter table public.products
  add column if not exists availability_status text not null default 'in_stock',
  add column if not exists featured boolean not null default false;

alter table public.products
  drop constraint if exists products_availability_check,
  drop constraint if exists products_status_check,
  drop constraint if exists products_compare_at_price_cents_check,
  drop constraint if exists products_inventory_quantity_check,
  drop constraint if exists products_price_cents_nonnegative,
  drop constraint if exists products_compare_at_price_valid,
  drop constraint if exists products_inventory_nonnegative,
  drop constraint if exists products_availability_status_valid;

alter table public.products
  add constraint products_price_cents_nonnegative check (price_cents >= 0),
  add constraint products_compare_at_price_valid check (
    compare_at_price_cents is null or compare_at_price_cents >= price_cents
  ),
  add constraint products_inventory_nonnegative check (inventory_quantity >= 0),
  add constraint products_availability_status_valid check (
    availability_status in ('in_stock', 'sold_out', 'coming_soon')
  );

alter table public.product_images
  alter column alt_text drop not null;

alter table public.staff_profiles
  add column if not exists active boolean not null default true;

alter table public.staff_profiles
  drop constraint if exists staff_profiles_role_check;

insert into public.categories (name, slug, sort_order)
values
  ('Tops', 'tops', 10),
  ('Sets', 'sets', 20),
  ('Dresses', 'dresses', 30),
  ('Rompers', 'rompers', 40)
on conflict (slug) do nothing;

create index if not exists categories_active_sort_order_index
  on public.categories(active, sort_order, name);
create index if not exists products_published_featured_index
  on public.products(status, featured, created_at desc);
create index if not exists products_availability_index
  on public.products(availability_status);
create index if not exists product_images_product_sort_order_index
  on public.product_images(product_id, sort_order, created_at);
create index if not exists staff_profiles_active_role_index
  on public.staff_profiles(active, role);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function private.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();

drop trigger if exists staff_profiles_set_updated_at on public.staff_profiles;
create trigger staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function private.set_updated_at();

create or replace function private.current_staff_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role
  from public.staff_profiles
  where user_id = auth.uid() and active = true;
$$;

create or replace function private.is_active_staff()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select private.current_staff_role() is not null;
$$;

create or replace function private.has_staff_role(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(private.current_staff_role() = any(allowed_roles), false);
$$;

create or replace function private.product_is_draft(product_uuid uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.products
    where id = product_uuid and status = 'draft'
  );
$$;

create or replace function private.storage_object_product_is_draft(object_name text)
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  product_uuid uuid;
begin
  if split_part(object_name, '/', 1) <> 'products'
     or split_part(object_name, '/', 2) !~ '^[0-9a-fA-F-]{36}$' then
    return false;
  end if;

  begin
    product_uuid := split_part(object_name, '/', 2)::uuid;
  exception when invalid_text_representation then
    return false;
  end;

  return private.product_is_draft(product_uuid);
end;
$$;

create or replace function private.storage_object_product_is_published(object_name text)
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  product_uuid uuid;
begin
  if split_part(object_name, '/', 1) <> 'products'
     or split_part(object_name, '/', 2) !~ '^[0-9a-fA-F-]{36}$' then
    return false;
  end if;

  begin
    product_uuid := split_part(object_name, '/', 2)::uuid;
  exception when invalid_text_representation then
    return false;
  end;

  return exists (
    select 1 from public.products
    where id = product_uuid and status = 'published'
  );
end;
$$;

-- The private schema is intentionally absent from the Supabase Data API exposed schemas.
-- These grants let RLS evaluate helpers without making them callable as public RPCs.
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.current_staff_role() from public, anon, authenticated;
revoke all on function private.is_active_staff() from public, anon, authenticated;
revoke all on function private.has_staff_role(text[]) from public, anon, authenticated;
revoke all on function private.product_is_draft(uuid) from public, anon, authenticated;
revoke all on function private.storage_object_product_is_draft(text) from public, anon, authenticated;
revoke all on function private.storage_object_product_is_published(text) from public, anon, authenticated;

grant execute on function private.current_staff_role() to anon, authenticated;
grant execute on function private.is_active_staff() to anon, authenticated;
grant execute on function private.has_staff_role(text[]) to anon, authenticated;
grant execute on function private.product_is_draft(uuid) to anon, authenticated;
grant execute on function private.storage_object_product_is_draft(text) to anon, authenticated;
grant execute on function private.storage_object_product_is_published(text) to anon, authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.staff_profiles enable row level security;

drop policy if exists "Anyone can view categories" on public.categories;
drop policy if exists "Staff manage categories" on public.categories;
drop policy if exists "Anyone can view published products" on public.products;
drop policy if exists "Staff manage products" on public.products;
drop policy if exists "Anyone can view published product images" on public.product_images;
drop policy if exists "Staff manage product images" on public.product_images;
drop policy if exists "Staff view own staff profile" on public.staff_profiles;
drop policy if exists "Owners manage staff profiles" on public.staff_profiles;

create policy "Public can read active categories"
  on public.categories for select
  using (active = true or private.is_active_staff());

create policy "Owners and admins manage categories"
  on public.categories for all
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Public can read published products"
  on public.products for select
  using (status = 'published' or private.is_active_staff());

create policy "Active staff can create products"
  on public.products for insert
  with check (
    private.is_active_staff()
    and (
      status = 'draft'
      or private.has_staff_role(array['owner', 'admin'])
    )
  );

create policy "Owners and admins manage all products"
  on public.products for update
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Editors update draft products"
  on public.products for update
  using (private.has_staff_role(array['editor']) and status = 'draft')
  with check (private.has_staff_role(array['editor']) and status = 'draft');

create policy "Owners and admins delete products"
  on public.products for delete
  using (private.has_staff_role(array['owner', 'admin']));

create policy "Public can read published product images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id
        and products.status = 'published'
    )
    or private.is_active_staff()
  );

create policy "Owners and admins manage all product images"
  on public.product_images for all
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Editors manage draft product images"
  on public.product_images for all
  using (
    private.has_staff_role(array['editor'])
    and private.product_is_draft(product_id)
  )
  with check (
    private.has_staff_role(array['editor'])
    and private.product_is_draft(product_id)
  );

create policy "Staff can read permitted staff profiles"
  on public.staff_profiles for select
  using (
    user_id = auth.uid()
    or private.has_staff_role(array['owner'])
  );

create policy "Owners manage staff profiles"
  on public.staff_profiles for all
  using (private.has_staff_role(array['owner']))
  with check (private.has_staff_role(array['owner']));

-- Preserve the existing bucket while making object reads follow product status.
-- This bucket stays private. Phase 2 must not use getPublicUrl(); published images
-- should be served through signed URLs or another server-mediated retrieval path.
update storage.buckets
set public = false
where id = 'product-images';

drop policy if exists "Anyone can view product image files" on storage.objects;
drop policy if exists "Staff upload product image files" on storage.objects;
drop policy if exists "Staff update product image files" on storage.objects;
drop policy if exists "Staff delete product image files" on storage.objects;

-- All legacy policies depending on public.is_staff() are gone before the function.
drop function if exists public.is_staff();

create policy "Public can read published product image files"
  on storage.objects for select
  using (
    bucket_id = 'product-images'
    and private.storage_object_product_is_published(name)
  );

create policy "Owners and admins manage product image files"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and private.has_staff_role(array['owner', 'admin'])
    and split_part(name, '/', 1) = 'products'
    and split_part(name, '/', 2) ~ '^[0-9a-fA-F-]{36}$'
    and split_part(name, '/', 3) <> ''
  )
  with check (
    bucket_id = 'product-images'
    and private.has_staff_role(array['owner', 'admin'])
    and split_part(name, '/', 1) = 'products'
    and split_part(name, '/', 2) ~ '^[0-9a-fA-F-]{36}$'
    and split_part(name, '/', 3) <> ''
  );

create policy "Editors manage draft product image files"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and private.has_staff_role(array['editor'])
    and private.storage_object_product_is_draft(name)
  )
  with check (
    bucket_id = 'product-images'
    and private.has_staff_role(array['editor'])
    and private.storage_object_product_is_draft(name)
    and split_part(name, '/', 3) <> ''
  );