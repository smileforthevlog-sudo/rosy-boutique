"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type ProductPurchaseProps = {
  product: {
    slug: string;
    name: string;
    price: string;
    image: string;
  };
  sizes: string[];
};

export default function ProductPurchase({
  product,
  sizes,
}: ProductPurchaseProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const { addItem } = useCart();

  function handleAddToBag() {
    if (!selectedSize) return;

    addItem(product, selectedSize);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
          Select Size
        </p>

        <button
          type="button"
          className="text-[9px] uppercase tracking-[0.16em] text-black/45 underline underline-offset-4"
        >
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`border py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                isSelected
                  ? "border-[#922f36] bg-[#922f36] text-white"
                  : "border-black/20 bg-white hover:border-black"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selectedSize}
        onClick={handleAddToBag}
        className={`mt-6 w-full px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] transition ${
          selectedSize
            ? "bg-[#1d1816] text-white hover:bg-[#922f36]"
            : "cursor-not-allowed bg-black/10 text-black/35"
        }`}
      >
        {selectedSize ? "Add to Bag" : "Choose a Size"}
      </button>

      {selectedSize && (
        <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-black/40">
          Selected: {selectedSize}
        </p>
      )}
    </div>
  );
}