import AdminHeader from "@/components/AdminHeader";
import AdminCategoryManager from "@/components/AdminCategoryManager";
import { requireRole } from "@/lib/auth/admin";
import { getAdminCategories } from "@/lib/admin/catalog";

export const metadata = { title: "Categories | Rosy Boutique Admin" };

export default async function AdminCategoriesPage() {
  const staff = await requireRole(["owner", "admin"]);
  const categories = await getAdminCategories();
  return <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]"><AdminHeader role={staff.role} /><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14"><div className="mb-8"><p className="admin-eyebrow">Catalog structure</p><h1 className="font-display mt-3 text-5xl leading-none">Categories</h1><p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Keep the collection easy to browse. Deactivate categories instead of deleting referenced records.</p></div><AdminCategoryManager initialCategories={categories} canManage /></section></main>;
}