export type ProductAvailability = "in_stock" | "sold_out" | "coming_soon";

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export type StorefrontProduct = {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  short_description: string | null;
  description: string | null;
  inventory_quantity: number;
  availability_status: ProductAvailability;
  featured: boolean;
  images: ProductImage[];
};

export type StorefrontCategory = ProductCategory & {
  description: string | null;
  sortOrder: number;
};

export function isProductPurchasable(
  product: Pick<StorefrontProduct, "availability_status" | "inventory_quantity">,
) {
  return (
    product.availability_status === "in_stock" &&
    product.inventory_quantity > 0
  );
}

export function getProductAvailabilityLabel(
  product: Pick<StorefrontProduct, "availability_status" | "inventory_quantity">,
) {
  if (product.availability_status === "coming_soon") {
    return "Coming Soon";
  }

  if (
    product.availability_status === "sold_out" ||
    product.inventory_quantity <= 0
  ) {
    return "Sold Out";
  }

  return "New Arrival";
}