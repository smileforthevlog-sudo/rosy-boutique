"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminProduct } from "@/lib/admin/catalog";

export default function AdminProductList({
  initialProducts,
  role,
}: {
  initialProducts: AdminProduct[];
  role: "owner" | "admin" | "editor";
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const canPublish = role !== "editor";

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !normalizedSearch || `${product.title} ${product.slug}`.toLowerCase().includes(normalizedSearch);
      const matchesStatus = status === "all" || product.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  async function changeStatus(product: AdminProduct, nextStatus: "published" | "draft" | "archived") {
    if (!canPublish && nextStatus !== "draft") return;
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("products").update({ status: nextStatus }).eq("id", product.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, status: nextStatus } : item));
    setMessage(`${product.title} is now ${nextStatus}.`);
  }

  return (
    <div>
      <div className="admin-panel mb-5 grid gap-3 sm:grid-cols-[1fr_180px]">
        <label className="admin-label">Search products<input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input" placeholder="Search title or slug" /></label>
        <label className="admin-label">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="admin-input"><option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      </div>
      {message && <p role="status" className="mb-4 text-sm text-[var(--burgundy)]">{message}</p>}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? <div className="admin-panel py-14 text-center"><h2 className="admin-heading">No products found.</h2><p className="mt-2 text-sm text-black/50">Try another search or create the next Rosy piece.</p></div> : filteredProducts.map((product) => {
          const image = product.images[0];
          const variantInventory = product.variants.length > 0 ? product.variants.reduce((sum, variant) => sum + (variant.active ? variant.inventory_quantity : 0), 0) : product.inventory_quantity;
          const availability = product.availability_status === "coming_soon" ? "Coming Soon" : product.availability_status === "sold_out" || variantInventory <= 0 ? "Sold Out" : "In Stock";
          return <article key={product.id} className="admin-panel flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#eee5dd]">{image?.signedUrl && <Image src={image.signedUrl} alt={image.alt_text || product.title} fill sizes="80px" className="object-cover" />}</div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-2xl">{product.title}</h2>{product.featured && <span className="admin-pill">Featured</span>}</div><p className="mt-1 text-xs text-black/50">{product.category_name || "Uncategorized"} · ${(product.price_cents / 100).toFixed(2)} · {variantInventory} units</p><div className="mt-3 flex flex-wrap gap-2 text-[9px] font-semibold uppercase tracking-[0.12em]"><span className="admin-pill">{product.status}</span><span className="admin-pill">{availability}</span></div></div>
            <div className="flex flex-wrap gap-2 sm:justify-end"><Link href={`/admin/products/${product.id}`} className="admin-action">Edit</Link>{canPublish && product.status === "draft" && <button type="button" onClick={() => changeStatus(product, "published")} className="admin-action admin-action-primary">Publish</button>}{canPublish && product.status === "published" && <button type="button" onClick={() => changeStatus(product, "draft")} className="admin-action">Unpublish</button>}{canPublish && product.status !== "archived" && <button type="button" onClick={() => changeStatus(product, "archived")} className="admin-action text-[var(--burgundy)]">Archive</button>}</div>
          </article>;
        })}
      </div>
    </div>
  );
}
