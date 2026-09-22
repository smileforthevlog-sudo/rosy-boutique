"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  inventory_quantity: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  updated_at: string;
};

export function AdminProductManager({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    const form = new FormData(event.currentTarget);
    const status = form.get("status") === "published" ? "published" : "draft";

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("products")
        .insert({
          title: String(form.get("title")),
          slug: String(form.get("slug")),
          price_cents: Math.round(Number(form.get("price")) * 100),
          inventory_quantity: Number(form.get("inventory")),
          status,
          short_description: String(form.get("short_description") || "") || null,
        })
        .select("id, title, slug, price_cents, inventory_quantity, status, featured, updated_at")
        .single();

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data) setProducts((current) => [data, ...current]);
      event.currentTarget.reset();
      setMessage("Product saved as a draft.");
    } catch {
      setMessage("Supabase is not configured for this environment yet.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="order-2 border border-black/10 bg-[var(--paper)] p-5 sm:p-7 xl:order-1">
        <div className="flex items-end justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--burgundy)]">Catalog</p>
            <h2 className="font-display mt-2 text-3xl">Products</h2>
          </div>
          <span className="text-xs text-black/45">{products.length} total</span>
        </div>
        <div className="divide-y divide-black/10">
          {products.length === 0 ? (
            <p className="py-10 text-sm text-black/50">No database products yet. The local storefront remains available while you connect Supabase.</p>
          ) : products.map((product) => (
            <article key={product.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-2xl">{product.title}</h3>
                <p className="mt-1 text-xs text-black/45">/{product.slug} · ${(product.price_cents / 100).toFixed(2)} · {product.inventory_quantity} in stock</p>
              </div>
              <span className={`self-start px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] ${product.status === "published" ? "bg-[#e7efe7] text-[#315b39]" : "bg-[#f1e8df] text-black/55"}`}>
                {product.status}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="order-1 border border-black/10 bg-[var(--paper)] p-5 sm:p-7 xl:order-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--burgundy)]">Quick add</p>
        <h2 className="font-display mt-2 text-3xl">New product</h2>
        <form onSubmit={createProduct} className="mt-6 space-y-4">
          <input required name="title" placeholder="Product title" className="admin-input" />
          <input required name="slug" placeholder="product-slug" pattern="[a-z0-9-]+" className="admin-input" />
          <div className="grid grid-cols-2 gap-3">
            <input required name="price" type="number" min="0" step="0.01" placeholder="Price" className="admin-input" />
            <input required name="inventory" type="number" min="0" step="1" placeholder="Inventory" className="admin-input" />
          </div>
          <textarea name="short_description" placeholder="Short description" rows={3} className="admin-input resize-y py-3" />
          <select name="status" defaultValue="draft" className="admin-input">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button disabled={isSaving} className="min-h-12 w-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--burgundy)] disabled:opacity-60">
            {isSaving ? "Saving" : "Save product"}
          </button>
          {message && <p className="text-sm text-[var(--burgundy)]">{message}</p>}
        </form>
      </section>
    </div>
  );
}