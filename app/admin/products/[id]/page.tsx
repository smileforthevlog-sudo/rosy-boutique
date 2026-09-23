import { notFound } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/AdminHeader";
import AdminProductForm from "@/components/AdminProductForm";
import { requireActiveStaff } from "@/lib/auth/admin";
import { getAdminCategories, getAdminProduct } from "@/lib/admin/catalog";

type ProductAdminPageProps = { params: Promise<{ id: string }> };

export default async function AdminProductPage({ params }: ProductAdminPageProps) {
  const staff = await requireActiveStaff();
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!product) notFound();
  return <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]"><AdminHeader role={staff.role} /><section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-14"><div className="mb-8"><Link href="/admin/products" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">← Products</Link><h1 className="font-display mt-5 text-5xl leading-none">Edit product</h1><p className="mt-3 text-sm text-black/50">Update details, variants, inventory, and photography.</p></div><AdminProductForm categories={categories} initialProduct={product} role={staff.role} /></section></main>;
}