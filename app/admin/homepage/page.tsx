import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminHomepageEditor from "@/components/AdminHomepageEditor";
import { getAdminHomepageSections } from "@/lib/homepage/queries";
import { requireRole } from "@/lib/auth/admin";

export const metadata = {
  title: "Homepage | Rosy Boutique Admin",
};

export default async function AdminHomepagePage() {
  const staff = await requireRole(["owner", "admin"]);
  const sections = await getAdminHomepageSections();

  return (
    <main className="admin-page">
      <AdminHeader role={staff.role} />

      <section className="admin-content admin-cms-width">
        <header className="admin-page-header admin-editor-header">
          <div>
            <Link href="/admin" className="admin-back-link">
              ← Dashboard
            </Link>
            <p className="admin-eyebrow mt-5">Visual merchandising</p>
            <h1 className="admin-page-title">Homepage</h1>
            <p className="admin-page-copy">
              Shape what shoppers see first without changing the storefront
              layout.
            </p>
          </div>

          <Link href="/" className="admin-action">
            Preview store ↗
          </Link>
        </header>

        <AdminHomepageEditor initialSections={sections} />
      </section>
    </main>
  );
}