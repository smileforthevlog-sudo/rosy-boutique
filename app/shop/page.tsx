import Link from "next/link";
import ShopGrid from "@/components/ShopGrid";
import SiteHeader from "@/components/SiteHeader";
import { products } from "@/lib/products";

export const metadata = {
  title: "Shop | Rosy Boutique",
  description:
    "Shop the Rosy Boutique collection of feminine, effortless styles curated in Arlington, Virginia.",
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#181412]">
      <SiteHeader />

      <section className="border-b border-black/[0.06] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#922f36]">
            The collection
          </p>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <h1 className="font-display max-w-4xl text-6xl leading-[0.88] tracking-[-0.04em] sm:text-7xl lg:text-[96px]">
              Find your next
              <br />
              favorite.
            </h1>

            <p className="max-w-lg text-sm leading-7 text-black/55 lg:pb-2">
              Easy-to-wear pieces, feminine details, and a little something
              special — curated by Rosy Boutique in Arlington, Virginia.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1500px]">
          <ShopGrid products={products} />
        </div>
      </section>

      <section className="bg-[#922f36] px-5 py-20 text-center text-white sm:px-8 lg:py-24">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/55">
          Shop Rosy IRL
        </p>

        <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[1] sm:text-5xl lg:text-6xl">
          Prefer to see it in person?
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/65">
          Follow Rosy for upcoming Arlington-area pop-ups, new drops, and
          behind-the-scenes looks.
        </p>

        <Link
          href="/#popups"
          className="mt-8 inline-block border-b border-white pb-1 text-[9px] font-semibold uppercase tracking-[0.2em]"
        >
          Explore Pop-Ups
        </Link>
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

          <div className="flex flex-wrap gap-6 text-[9px] uppercase tracking-[0.16em] text-white/55">
            <Link href="/">
              Home
            </Link>

            <Link href="/shop">
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
