import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminProductList from "@/components/AdminProductList";
import { requireActiveStaff } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/admin/catalog";

export const metadata = {
  title: "Products | Rosy Boutique Admin",
};

export default async function AdminProductsPage() {
  const staff = await requireActiveStaff();
  const products = await getAdminProducts();

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Catalog control</p>
            <h1 className="admin-page-title">Products</h1>
            <p className="admin-page-copy">
              Search, review inventory, and keep every Rosy piece current.
            </p>
          </div>

          <Link href="/admin/products/new" className="admin-button">
            <span aria-hidden="true">＋</span>
            Add product
          </Link>
        </header>

        <AdminProductList initialProducts={products} role={staff.role} />
      </section>
    </main>
  );
}