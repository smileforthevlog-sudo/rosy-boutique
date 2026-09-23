-- Rosy Boutique Phase 3.5: structured homepage merchandising content.
-- Editorial media is intentionally separate from product-images and remains private.

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  section_type text not null,
  eyebrow text,
  heading text,
  body text,
  cta_label text,
  cta_href text,
  image_path text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.homepage_sections(id) on delete cascade,
  key text not null,
  eyebrow text,
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  image_path text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_section_items_section_key_unique unique (section_id, key),
  constraint homepage_section_items_section_title_unique unique (section_id, title)
);

create index if not exists homepage_sections_active_order_index
  on public.homepage_sections(active, sort_order, key);
create index if not exists homepage_section_items_section_order_index
  on public.homepage_section_items(section_id, active, sort_order, key);

drop trigger if exists homepage_sections_set_updated_at on public.homepage_sections;
create trigger homepage_sections_set_updated_at
before update on public.homepage_sections
for each row execute function private.set_updated_at();

drop trigger if exists homepage_section_items_set_updated_at on public.homepage_section_items;
create trigger homepage_section_items_set_updated_at
before update on public.homepage_section_items
for each row execute function private.set_updated_at();

alter table public.homepage_sections enable row level security;
alter table public.homepage_section_items enable row level security;

drop policy if exists "Public can read active homepage sections" on public.homepage_sections;
drop policy if exists "Owners and admins manage homepage sections" on public.homepage_sections;
drop policy if exists "Editors can read homepage sections" on public.homepage_sections;
drop policy if exists "Public can read active homepage items" on public.homepage_section_items;
drop policy if exists "Owners and admins manage homepage items" on public.homepage_section_items;
drop policy if exists "Editors can read homepage items" on public.homepage_section_items;

create policy "Public can read active homepage sections"
  on public.homepage_sections for select
  using (active = true);

create policy "Owners and admins manage homepage sections"
  on public.homepage_sections for all
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Editors can read homepage sections"
  on public.homepage_sections for select
  using (private.has_staff_role(array['editor']));

create policy "Public can read active homepage items"
  on public.homepage_section_items for select
  using (
    active = true
    and exists (
      select 1 from public.homepage_sections
      where homepage_sections.id = homepage_section_items.section_id
        and homepage_sections.active = true
    )
  );

create policy "Owners and admins manage homepage items"
  on public.homepage_section_items for all
  using (private.has_staff_role(array['owner', 'admin']))
  with check (private.has_staff_role(array['owner', 'admin']));

create policy "Editors can read homepage items"
  on public.homepage_section_items for select
  using (private.has_staff_role(array['editor']));

insert into public.homepage_sections (
  key, section_type, eyebrow, heading, body, cta_label, cta_href, sort_order
)
values
  (
    'homepage-editorial-cards',
    'editorial_cards',
    null,
    null,
    null,
    null,
    null,
    10
  ),
  (
    'homepage-rosy-edit',
    'split_editorial',
    'Our world',
    'The Rosy Edit',
    'Inspiration from the pieces, people, places, and moments we''re loving right now.',
    'Discover The Edit',
    'https://www.instagram.com/rosyboutiqueva/',
    20
  )
on conflict (key) do nothing;

insert into public.homepage_section_items (
  section_id, key, eyebrow, title, subtitle, cta_label, cta_href, sort_order
)
select sections.id, items.item_key, items.eyebrow, items.title, items.subtitle, items.cta_label, items.cta_href, items.sort_order
from public.homepage_sections sections
join (values
  ('homepage-editorial-cards', 'dresses', 'Shop', 'Dresses', 'For every plan on your calendar.', 'Explore', '/shop', 10),
  ('homepage-editorial-cards', 'tops-sets', 'Shop', 'Tops + Sets', 'Easy pieces. Endless outfits.', 'Explore', '/shop', 20),
  ('homepage-editorial-cards', 'rosy-edit-card', 'Shop', 'The Rosy Edit', 'Our current favorites.', 'Explore', '/#rosy-edit', 30)
) as items(section_key, item_key, eyebrow, title, subtitle, cta_label, cta_href, sort_order)
  on sections.key = items.section_key
on conflict (section_id, title) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

drop policy if exists "Public can read active homepage media" on storage.objects;
drop policy if exists "Owners and admins manage site media" on storage.objects;

create policy "Public can read active homepage media"
  on storage.objects for select
  using (
    bucket_id = 'site-media'
    and split_part(name, '/', 1) = 'homepage'
    and split_part(name, '/', 2) in (
      select id::text from public.homepage_sections where active = true
      union
      select id::text from public.homepage_section_items where active = true
    )
  );

create policy "Owners and admins manage site media"
  on storage.objects for all
  using (
    bucket_id = 'site-media'
    and private.has_staff_role(array['owner', 'admin'])
    and split_part(name, '/', 1) = 'homepage'
    and split_part(name, '/', 2) <> ''
    and split_part(name, '/', 3) <> ''
  )
  with check (
    bucket_id = 'site-media'
    and private.has_staff_role(array['owner', 'admin'])
    and split_part(name, '/', 1) = 'homepage'
    and split_part(name, '/', 2) <> ''
    and split_part(name, '/', 3) <> ''
  );