import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminProductForm from "@/components/AdminProductForm";
import { requireActiveStaff } from "@/lib/auth/admin";
import { getAdminCategories } from "@/lib/admin/catalog";

export const metadata = {
  title: "New Product | Rosy Boutique Admin",
};

export default async function NewProductPage() {
  const staff = await requireActiveStaff();
  const categories = await getAdminCategories();

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content admin-editor-width">
        <header className="admin-page-header admin-editor-header">
          <div>
            <Link href="/admin/products" className="admin-back-link">
              ← Products
            </Link>
            <p className="admin-eyebrow mt-5">New catalog piece</p>
            <h1 className="admin-page-title">New product</h1>
            <p className="admin-page-copy">
              Add the details, sizes, inventory, and photography your shoppers
              will see.
            </p>
          </div>
        </header>

        <AdminProductForm categories={categories} role={staff.role} />
      </section>
    </main>
  );
}