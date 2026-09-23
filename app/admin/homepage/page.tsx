import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminHomepageEditor from "@/components/AdminHomepageEditor";
import { getAdminHomepageSections } from "@/lib/homepage/queries";
import { requireRole } from "@/lib/auth/admin";

export const metadata = { title: "Homepage | Rosy Boutique Admin" };

export default async function AdminHomepagePage() {
  const staff = await requireRole(["owner", "admin"]);
  const sections = await getAdminHomepageSections();

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <AdminHeader role={staff.role} />
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-8">
          <Link href="/admin" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">← Dashboard</Link>
          <h1 className="font-display mt-5 text-5xl leading-none">Homepage content</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Edit the existing editorial cards and Rosy Edit feature without changing the storefront layout.</p>
        </div>
        <AdminHomepageEditor initialSections={sections} />
      </section>
    </main>
  );
}