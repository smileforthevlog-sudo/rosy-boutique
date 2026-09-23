import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { HomepageSection, HomepageItem } from "@/lib/homepage/types";

type SectionRow = Database["public"]["Tables"]["homepage_sections"]["Row"];
type ItemRow = Database["public"]["Tables"]["homepage_section_items"]["Row"];

type SectionWithItems = SectionRow & {
  homepage_section_items: ItemRow[];
};

const sectionSelect = `
  id, key, section_type, eyebrow, heading, body, cta_label, cta_href,
  image_path, active, sort_order, created_at, updated_at,
  homepage_section_items (
    id, section_id, key, eyebrow, title, subtitle, cta_label, cta_href,
    image_path, active, sort_order, created_at, updated_at
  )
`;

async function mapSections(
  rows: unknown[],
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  activeOnly = false,
) {
  const sections = (rows as SectionWithItems[])
    .filter((section) => !activeOnly || section.active)
    .map((section) => ({
      ...section,
      homepage_section_items: section.homepage_section_items.filter(
        (item) => !activeOnly || item.active,
      ),
    }));
  const paths = [
    ...new Set(
      sections
        .flatMap((section) => [
          section.image_path,
          ...section.homepage_section_items.map((item) => item.image_path),
        ])
        .filter((path): path is string => Boolean(path)),
    ),
  ];
  const signedUrls = new Map<string, string>();

  if (paths.length > 0) {
    const { data, error } = await client.storage
      .from("site-media")
      .createSignedUrls(paths, 60 * 60);

    if (error) throw new Error(`Unable to sign homepage media: ${error.message}`);
    data.forEach((item) => {
      if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
    });
  }

  const mapImage = (path: string | null) => ({
    path,
    signedUrl: path ? signedUrls.get(path) || null : null,
  });

  return sections.map((section): HomepageSection => ({
    id: section.id,
    key: section.key,
    sectionType: section.section_type,
    eyebrow: section.eyebrow,
    heading: section.heading,
    body: section.body,
    ctaLabel: section.cta_label,
    ctaHref: section.cta_href,
    image: mapImage(section.image_path),
    active: section.active,
    sortOrder: section.sort_order,
    items: [...section.homepage_section_items]
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((item): HomepageItem => ({
        id: item.id,
        key: item.key,
        eyebrow: item.eyebrow,
        title: item.title,
        subtitle: item.subtitle,
        ctaLabel: item.cta_label,
        ctaHref: item.cta_href,
        image: mapImage(item.image_path),
        active: item.active,
        sortOrder: item.sort_order,
      })),
  }));
}

export async function getActiveHomepageSections() {
  const client = await createSupabaseServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("homepage_sections")
    .select(sectionSelect)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Unable to load homepage content: ${error.message}`);
  return mapSections(data, client, true);
}

export async function getAdminHomepageSections() {
  const client = await createSupabaseServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("homepage_sections")
    .select(sectionSelect)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Unable to load homepage admin content: ${error.message}`);
  return mapSections(data, client);
}