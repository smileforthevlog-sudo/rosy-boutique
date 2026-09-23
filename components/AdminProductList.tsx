"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminProduct } from "@/lib/admin/catalog";

type ProductStatus = "published" | "draft" | "archived";
type StatusFilter = "all" | ProductStatus;

function inventoryForProduct(product: AdminProduct) {
  if (product.variants.length > 0) {
    return product.variants
      .filter((variant) => variant.active)
      .reduce((sum, variant) => sum + variant.inventory_quantity, 0);
  }

  return product.inventory_quantity;
}

function availabilityLabel(product: AdminProduct, inventory: number) {
  if (product.availability_status === "coming_soon") return "Coming soon";
  if (product.availability_status === "sold_out" || inventory <= 0) {
    return "Sold out";
  }
  if (inventory <= 3) return "Low stock";
  return "In stock";
}

export default function AdminProductList({
  initialProducts,
  role,
}: {
  initialProducts: AdminProduct[];
  role: "owner" | "admin" | "editor";
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [message, setMessage] = useState("");
  const canPublish = role !== "editor";

  const counts = useMemo(
    () => ({
      all: products.length,
      published: products.filter((product) => product.status === "published")
        .length,
      draft: products.filter((product) => product.status === "draft").length,
      archived: products.filter((product) => product.status === "archived")
        .length,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const searchText = [
        product.title,
        product.slug,
        product.category_name || "",
        product.sku || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchText.includes(normalizedSearch);

      const matchesStatus =
        status === "all" || product.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  async function changeStatus(
    product: AdminProduct,
    nextStatus: ProductStatus,
  ) {
    if (!canPublish && nextStatus !== "draft") return;

    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("products")
      .update({ status: nextStatus })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setMessage(`${product.title} is now ${nextStatus}.`);
  }

  return (
    <div className="admin-product-list">
      <section className="admin-filter-surface">
        <label className="admin-search-field">
          <span className="admin-search-icon" aria-hidden="true">
            ⌕
          </span>
          <span className="sr-only">Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, categories, SKU..."
          />
        </label>

        <div className="admin-status-tabs" role="group" aria-label="Product status">
          {(["all", "published", "draft", "archived"] as StatusFilter[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={status === item ? "is-active" : ""}
                onClick={() => setStatus(item)}
              >
                <span>{item === "all" ? "All" : item}</span>
                <strong>{counts[item]}</strong>
              </button>
            ),
          )}
        </div>
      </section>

      {message && (
        <div className="admin-toast" role="status">
          <span className="admin-toast-dot" aria-hidden="true" />
          {message}
        </div>
      )}

      <div className="admin-products-grid">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty-products">
            <p className="admin-eyebrow">Nothing here yet</p>
            <h2 className="font-display">No products found.</h2>
            <p>
              Try another search or create the next piece for the collection.
            </p>
            <Link href="/admin/products/new" className="admin-button">
              Add product
            </Link>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const image = product.images[0];
            const inventory = inventoryForProduct(product);
            const availability = availabilityLabel(product, inventory);

            return (
              <article key={product.id} className="admin-product-card">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="admin-product-image"
                  aria-label={`Edit ${product.title}`}
                >
                  {image?.signedUrl ? (
                    <Image
                      src={image.signedUrl}
                      alt={image.alt_text || product.title}
                      fill
                      sizes="(max-width: 640px) 96px, 124px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="admin-product-placeholder">ROSY</span>
                  )}
                </Link>

                <div className="admin-product-card-body">
                  <div className="admin-product-card-top">
                    <div className="min-w-0">
                      <div className="admin-product-title-line">
                        <Link href={`/admin/products/${product.id}`}>
                          {product.title}
                        </Link>

                        {product.featured && (
                          <span className="admin-badge admin-badge-featured">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="admin-product-category">
                        {product.category_name || "Uncategorized"}
                      </p>
                    </div>

                    <strong className="admin-product-price">
                      ${(product.price_cents / 100).toFixed(2)}
                    </strong>
                  </div>

                  <div className="admin-product-details">
                    <div>
                      <span>Inventory</span>
                      <strong>{inventory}</strong>
                    </div>

                    <div>
                      <span>Availability</span>
                      <strong>{availability}</strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong className={`admin-status-text ${product.status}`}>
                        {product.status}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-product-actions">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="admin-action"
                    >
                      Edit product
                    </Link>

                    {canPublish && product.status === "draft" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(product, "published")}
                        className="admin-action admin-action-primary"
                      >
                        Publish
                      </button>
                    )}

                    {canPublish && product.status === "published" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(product, "draft")}
                        className="admin-action"
                      >
                        Unpublish
                      </button>
                    )}

                    {canPublish && product.status !== "archived" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(product, "archived")}
                        className="admin-action admin-action-danger"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}