import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminProductList from "@/components/AdminProductList";
import { requireActiveStaff } from "@/lib/auth/admin";
import { getAdminProducts } from "@/lib/admin/catalog";

export const metadata = { title: "Products | Rosy Boutique Admin" };

export default async function AdminProductsPage() {
  const staff = await requireActiveStaff();
  const products = await getAdminProducts();
  return <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]"><AdminHeader role={staff.role} /><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14"><div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="admin-eyebrow">Catalog control</p><h1 className="font-display mt-3 text-5xl leading-none">Products</h1></div><Link href="/admin/products/new" className="admin-button">Add product</Link></div><AdminProductList initialProducts={products} role={staff.role} /></section></main>;
}