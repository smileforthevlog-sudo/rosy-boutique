import AdminHeader from "@/components/AdminHeader";
import AdminCategoryManager from "@/components/AdminCategoryManager";
import { requireRole } from "@/lib/auth/admin";
import { getAdminCategories } from "@/lib/admin/catalog";

export const metadata = {
  title: "Categories | Rosy Boutique Admin",
};

export default async function AdminCategoriesPage() {
  const staff = await requireRole(["owner", "admin"]);
  const categories = await getAdminCategories();

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Catalog structure</p>
            <h1 className="admin-page-title">Categories</h1>
            <p className="admin-page-copy">
              Keep the collection easy to browse. Deactivate a category when
              you want to hide it without breaking product history.
            </p>
          </div>
        </header>

        <AdminCategoryManager initialCategories={categories} canManage />
      </section>
    </main>
  );
}