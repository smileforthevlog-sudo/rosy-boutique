import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ProductImage,
  ProductVariant,
  StorefrontCategory,
  StorefrontProduct,
} from "@/lib/products/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductVariantRow = Database["public"]["Tables"]["product_variants"]["Row"];

type ProductWithRelations = ProductRow & {
  categories: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
};

const productSelect = `
  id,
  slug,
  title,
  category_id,
  price_cents,
  compare_at_price_cents,
  short_description,
  description,
  sku,
  inventory_quantity,
  availability_status,
  featured,
  status,
  created_at,
  updated_at,
  categories (id, name, slug),
  product_images (id, storage_path, alt_text, sort_order, created_at, product_id)
  , product_variants (id, product_id, name, sku, inventory_quantity, active, sort_order, created_at, updated_at)
`;

function toStorefrontProduct(
  product: ProductWithRelations,
  signedUrls: Map<string, string>,
): StorefrontProduct {
  const images = [...product.product_images]
    .sort((first, second) => first.sort_order - second.sort_order)
    .flatMap((image): ProductImage[] => {
      const signedUrl = signedUrls.get(image.storage_path);

      return signedUrl
        ? [{
            id: image.id,
            url: signedUrl,
            altText: image.alt_text,
            sortOrder: image.sort_order,
          }]
        : [];
    });

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.categories,
    price_cents: product.price_cents,
    compare_at_price_cents: product.compare_at_price_cents,
    short_description: product.short_description,
    description: product.description,
    inventory_quantity: product.inventory_quantity,
    availability_status: product.availability_status,
    featured: product.featured,
    images,
    variants: [...product.product_variants]
      .filter((variant) => variant.active)
      .sort((first, second) => first.sort_order - second.sort_order)
      .map((variant): ProductVariant => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity,
        active: variant.active,
        sort_order: variant.sort_order,
      })),
  };
}

async function mapProducts(
  rows: unknown[],
  client: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  const products = rows as ProductWithRelations[];
  const imagePaths = [
    ...new Set(
      products.flatMap((product) =>
        product.product_images.map((image) => image.storage_path),
      ),
    ),
  ];
  const signedUrls = new Map<string, string>();

  if (imagePaths.length > 0) {
    const { data, error } = await client.storage
      .from("product-images")
      .createSignedUrls(imagePaths, 60 * 60);

    if (error) {
      throw new Error(`Unable to sign product images: ${error.message}`);
    }

    data.forEach((image) => {
      if (image.path && image.signedUrl) {
        signedUrls.set(image.path, image.signedUrl);
      }
    });
  }

  return products.map((product) => toStorefrontProduct(product, signedUrls));
}

export async function getActiveCategories(): Promise<StorefrontCategory[]> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, description, sort_order, active, created_at, updated_at")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (data as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sort_order,
  }));
}

export async function getPublishedProducts(): Promise<StorefrontProduct[]> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load products: ${error.message}`);
  }

  return mapProducts(data, client);
}

export async function getNewArrivals(limit = 4): Promise<StorefrontProduct[]> {
  const products = await getPublishedProducts();
  return products.slice(0, limit);
}

export async function getFeaturedProducts(limit = 4): Promise<StorefrontProduct[]> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load featured products: ${error.message}`);
  }

  return mapProducts(data, client);
}

export async function getPublishedProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load product: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const products = await mapProducts([data], client);
  return products[0] || null;
}