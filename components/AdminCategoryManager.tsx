"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminCategory } from "@/lib/admin/catalog";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminCategoryManager({
  initialCategories,
  canManage,
}: {
  initialCategories: AdminCategory[];
  canManage: boolean;
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage || !name.trim()) return;
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("categories").insert({ name: name.trim(), slug: slugify(name), sort_order: categories.length * 10 }).select("id, name, slug, description, sort_order, active, created_at, updated_at").single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setCategories((current) => [...current, data]);
    setName("");
    setMessage("Category created.");
  }

  async function updateCategory(category: AdminCategory, updates: Partial<AdminCategory>) {
    if (!canManage) return;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("categories").update(updates).eq("id", category.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCategories((current) => current.map((item) => item.id === category.id ? { ...item, ...updates } : item));
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <section className="space-y-3">{categories.map((category) => <article key={category.id} className="admin-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0 flex-1"><input aria-label={`Name for ${category.name}`} value={category.name} disabled={!canManage} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))} onBlur={(event) => updateCategory(category, { name: event.target.value.trim(), slug: slugify(event.target.value) })} className="w-full bg-transparent font-display text-2xl outline-none" /><p className="mt-1 text-xs text-black/45">/{category.slug} · Sort {category.sort_order}</p></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={category.active} disabled={!canManage} onChange={(event) => updateCategory(category, { active: event.target.checked })} className="h-5 w-5 accent-[var(--burgundy)]" /> Active</label><input aria-label={`Sort order for ${category.name}`} value={category.sort_order} disabled={!canManage} onChange={(event) => updateCategory(category, { sort_order: Number(event.target.value) })} onBlur={(event) => updateCategory(category, { sort_order: Number(event.target.value) })} className="admin-input w-20" type="number" min="0" /></div></article>)}</section>
    <section className="admin-panel h-fit"><p className="admin-eyebrow">Catalog structure</p><h2 className="admin-heading">New category</h2>{canManage ? <form onSubmit={addCategory} className="mt-5 space-y-4"><label className="admin-label">Name<input value={name} onChange={(event) => setName(event.target.value)} className="admin-input" required /></label><button className="admin-button w-full">Add category</button>{message && <p role="status" className="text-sm text-[var(--burgundy)]">{message}</p>}</form> : <p className="mt-4 text-sm text-black/50">Editors can manage products, but not categories.</p>}</section>
  </div>;
}
