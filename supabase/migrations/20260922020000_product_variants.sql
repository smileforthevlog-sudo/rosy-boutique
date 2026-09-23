-- Rosy Boutique Phase 3: product variants and size inventory.
-- This migration is additive and does not modify prior migrations.

update storage.buckets
set
  public = false,
  file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'product-images';

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text,
  inventory_quantity integer not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_inventory_nonnegative check (inventory_quantity >= 0),
  constraint product_variants_product_name_unique unique (product_id, name)
);

create index if not exists product_variants_product_sort_order_index
  on public.product_variants(product_id, active, sort_order, name);
create index if not exists product_variants_inventory_index
  on public.product_variants(inventory_quantity);

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function private.set_updated_at();

alter table public.product_variants enable row level security;

drop policy if exists "Public can read active published variants" on public.product_variants;
drop policy if exists "Owners and admins manage variants" on public.product_variants;
drop policy if exists "Editors manage draft variants" on public.product_variants;

create policy "Public can read active published variants"
  on public.product_variants for select
  using (
    active = true
    and exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.status = 'published'
    )
  );

create policy "Owners and admins manage variants"
  on public.product_variants for all
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Editors manage draft variants"
  on public.product_variants for all
  using (
    private.has_staff_role(array['editor'])
    and private.product_is_draft(product_id)
  )
  with check (
    private.has_staff_role(array['editor'])
    and private.product_is_draft(product_id)
  );