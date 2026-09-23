import Image from "next/image";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { requireActiveStaff } from "@/lib/auth/admin";
import {
  getAdminProducts,
  type AdminProduct,
} from "@/lib/admin/catalog";

export const metadata = {
  title: "Admin | Rosy Boutique",
};

function inventoryForProduct(product: AdminProduct) {
  if (product.variants.length > 0) {
    return product.variants
      .filter((variant) => variant.active)
      .reduce((sum, variant) => sum + variant.inventory_quantity, 0);
  }

  return product.inventory_quantity;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const staff = await requireActiveStaff();
  const products = await getAdminProducts();

  const publishedCount = products.filter(
    (product) => product.status === "published",
  ).length;

  const draftCount = products.filter(
    (product) => product.status === "draft",
  ).length;

  const soldOutCount = products.filter(
    (product) =>
      product.availability_status === "sold_out" ||
      inventoryForProduct(product) <= 0,
  ).length;

  const totalInventory = products.reduce(
    (sum, product) => sum + inventoryForProduct(product),
    0,
  );

  const lowStockItems = products
    .flatMap((product) => {
      if (product.variants.length > 0) {
        return product.variants
          .filter(
            (variant) =>
              variant.active &&
              variant.inventory_quantity > 0 &&
              variant.inventory_quantity <= 3,
          )
          .map((variant) => ({
            productId: product.id,
            productTitle: product.title,
            detail: variant.name,
            quantity: variant.inventory_quantity,
          }));
      }

      const inventory = inventoryForProduct(product);

      return inventory > 0 && inventory <= 3
        ? [
            {
              productId: product.id,
              productTitle: product.title,
              detail: "Product inventory",
              quantity: inventory,
            },
          ]
        : [];
    })
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 6);

  const recentProducts = products.slice(0, 5);

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Collection control</p>
            <h1 className="admin-page-title">
              Good to see you.
              <span>Here&apos;s what needs attention.</span>
            </h1>
            <p className="admin-page-copy">
              Keep Rosy current from your phone or desktop without digging
              through the storefront.
            </p>
          </div>

          <Link href="/admin/products/new" className="admin-button">
            <span aria-hidden="true">＋</span>
            Add product
          </Link>
        </header>

        <div className="admin-kpi-grid">
          <article className="admin-kpi-card admin-kpi-primary">
            <p className="admin-kpi-label">Published</p>
            <p className="admin-kpi-value">{publishedCount}</p>
            <p className="admin-kpi-note">Live in the shop</p>
          </article>

          <article className="admin-kpi-card">
            <p className="admin-kpi-label">Drafts</p>
            <p className="admin-kpi-value">{draftCount}</p>
            <p className="admin-kpi-note">Waiting for review</p>
          </article>

          <article className="admin-kpi-card">
            <p className="admin-kpi-label">Sold out</p>
            <p className="admin-kpi-value">{soldOutCount}</p>
            <p className="admin-kpi-note">Needs inventory attention</p>
          </article>

          <article className="admin-kpi-card">
            <p className="admin-kpi-label">Active inventory</p>
            <p className="admin-kpi-value">{totalInventory}</p>
            <p className="admin-kpi-note">Units across the catalog</p>
          </article>
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-surface">
            <div className="admin-surface-heading">
              <div>
                <p className="admin-eyebrow">Inventory watch</p>
                <h2 className="admin-heading">Low stock</h2>
              </div>
              <span className="admin-count-badge">{lowStockItems.length}</span>
            </div>

            {lowStockItems.length > 0 ? (
              <div className="admin-attention-list">
                {lowStockItems.map((item) => (
                  <Link
                    href={`/admin/products/${item.productId}`}
                    key={`${item.productId}-${item.detail}`}
                    className="admin-attention-row"
                  >
                    <div>
                      <p className="admin-attention-title">
                        {item.productTitle}
                      </p>
                      <p className="admin-attention-meta">{item.detail}</p>
                    </div>

                    <div className="admin-stock-count">
                      <strong>{item.quantity}</strong>
                      <span>left</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state">
                <span aria-hidden="true">✓</span>
                <div>
                  <p>Inventory looks healthy.</p>
                  <span>No low-stock items right now.</span>
                </div>
              </div>
            )}
          </section>

          <section className="admin-surface admin-quick-panel">
            <div className="admin-surface-heading">
              <div>
                <p className="admin-eyebrow">Shortcuts</p>
                <h2 className="admin-heading">Quick actions</h2>
              </div>
            </div>

            <div className="admin-quick-actions">
              <Link href="/admin/products/new" className="admin-quick-action">
                <span className="admin-quick-number">01</span>
                <span>
                  <strong>Add product</strong>
                  <small>Create a new piece</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="/admin/products" className="admin-quick-action">
                <span className="admin-quick-number">02</span>
                <span>
                  <strong>Manage catalog</strong>
                  <small>Products & inventory</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>

              {staff.role !== "editor" && (
                <>
                  <Link href="/admin/homepage" className="admin-quick-action">
                    <span className="admin-quick-number">03</span>
                    <span>
                      <strong>Edit homepage</strong>
                      <small>Update merchandising</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link href="/admin/categories" className="admin-quick-action">
                    <span className="admin-quick-number">04</span>
                    <span>
                      <strong>Categories</strong>
                      <small>Organize the collection</small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>

        <section className="admin-surface admin-recent-section">
          <div className="admin-surface-heading">
            <div>
              <p className="admin-eyebrow">Catalog activity</p>
              <h2 className="admin-heading">Recent products</h2>
            </div>

            <Link href="/admin/products" className="admin-text-link">
              View all →
            </Link>
          </div>

          <div className="admin-recent-products">
            {recentProducts.map((product) => {
              const image = product.images[0];
              const inventory = inventoryForProduct(product);

              return (
                <Link
                  href={`/admin/products/${product.id}`}
                  key={product.id}
                  className="admin-recent-product"
                >
                  <div className="admin-recent-image">
                    {image?.signedUrl ? (
                      <Image
                        src={image.signedUrl}
                        alt={image.alt_text || product.title}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      <span aria-hidden="true">R</span>
                    )}
                  </div>

                  <div className="admin-recent-copy">
                    <div className="admin-recent-title-row">
                      <h3>{product.title}</h3>
                      <span className={`admin-status-dot ${product.status}`} />
                    </div>

                    <p>
                      {product.category_name || "Uncategorized"} ·{" "}
                      {inventory} units
                    </p>
                  </div>

                  <div className="admin-recent-meta">
                    <strong>${(product.price_cents / 100).toFixed(2)}</strong>
                    <span>{formatDate(product.updated_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}