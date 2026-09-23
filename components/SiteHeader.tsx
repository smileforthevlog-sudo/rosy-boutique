"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

type SiteHeaderProps = {
  variant?: "home" | "product";
};

export default function SiteHeader({
  variant = "home",
}: SiteHeaderProps) {
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="bg-[#922f36] px-4 py-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-white sm:text-[10px]">
        Based in Arlington, VA · Shop online + find us at pop-ups
      </div>

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fffdf9]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:h-[84px] lg:px-12">
          <div className="flex flex-1 items-center">
            {variant === "product" ? (
              <Link
                href="/shop"
                className="text-[9px] font-semibold uppercase tracking-[0.18em] transition hover:text-[#922f36]"
              >
                ← Back to Shop
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open navigation"
                  aria-expanded={menuOpen}
                  className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
                >
                  <span className="h-px w-5 bg-black" />
                  <span className="h-px w-5 bg-black" />
                </button>

                <nav className="hidden items-center gap-7 lg:flex">
                  <Link
                    href="/#new"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-[#922f36]"
                  >
                    New Arrivals
                  </Link>

                  <Link
                    href="/shop"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-[#922f36]"
                  >
                    Shop
                  </Link>

                  <Link
                    href="/#rosy-edit"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-[#922f36]"
                  >
                    Rosy Edit
                  </Link>

                  <Link
                    href="/#popups"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-[#922f36]"
                  >
                    Pop-Ups
                  </Link>
                </nav>
              </>
            )}
          </div>

          <Link
            href="/"
            className="font-display text-[34px] font-medium leading-none tracking-[0.18em] text-[#922f36] sm:text-[38px]"
          >
            ROSY
          </Link>

          <div className="flex flex-1 items-center justify-end gap-6">
            {variant === "home" && (
              <button className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] lg:block">
                Search
              </button>
            )}

            <button
              type="button"
              onClick={openCart}
              className="flex min-h-11 items-center text-[10px] font-semibold uppercase tracking-[0.16em] transition hover:text-[#922f36]"
            >
              Bag
              <span className="ml-1 text-[#922f36]">
                ({cartCount})
              </span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && variant === "home" && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[86%] max-w-[390px] flex-col bg-[#fffdf9] shadow-2xl">
            <div className="flex h-[82px] items-center justify-between border-b border-black/10 px-6">
              <Link
                href="/"
                onClick={closeMenu}
                className="font-display text-3xl tracking-[0.18em] text-[#922f36]"
              >
                ROSY
              </Link>

              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation"
                className="flex h-10 w-10 items-center justify-center text-3xl font-light"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col px-6 py-10">
              <Link
                href="/#new"
                onClick={closeMenu}
                className="border-b border-black/10 py-5 font-display text-3xl"
              >
                New Arrivals
              </Link>

              <Link
                href="/shop"
                onClick={closeMenu}
                className="border-b border-black/10 py-5 font-display text-3xl"
              >
                Shop
              </Link>

              <Link
                href="/#rosy-edit"
                onClick={closeMenu}
                className="border-b border-black/10 py-5 font-display text-3xl"
              >
                The Rosy Edit
              </Link>

              <Link
                href="/#popups"
                onClick={closeMenu}
                className="border-b border-black/10 py-5 font-display text-3xl"
              >
                Pop-Ups
              </Link>

              <a
                href="https://www.instagram.com/rosyboutiqueva/"
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className="border-b border-black/10 py-5 font-display text-3xl"
              >
                Instagram
              </a>
            </nav>

            <div className="mt-auto bg-[#f3ebe4] px-6 py-7">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#922f36]">
                Rosy Boutique
              </p>

              <p className="font-display mt-2 text-2xl">
                Arlington, Virginia
              </p>

              <p className="mt-2 text-xs leading-5 text-black/45">
                Shop online and follow along for upcoming local pop-ups.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
