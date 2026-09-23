import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import ProductPurchase from "@/components/ProductPurchase";
import SiteHeader from "@/components/SiteHeader";
import {
  getPublishedProductBySlug,
  getPublishedProducts,
} from "@/lib/products/queries";
import {
  getProductAvailabilityLabel,
  isProductPurchasable,
} from "@/lib/products/types";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    return {
      title: "Product | Rosy Boutique",
    };
  }

  return {
    title: `${product.title} | Rosy Boutique`,
    description: product.short_description || product.description || undefined,
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const [product, publishedProducts] = await Promise.all([
    getPublishedProductBySlug(slug),
    getPublishedProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = publishedProducts
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);
  const primaryImage = product.images[0];
  const purchasable = isProductPurchasable(product);
  const productLabel = getProductAvailabilityLabel(product);

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#181412]">
      <SiteHeader variant="product" />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1500px] px-5 pb-5 pt-8 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/35">
          <Link href="/">Home</Link>

          <span>/</span>

          <Link href="/#new">
            New Arrivals
          </Link>

          <span>/</span>

          <span className="text-black/60">
            {product.title}
          </span>
        </div>
      </div>

      {/* Product */}
      <section className="mx-auto grid max-w-[1500px] gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-12 lg:pb-32">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-xs uppercase tracking-[0.16em] text-black/35">
              Image coming soon
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-[130px] lg:self-start lg:pt-10">
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#922f36]">
            {productLabel}
          </p>

          <h1 className="font-display mt-4 text-5xl leading-[0.95] tracking-[-0.025em] sm:text-6xl">
            {product.title}
          </h1>

          <p className="mt-5 text-sm">
            ${(product.price_cents / 100).toFixed(2)}
          </p>

          <div className="my-8 h-px bg-black/10" />

          <p className="max-w-lg text-sm leading-7 text-black/60">
            {product.description || product.short_description || ""}
          </p>

          <div className="my-8 h-px bg-black/10" />

          <ProductPurchase
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.title,
              price_cents: product.price_cents,
              image: primaryImage?.url || "",
              availability_status: product.availability_status,
              inventory_quantity: product.inventory_quantity,
              variants: product.variants,
            }}
            variants={product.variants}
          />

          <div className="mt-10 border-t border-black/10">
            <div className="border-b border-black/10 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                Details
              </p>

              <ul className="mt-4 space-y-2 text-xs leading-6 text-black/55">
                {[
                  product.category?.name,
                  product.availability_status === "coming_soon"
                    ? "Coming soon"
                    : !purchasable
                      ? "Currently sold out"
                      : "Available to order",
                ].filter(Boolean).map((detail) => (
                  <li key={detail}>
                    · {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-b border-black/10 py-5">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                  Shipping + Returns
                </p>

                <span className="text-lg font-light">
                  +
                </span>
              </div>
            </div>

            <div className="border-b border-black/10 py-5">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                  Care
                </p>

                <span className="text-lg font-light">
                  +
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="bg-[#922f36] px-5 py-20 text-center text-white sm:px-8 lg:py-24">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/55">
          The Rosy way
        </p>

        <h2 className="font-display mx-auto mt-5 max-w-3xl text-4xl leading-[1] sm:text-5xl lg:text-6xl">
          Wear it your way.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/65">
          Pieces made for plans you&apos;ve made and the ones that happen
          along the way.
        </p>
      </section>

      {/* Related */}
      <section className="px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#922f36]">
                Keep shopping
              </p>

              <h2 className="font-display mt-3 text-4xl sm:text-5xl">
                You may also like
              </h2>
            </div>

            <Link
              href="/#new"
              className="hidden border-b border-black pb-1 text-[8px] font-semibold uppercase tracking-[0.2em] sm:block"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.slug}
                href={`/products/${relatedProduct.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]">
                  {relatedProduct.images[0] ? (
                    <Image
                      src={relatedProduct.images[0].url}
                      alt={relatedProduct.images[0].altText || relatedProduct.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-xs uppercase tracking-[0.16em] text-black/35">
                      Image coming soon
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between gap-3">
                  <h3 className="font-display text-lg sm:text-xl">
                    {relatedProduct.title}
                  </h3>

                  <p className="text-xs">
                    ${(relatedProduct.price_cents / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#1d1816] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-display text-4xl tracking-[0.16em] text-[#d8b2ad]"
            >
              ROSY
            </Link>

            <p className="mt-3 text-[10px] text-white/40">
              Arlington, Virginia
            </p>
          </div>

          <div className="flex gap-6 text-[9px] uppercase tracking-[0.16em] text-white/55">
            <Link href="/#new">
              Shop
            </Link>

            <Link href="/#popups">
              Pop-Ups
            </Link>

            <a
              href="https://www.instagram.com/rosyboutiqueva/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}