"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";

const filters = [
  "All",
  "Tops",
  "Sets",
  "Dresses",
  "Rompers",
] as const;

type Filter = (typeof filters)[number];

export default function ShopGrid({
  products,
}: {
  products: Product[];
}) {
  const [filter, setFilter] = useState<Filter>("All");

  const visibleProducts = useMemo(() => {
    if (filter === "All") {
      return products;
    }

    return products.filter(
      (product) => product.category === filter,
    );
  }, [filter, products]);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6 border-y border-black/10 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((option) => {
            const active = option === filter;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option)}
                className={`border px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition ${
                  active
                    ? "border-[#922f36] bg-[#922f36] text-white"
                    : "border-black/15 bg-transparent hover:border-black/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">
          {visibleProducts.length}{" "}
          {visibleProducts.length === 1 ? "style" : "styles"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-y-14">
        {visibleProducts.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]">
              <Image
                src={product.image}
                alt={product.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                style={{
                  objectPosition: product.position,
                }}
              />

              <div className="absolute left-3 top-3 bg-[#fffdf9] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.16em]">
                {product.label}
              </div>

              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-[#1d1816] py-3 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-y-0">
                View Product
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#922f36]">
                {product.category}
              </p>

              <div className="mt-2 flex items-start justify-between gap-4">
                <h2 className="font-display text-xl leading-none sm:text-2xl">
                  {product.name}
                </h2>

                <p className="shrink-0 text-xs">
                  {product.price}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
