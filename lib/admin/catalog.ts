import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type AdminImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  signedUrl: string | null;
};

export type AdminVariant = {
  id: string;
  name: string;
  sku: string | null;
  inventory_quantity: number;
  active: boolean;
  sort_order: number;
};

export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  category_name: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  short_description: string | null;
  description: string | null;
  sku: string | null;
  inventory_quantity: number;
  availability_status: Database["public"]["Enums"]["availability_status"];
  featured: boolean;
  status: Database["public"]["Enums"]["product_status"];
  created_at: string;
  updated_at: string;
  images: AdminImage[];
  variants: AdminVariant[];
};

export type AdminCategory = Database["public"]["Tables"]["categories"]["Row"];

type AdminProductRow = Database["public"]["Tables"]["products"]["Row"] & {
  categories: { id: string; name: string; slug: string } | null;
  product_images: Database["public"]["Tables"]["product_images"]["Row"][];
  product_variants: Database["public"]["Tables"]["product_variants"]["Row"][];
};

const productSelect = `
  id, title, slug, category_id, price_cents, compare_at_price_cents,
  short_description, description, sku, inventory_quantity,
  availability_status, featured, status, created_at, updated_at,
  categories (id, name, slug),
  product_images (id, storage_path, alt_text, sort_order, created_at, product_id),
  product_variants (id, product_id, name, sku, inventory_quantity, active, sort_order, created_at, updated_at)
`;

async function mapAdminProducts(
  rows: unknown[],
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  const products = rows as AdminProductRow[];
  const paths = [
    ...new Set(
      products.flatMap((product) =>
        product.product_images.map((image) => image.storage_path),
      ),
    ),
  ];
  const signedUrls = new Map<string, string>();

  if (paths.length > 0) {
    const { data, error } = await client.storage
      .from("product-images")
      .createSignedUrls(paths, 60 * 60);

    if (error) {
      throw new Error(`Unable to sign admin images: ${error.message}`);
    }

    data.forEach((image) => {
      if (image.path && image.signedUrl) {
        signedUrls.set(image.path, image.signedUrl);
      }
    });
  }

  return products.map((product): AdminProduct => ({
    id: product.id,
    title: product.title,
    slug: product.slug,
    category_id: product.category_id,
    category_name: product.categories?.name || null,
    price_cents: product.price_cents,
    compare_at_price_cents: product.compare_at_price_cents,
    short_description: product.short_description,
    description: product.description,
    sku: product.sku,
    inventory_quantity: product.inventory_quantity,
    availability_status: product.availability_status,
    featured: product.featured,
    status: product.status,
    created_at: product.created_at,
    updated_at: product.updated_at,
    images: [...product.product_images]
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((image) => ({
        id: image.id,
        storage_path: image.storage_path,
        alt_text: image.alt_text,
        sort_order: image.sort_order,
        signedUrl: signedUrls.get(image.storage_path) || null,
      })),
    variants: [...product.product_variants]
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity,
        active: variant.active,
        sort_order: variant.sort_order,
      })),
  }));
}

export async function getAdminProducts() {
  const client = await createSupabaseServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Unable to load admin products: ${error.message}`);
  return mapAdminProducts(data, client);
}

export async function getAdminProduct(id: string) {
  const client = await createSupabaseServerClient();
  if (!client) return null;

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load admin product: ${error.message}`);
  if (!data) return null;

  const products = await mapAdminProducts([data], client);
  return products[0] || null;
}

export async function getAdminCategories() {
  const client = await createSupabaseServerClient();
  if (!client) return [];

  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, description, sort_order, active, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Unable to load admin categories: ${error.message}`);
  return data as AdminCategory[];
}
