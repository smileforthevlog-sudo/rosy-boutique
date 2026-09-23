import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getNewArrivals } from "@/lib/products/queries";
import {
  getProductAvailabilityLabel,
  type StorefrontProduct,
} from "@/lib/products/types";
import { getActiveHomepageSections } from "@/lib/homepage/queries";
import { safeContentHref } from "@/lib/homepage/types";

const homepageImageFallbacks: Record<string, string> = {
  dresses: "/images/rosy/category-dresses.png",
  "tops-sets": "/images/rosy/category-tops.png",
  "rosy-edit-card": "/images/rosy/category-edit.png",
};

const instagramTiles = [
  "/images/rosy/instagram-01.png",
  "/images/rosy/instagram-02.png",
  "/images/rosy/instagram-03.png",
  "/images/rosy/instagram-04.png",
  "/images/rosy/instagram-05.png",
  "/images/rosy/instagram-06.png",
];

function formatPrice(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

function ProductShelf({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
      {products.map((product) => {
        const image = product.images[0];
        return (
          <Link
            href={`/products/${product.slug}`}
            key={product.slug}
            className="group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#e9dfd6]">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.altText || product.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
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

              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-[#1f1916] py-3 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-y-0">
                View Product
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl leading-none">
                  {product.title}
                </h3>

                <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/35">
                  Rosy Boutique
                </p>
              </div>

              <p className="text-xs">{formatPrice(product.price_cents)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function Home() {
  const [newArrivals, homepageSections] = await Promise.all([
    getNewArrivals(4),
    getActiveHomepageSections(),
  ]);
  const editorialCards = homepageSections.find(
    (section) => section.key === "homepage-editorial-cards",
  );
  const rosyEdit = homepageSections.find(
    (section) => section.key === "homepage-rosy-edit",
  );

  return (
    <main className="min-h-screen bg-[#fffdf9] text-[#181412]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-[720px] overflow-hidden bg-[#e7ddd3] lg:min-h-[820px]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#e7ded4_0%,#e7ded4_42%,#c7aa9a_72%,#8d695c_100%)]" />

        <div className="absolute -right-[10%] top-[-10%] h-[650px] w-[650px] rounded-full bg-white/30 blur-[100px]" />

        <div className="absolute bottom-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-[#922f36]/15 blur-[120px]" />

        <div className="absolute right-0 top-[14%] block h-[58%] w-[50%] rotate-[1deg] overflow-hidden border-[6px] border-[#fffdf9]/70 bg-white/80 opacity-75 shadow-2xl lg:right-[9%] lg:top-[7%] lg:h-[84%] lg:w-[35%] lg:border-[9px] lg:opacity-100">
          <Image
            src="/images/rosy/hero-main.png"
            alt="Rosy Boutique styled outfit"
            fill
            priority
            sizes="36vw"
            className="object-cover"
            style={{ objectPosition: "50% 52%" }}
          />
        </div>

        <div className="absolute right-[2%] top-[30%] hidden h-[48%] w-[20%] -rotate-[2deg] overflow-hidden border-[7px] border-[#fffdf9] bg-white shadow-2xl xl:block">
          <Image
            src="/images/rosy/hero-secondary.png"
            alt="Rosy Boutique model holding branded Rosy shopping bag"
            fill
            priority
            sizes="21vw"
            className="object-cover"
            style={{ objectPosition: "50% 38%" }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[720px] max-w-[1500px] items-end px-5 pb-16 sm:px-8 sm:pb-20 lg:min-h-[820px] lg:items-center lg:px-12 lg:pb-0">
          <div className="relative z-10 max-w-[760px] lg:max-w-[620px]">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#72262c] sm:text-[11px]">
              New season · New Rosy
            </p>

            <h1 className="font-display text-[68px] font-normal leading-[0.82] tracking-[-0.045em] text-[#1f1815] sm:text-[90px] lg:text-[110px]">
              Made to
              <br />
              be worn.
            </h1>

            <p className="mt-8 max-w-[450px] text-sm leading-7 text-black/65 sm:text-[15px]">
              Effortless pieces for coffee runs, dinner plans, weekends away,
              and everything in between.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#new"
                className="bg-[#1f1916] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-[#922f36]"
              >
                Shop New Arrivals
              </Link>

              <a
                href="https://www.instagram.com/rosyboutiqueva/"
                target="_blank"
                rel="noreferrer"
                className="border border-[#1f1916] px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition duration-300 hover:bg-[#1f1916] hover:text-white"
              >
                Follow Rosy
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section
        id="new"
        className="scroll-mt-[110px] bg-[#f5eee7] px-5 py-24 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#922f36]">
                Just landed
              </p>

              <h2 className="font-display mt-3 text-5xl sm:text-6xl">
                New Arrivals
              </h2>
            </div>

            <Link
              href="/shop"
              className="hidden border-b border-black pb-1 text-[9px] font-semibold uppercase tracking-[0.2em] sm:inline-block"
            >
              Shop All
            </Link>
          </div>

          {newArrivals.length > 0 ? (
            <ProductShelf products={newArrivals} />
          ) : (
            <p className="border border-dashed border-black/15 px-6 py-14 text-center text-sm text-black/50">
              New arrivals are coming soon.
            </p>
          )}
          </div>
      </section>

      {/* Shop */}
      <section
        id="shop"
        className="scroll-mt-[110px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
      >
        <div className="mx-auto mb-20 max-w-[1000px] text-center sm:mb-24">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#922f36]">
            Shop Rosy
          </p>

          <h2 className="font-display mx-auto mt-6 max-w-[900px] text-5xl leading-[0.95] tracking-[-0.025em] sm:text-6xl lg:text-7xl">
            Clothes you&apos;ll reach for again and again.
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-black/55">
            Feminine, effortless pieces curated to make getting dressed feel
            easy.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1500px] gap-4 md:grid-cols-3">
          {editorialCards?.items.map((item) => (
            <Link
              href={safeContentHref(item.ctaHref, "/shop")}
              key={item.id}
              className="group relative overflow-hidden"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd1c7]">
                <Image
                  src={item.image.signedUrl || homepageImageFallbacks[item.key] || "/images/rosy/category-edit.png"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

              <div className="absolute bottom-0 left-0 p-7 text-white sm:p-9">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  {item.eyebrow || "Shop"}
                </p>

                <h3 className="font-display mt-2 text-4xl sm:text-5xl">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-white/75">
                  {item.subtitle}
                </p>

                <span className="mt-6 inline-block border-b border-white pb-1 text-[9px] font-semibold uppercase tracking-[0.2em]">
                  {item.ctaLabel || "Explore"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Rosy Edit */}
      {rosyEdit?.active && <section
        id="rosy-edit"
        className="scroll-mt-[110px] grid lg:grid-cols-2"
      >
        <div className="relative min-h-[560px] overflow-hidden bg-[#4c3931] lg:min-h-[720px]">
          <Image
            src={rosyEdit.image.signedUrl || "/images/rosy/rosy-edit.png"}
            alt={rosyEdit.heading || "Rosy Boutique editorial styling"}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="flex items-center bg-[#922f36] px-7 py-20 text-white sm:px-12 lg:px-20">
          <div className="max-w-[530px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">
              {rosyEdit.eyebrow}
            </p>

            <h2 className="font-display mt-5 text-6xl leading-[0.82] tracking-[-0.03em] sm:text-7xl lg:text-[90px]">
              {rosyEdit.heading}
            </h2>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/70">
              {rosyEdit.body}
            </p>

            <a
              href={safeContentHref(rosyEdit.ctaHref, "https://www.instagram.com/rosyboutiqueva/")}
              target={rosyEdit.ctaHref?.startsWith("https://") ? "_blank" : undefined}
              rel={rosyEdit.ctaHref?.startsWith("https://") ? "noreferrer" : undefined}
              className="mt-9 inline-block border-b border-white pb-1 text-[9px] font-semibold uppercase tracking-[0.2em]"
            >
              {rosyEdit.ctaLabel}
            </a>
          </div>
        </div>
      </section>}

      {/* Pop-Ups */}
      <section
        id="popups"
        className="scroll-mt-[110px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12"
      >
        <div className="mx-auto grid max-w-[1250px] items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#922f36]">
              Shop Rosy IRL
            </p>

            <h2 className="font-display mt-5 max-w-lg text-5xl leading-[0.95] tracking-[-0.025em] sm:text-6xl">
              Come see us at our next pop-up.
            </h2>

            <p className="mt-7 max-w-md text-sm leading-7 text-black/55">
              Meet Rosy, shop the collection in person, and see what&apos;s
              coming next.
            </p>

            <a
              href="https://www.instagram.com/rosyboutiqueva/"
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-block bg-[#1f1916] px-7 py-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#922f36]"
            >
              Follow For Pop-Up Updates
            </a>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#eee4da] sm:min-h-[600px]">
            {/* Actual Rosy pop-up */}
            <div className="absolute left-[6%] top-[6%] h-[80%] w-[64%] overflow-hidden shadow-xl">
              <Image
                src="/images/rosy/popup-main.png"
                alt="Rosy Boutique founder at an in-person pop-up"
                fill
                sizes="45vw"
                className="object-cover"
                style={{ objectPosition: "50% 45%" }}
              />
            </div>

            {/* Supporting product image */}
            <div className="absolute bottom-[6%] right-[5%] h-[48%] w-[39%] overflow-hidden border-[9px] border-[#fffdf9] bg-white shadow-xl">
              <Image
                src="/images/rosy/popup-02.png"
                alt="Rosy Boutique clothing display"
                fill
                sizes="28vw"
                className="object-cover"
                style={{ objectPosition: "50% 40%" }}
              />
            </div>

            <div className="absolute bottom-[9%] left-[9%] z-10 bg-[#fffdf9] px-6 py-5 shadow-lg">
              <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-[#922f36]">
                Based in
              </p>

              <p className="font-display mt-1 text-2xl">
                Arlington, VA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="border-t border-black/[0.07] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#922f36]">
              Find us on Instagram
            </p>

            <h2 className="font-display mt-3 text-5xl sm:text-6xl">
              @rosyboutiqueva
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
            {instagramTiles.map((image, index) => (
              <a
                href="https://www.instagram.com/rosyboutiqueva/"
                target="_blank"
                rel="noreferrer"
                key={image}
                className="group relative aspect-square overflow-hidden bg-[#e7ddd4]"
                aria-label={`View Rosy Boutique Instagram post ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Rosy Boutique Instagram look ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, 17vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <span className="translate-y-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    View Post
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#ead9d3] px-5 py-24 text-center sm:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#922f36]">
            Stay in the know
          </p>

          <h2 className="font-display mt-4 text-5xl leading-none sm:text-6xl">
            Be first to see the next drop.
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-black/50">
            New arrivals, pop-up announcements, and a little Rosy inspiration
            delivered straight to your inbox.
          </p>

          <form className="mx-auto mt-8 flex max-w-lg border-b border-black">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-black/35"
            />

            <button
              type="submit"
              className="px-3 text-[9px] font-semibold uppercase tracking-[0.2em]"
            >
              Join
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1d1816] px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="font-display text-5xl tracking-[0.16em] text-[#d8b2ad]">
                ROSY
              </p>

              <p className="mt-5 max-w-sm text-xs leading-6 text-white/45">
                Feminine, effortless style curated in Arlington, Virginia.
              </p>
            </div>

            <div>
              <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Shop
              </p>

              <div className="flex flex-col gap-3 text-xs text-white/75">
                <Link href="#new">
                  New Arrivals
                </Link>

                <Link href="/shop">
                  Dresses
                </Link>

                <Link href="/shop">
                  Tops
                </Link>

                <Link href="/shop">
                  Sets
                </Link>
              </div>
            </div>

            <div>
              <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Rosy
              </p>

              <div className="flex flex-col gap-3 text-xs text-white/75">
                <Link href="#rosy-edit">
                  The Rosy Edit
                </Link>

                <Link href="#popups">
                  Pop-Ups
                </Link>

                <a
                  href="https://www.instagram.com/rosyboutiqueva/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>

                <Link href="#">
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-6 text-[8px] uppercase tracking-[0.18em] text-white/30 sm:flex-row sm:justify-between">
            <p>© 2026 Rosy Boutique</p>
            <p>Arlington, Virginia</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
