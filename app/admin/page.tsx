import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import { requireActiveStaff } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/admin/catalog";

export const metadata = {
  title: "Admin | Rosy Boutique",
};

export default async function AdminPage() {
  const staff = await requireActiveStaff();
  const products = await getAdminProducts();
  const publishedCount = products.filter((product) => product.status === "published").length;
  const draftCount = products.filter((product) => product.status === "draft").length;
  const soldOutCount = products.filter((product) => product.availability_status === "sold_out" || product.inventory_quantity <= 0).length;
  const lowStockCount = products.filter((product) => product.inventory_quantity > 0 && product.inventory_quantity <= 3).length;

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <AdminHeader role={staff.role} />

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--burgundy)]">Collection control</p>
          <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">Your products, at a glance.</h1>
          <p className="mt-5 text-sm leading-7 text-black/55">A calm place to keep the collection current from your phone.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="admin-panel"><p className="admin-eyebrow">Published</p><p className="admin-stat">{publishedCount}</p></div><div className="admin-panel"><p className="admin-eyebrow">Drafts</p><p className="admin-stat">{draftCount}</p></div><div className="admin-panel"><p className="admin-eyebrow">Sold out</p><p className="admin-stat">{soldOutCount}</p></div><div className="admin-panel"><p className="admin-eyebrow">Low stock</p><p className="admin-stat">{lowStockCount}</p></div></div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/products/new" className="admin-button">Add product</Link><Link href="/admin/products" className="admin-action">Manage products</Link>{staff.role !== "editor" && <><Link href="/admin/categories" className="admin-action">Manage categories</Link><Link href="/admin/homepage" className="admin-action">Homepage content</Link></>}<Link href="/" className="admin-action">View store</Link></div>
        <section className="mt-12"><div className="mb-4 flex items-end justify-between"><div><p className="admin-eyebrow">Recent products</p><h2 className="admin-heading">Latest changes</h2></div><Link href="/admin/products" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">View all</Link></div><div className="space-y-3">{products.slice(0, 5).map((product) => <Link href={`/admin/products/${product.id}`} key={product.id} className="admin-panel flex items-center justify-between gap-4 transition hover:border-[var(--burgundy)]"><div><h3 className="font-display text-2xl">{product.title}</h3><p className="mt-1 text-xs text-black/45">{product.category_name || "Uncategorized"} · {product.status}</p></div><span className="text-xs text-black/45">${(product.price_cents / 100).toFixed(2)}</span></Link>)}</div></section>
      </section>
    </main>
  );
}