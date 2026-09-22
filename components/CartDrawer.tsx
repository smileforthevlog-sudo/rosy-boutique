"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function CartDrawer() {
  const {
    items,
    subtotal,
    isOpen,
    closeCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [checkoutMessage, setCheckoutMessage] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) {
    return null;
  }

  function formatPrice(priceCents: number) {
    return `$${(priceCents / 100).toFixed(2)}`;
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close shopping bag"
        onClick={closeCart}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[470px] flex-col bg-[#fffdf9] shadow-2xl">
        {/* Header */}
        <div className="flex h-[82px] items-center justify-between border-b border-black/10 px-6 sm:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#922f36]">
              Rosy Boutique
            </p>

            <h2 className="font-display mt-1 text-3xl">
              Your Bag
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center text-2xl font-light transition hover:text-[#922f36]"
            aria-label="Close bag"
          >
            ×
          </button>
        </div>

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-4xl">
              Your bag is empty.
            </p>

            <p className="mt-4 max-w-xs text-sm leading-6 text-black/45">
              Find something you love and add it to your Rosy collection.
            </p>

            <Link
              href="/#new"
              onClick={closeCart}
              className="mt-8 bg-[#1d1816] px-8 py-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#922f36]"
            >
              Shop New Arrivals
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="space-y-7">
                {items.map((item) => (
                  <div
                    key={`${item.slug}-${item.size}`}
                    className="grid grid-cols-[105px_1fr] gap-5 border-b border-black/10 pb-7"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="110px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex flex-col">
                      <div className="flex justify-between gap-4">
                        <div>
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-display text-xl leading-none transition hover:text-[#922f36]"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/40">
                            Size {item.size}
                          </p>
                        </div>

                        <p className="text-xs">
                          {formatPrice(item.price_cents)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-5">
                        <div className="flex items-center border border-black/15">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.slug, item.size)
                            }
                            className="flex h-8 w-8 items-center justify-center text-sm transition hover:bg-black/5"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>

                          <span className="flex h-8 min-w-8 items-center justify-center border-x border-black/15 text-[10px]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.slug, item.size)
                            }
                            className="flex h-8 w-8 items-center justify-center text-sm transition hover:bg-black/5"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.slug, item.size)
                          }
                          className="text-[8px] font-semibold uppercase tracking-[0.16em] text-black/40 underline underline-offset-4 transition hover:text-[#922f36]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t border-black/10 bg-[#f6efe8] px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  Subtotal
                </p>

                <p className="font-display text-2xl">
                  {formatPrice(subtotal)}
                </p>
              </div>

              <p className="mt-2 text-[9px] leading-5 text-black/40">
                Shipping and taxes calculated at checkout.
              </p>

              <button
                type="button"
                onClick={() => setCheckoutMessage(true)}
                className="mt-5 w-full bg-[#1d1816] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#922f36]"
              >
                Checkout
              </button>

              {checkoutMessage && (
                <p className="mt-4 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[#922f36]">
                  Checkout will be connected after the POC.
                </p>
              )}

              <button
                type="button"
                onClick={closeCart}
                className="mt-4 w-full text-[8px] font-semibold uppercase tracking-[0.18em] text-black/45 underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}