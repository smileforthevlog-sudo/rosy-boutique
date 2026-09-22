"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getProductAvailabilityLabel,
} from "@/lib/products/types";
import type {
  StorefrontCategory,
  StorefrontProduct,
} from "@/lib/products/types";

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export default function ShopGrid({
  products,
  categories,
}: {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
}) {
  const [filter, setFilter] = useState("All");

  const visibleProducts = useMemo(() => {
    if (filter === "All") {
      return products;
    }

    return products.filter(
      (product) => product.category?.slug === filter,
    );
  }, [filter, products]);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 border-y border-black/10 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[{ slug: "All", name: "All" }, ...categories].map((option) => {
            const active = option.slug === filter;

            return (
              <button
                key={option.slug}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option.slug)}
                className={`border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                  active
                    ? "border-[#922f36] bg-[#922f36] text-white"
                    : "border-black/15 bg-transparent hover:border-black/50"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>

        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "style" : "styles"}
        </p>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="border border-dashed border-black/15 px-6 py-16 text-center">
          <h2 className="font-display text-3xl">Nothing here just yet.</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/50">
            We&apos;re refreshing this part of the collection. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-y-14">
          {visibleProducts.map((product) => {
            const image = product.images[0];
            return (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.altText || product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.16em] text-black/35">
                  Image coming soon
                </div>
              )}

              <div className="absolute left-3 top-3 bg-[#fffdf9] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.16em]">
                {getProductAvailabilityLabel(product)}
              </div>

              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-[#1d1816] py-3 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-y-0">
                View Product
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#922f36]">
                {product.category?.name || "Rosy Boutique"}
              </p>

              <div className="mt-2 flex items-start justify-between gap-4">
                <h2 className="font-display text-xl leading-none sm:text-2xl">
                  {product.title}
                </h2>

                <p className="shrink-0 text-xs">
                  {formatPrice(product.price_cents)}
                </p>
              </div>
            </div>
          </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
