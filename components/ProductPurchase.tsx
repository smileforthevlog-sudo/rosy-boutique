"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import {
  getProductAvailabilityLabel,
  isProductPurchasable,
  type ProductAvailability,
} from "@/lib/products/types";
import type { ProductVariant } from "@/lib/products/types";

type ProductPurchaseProps = {
  product: {
    productId: string;
    slug: string;
    name: string;
    price_cents: number;
    image: string;
    availability_status: ProductAvailability;
    inventory_quantity: number;
    variants: ProductVariant[];
  };
  variants: ProductVariant[];
};

export default function ProductPurchase({
  product,
  variants,
}: ProductPurchaseProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { addItem } = useCart();
  const purchasable = isProductPurchasable(product);
  const availabilityLabel = getProductAvailabilityLabel(product);

  function handleAddToBag() {
    if (!purchasable || (variants.length > 0 && !selectedVariant)) return;

    addItem({
      ...product,
      variantId: selectedVariant?.id || null,
      variantName: selectedVariant?.name || null,
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
          {variants.length > 0 ? "Select Size" : "Availability"}
        </p>

        <button
          type="button"
          className="text-[9px] uppercase tracking-[0.16em] text-black/45 underline underline-offset-4"
        >
          Size Guide
        </button>
      </div>

      {variants.length > 0 && <div className="grid grid-cols-4 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const variantSoldOut = variant.inventory_quantity <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={variantSoldOut}
              onClick={() => setSelectedVariant(variant)}
              className={`min-h-12 border px-2 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                isSelected
                  ? "border-[#922f36] bg-[#922f36] text-white"
                  : variantSoldOut
                    ? "cursor-not-allowed border-black/10 bg-black/5 text-black/30"
                    : "border-black/20 bg-white hover:border-black"
              }`}
            >
              {variant.name}
            </button>
          );
        })}
      </div>}

      <button
        type="button"
        disabled={!purchasable || (variants.length > 0 && !selectedVariant)}
        onClick={handleAddToBag}
        className={`mt-6 min-h-14 w-full px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
          purchasable && (variants.length === 0 || selectedVariant)
            ? "bg-[#1d1816] text-white hover:bg-[#922f36]"
            : "cursor-not-allowed bg-black/10 text-black/35"
        }`}
      >
        {!purchasable
          ? availabilityLabel
          : variants.length === 0 || selectedVariant
            ? "Add to Bag"
            : "Choose a Size"}
      </button>

      {selectedVariant && (
        <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-black/40">
          Selected: {selectedVariant.name}
        </p>
      )}
    </div>
  );
}