import { notFound } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminProductForm from "@/components/AdminProductForm";
import { requireActiveStaff } from "@/lib/auth/admin";
import {
  getAdminCategories,
  getAdminProduct,
} from "@/lib/admin/catalog";

type ProductAdminPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductPage({
  params,
}: ProductAdminPageProps) {
  const staff = await requireActiveStaff();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content admin-editor-width">
        <header className="admin-page-header admin-editor-header">
          <div>
            <Link href="/admin/products" className="admin-back-link">
              ← Products
            </Link>
            <p className="admin-eyebrow mt-5">Catalog editor</p>
            <h1 className="admin-page-title">Edit product</h1>
            <p className="admin-page-copy">
              Update details, merchandising, inventory, and photography.
            </p>
          </div>

          <div className="admin-page-status">
            <span className={`admin-status-dot ${product.status}`} />
            {product.status}
          </div>
        </header>

        <AdminProductForm
          categories={categories}
          initialProduct={product}
          role={staff.role}
        />
      </section>
    </main>
  );
}