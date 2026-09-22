import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminProductManager } from "@/components/AdminProductManager";
import { createSupabaseServerClient, getSupabaseUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin | Rosy Boutique",
};

export default async function AdminPage() {
  const user = await getSupabaseUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: staffProfile } = supabase
    ? await supabase.from("staff_profiles").select("role").eq("user_id", user.id).maybeSingle()
    : { data: null };

  if (!staffProfile) {
    redirect("/");
  }

  const { data } = supabase
    ? await supabase
        .from("products")
        .select("id, title, slug, price_cents, inventory_quantity, status, is_featured, updated_at")
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <header className="border-b border-black/10 bg-[var(--paper)]">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <div>
            <Link href="/" className="font-display text-3xl tracking-[0.16em] text-[var(--burgundy)]">
              ROSY
            </Link>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/40">Admin workspace</p>
          </div>
          <Link href="/" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/55 hover:text-[var(--burgundy)]">
            View store
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-10 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--burgundy)]">Collection control</p>
          <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">Your products, at a glance.</h1>
          <p className="mt-5 text-sm leading-7 text-black/55">Create the next Rosy drop, keep inventory current, and publish only when a product is ready.</p>
        </div>
        <AdminProductManager initialProducts={data ?? []} />
      </section>
    </main>
  );
}