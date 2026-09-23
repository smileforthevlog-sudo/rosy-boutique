"use client";

import { ChangeEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { HomepageItem, HomepageSection } from "@/lib/homepage/types";
import { isSafeContentHref } from "@/lib/homepage/types";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 8 * 1024 * 1024;

type PendingImage = { file: File; previewUrl: string };

type EditorProps = { initialSections: HomepageSection[] };

function sectionFallback(sectionKey: string) {
  return sectionKey === "homepage-rosy-edit" ? "/images/rosy/rosy-edit.png" : null;
}

function itemFallback(key: string) {
  return {
    dresses: "/images/rosy/category-dresses.png",
    "tops-sets": "/images/rosy/category-tops.png",
    "rosy-edit-card": "/images/rosy/category-edit.png",
  }[key] || null;
}

export default function AdminHomepageEditor({ initialSections }: EditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [pendingImages, setPendingImages] = useState<Record<string, PendingImage>>({});
  const [clearedImages, setClearedImages] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  function setSection(id: string, updates: Partial<HomepageSection>) {
    setSections((current) => current.map((section) => section.id === id ? { ...section, ...updates } : section));
  }

  function setItem(sectionId: string, itemId: string, updates: Partial<HomepageItem>) {
    setSections((current) => current.map((section) => section.id === sectionId ? { ...section, items: section.items.map((item) => item.id === itemId ? { ...item, ...updates } : item) } : section));
  }

  function moveItem(sectionId: string, itemId: string, direction: -1 | 1) {
    setSections((current) => current.map((section) => {
      if (section.id !== sectionId) return section;
      const index = section.items.findIndex((item) => item.id === itemId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= section.items.length) return section;
      const items = [...section.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...section, items: items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 })) };
    }));
  }

  function chooseImage(key: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!acceptedTypes.includes(file.type) || file.size > maxImageSize) {
      setMessage("Use a JPG, PNG, or WebP image under 8 MB. HEIC/HEIF is not supported.");
      return;
    }
    setPendingImages((current) => ({ ...current, [key]: { file, previewUrl: URL.createObjectURL(file) } }));
    setClearedImages((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    event.target.value = "";
  }

  function clearImage(key: string) {
    setPendingImages((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setClearedImages((current) => new Set(current).add(key));
  }

  async function saveImage(owner: { id: string; imagePath: string | null }, key: string) {
    const pending = pendingImages[key];
    if (!pending && clearedImages.has(key)) return { path: null, oldPath: owner.imagePath };
    if (!pending) return owner.imagePath;
    const supabase = createSupabaseBrowserClient();
    const safeName = pending.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `homepage/${owner.id}/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("site-media").upload(path, pending.file, { contentType: pending.file.type, upsert: false });
    if (upload.error) throw new Error(upload.error.message);
    return { path, oldPath: owner.imagePath };
  }

  async function saveCard(section: HomepageSection, item: HomepageItem) {
    const key = `item-${item.id}`;
    if (!isSafeContentHref(item.ctaHref)) {
      setMessage("Use an internal path or an HTTPS CTA destination.");
      return;
    }
    setSaving(key);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const nextImage = await saveImage({ id: item.id, imagePath: item.image.path }, key);
      const imagePath = typeof nextImage === "string" || nextImage === null ? nextImage : nextImage.path;
      const results = await Promise.all(section.items.map((sectionItem, index) =>
        supabase.from("homepage_section_items").update({
          eyebrow: sectionItem.eyebrow,
          title: sectionItem.title.trim(),
          subtitle: sectionItem.subtitle,
          cta_label: sectionItem.ctaLabel,
          cta_href: sectionItem.ctaHref,
          image_path: sectionItem.id === item.id ? imagePath : sectionItem.image.path,
          active: sectionItem.active,
          sort_order: (index + 1) * 10,
        }).eq("id", sectionItem.id),
      ));
      const error = results.find((result) => result.error)?.error || null;
      if (error) {
        if (typeof nextImage !== "string" && nextImage?.path) await supabase.storage.from("site-media").remove([nextImage.path]);
        throw new Error(error.code === "23505" ? "This card title is already used in this section." : error.message);
      }
      if (typeof nextImage !== "string" && nextImage?.oldPath) await supabase.storage.from("site-media").remove([nextImage.oldPath]);
      setPendingImages((current) => { const next = { ...current }; delete next[key]; return next; });
      setClearedImages((current) => { const next = new Set(current); next.delete(key); return next; });
      setMessage(`${item.title} saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save card.");
    } finally {
      setSaving(null);
    }
  }

  async function saveFeature(section: HomepageSection) {
    const key = `section-${section.id}`;
    if (!isSafeContentHref(section.ctaHref)) {
      setMessage("Use an internal path or an HTTPS CTA destination.");
      return;
    }
    setSaving(key);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const nextImage = await saveImage({ id: section.id, imagePath: section.image.path }, key);
      const imagePath = typeof nextImage === "string" || nextImage === null ? nextImage : nextImage.path;
      const { error } = await supabase.from("homepage_sections").update({
        eyebrow: section.eyebrow,
        heading: section.heading,
        body: section.body,
        cta_label: section.ctaLabel,
        cta_href: section.ctaHref,
        image_path: imagePath,
        active: section.active,
        sort_order: section.sortOrder,
      }).eq("id", section.id);
      if (error) {
        if (typeof nextImage !== "string" && nextImage?.path) await supabase.storage.from("site-media").remove([nextImage.path]);
        throw new Error(error.message);
      }
      if (typeof nextImage !== "string" && nextImage?.oldPath) await supabase.storage.from("site-media").remove([nextImage.oldPath]);
      setPendingImages((current) => { const next = { ...current }; delete next[key]; return next; });
      setClearedImages((current) => { const next = new Set(current); next.delete(key); return next; });
      setMessage("Rosy Edit feature saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save feature.");
    } finally {
      setSaving(null);
    }
  }

  function imagePreview(path: string | null, pendingKey: string, fallback: string | null) {
    return pendingImages[pendingKey]?.previewUrl || sections.find((section) => section.image.path === path)?.image.signedUrl || fallback;
  }

  const cards = sections.find((section) => section.key === "homepage-editorial-cards");
  const feature = sections.find((section) => section.key === "homepage-rosy-edit");

  return <div className="space-y-8">
    <div className="flex flex-wrap gap-2">
      {Object.keys(pendingImages).length > 0 && <button type="button" onClick={() => Object.keys(pendingImages).forEach(clearImage)} className="admin-action">Clear selected uploads</button>}
      {cards && <button type="button" onClick={() => cards.items.forEach((item) => clearImage(`item-${item.id}`))} className="admin-action">Clear card images</button>}
      {feature && <button type="button" onClick={() => clearImage(`section-${feature.id}`)} className="admin-action">Clear feature image</button>}
    </div>
    {message && <p role="status" className="admin-panel text-sm text-[var(--burgundy)]">{message}</p>}
    {cards && <section className="admin-panel"><div className="mb-6"><p className="admin-eyebrow">Homepage</p><h1 className="admin-heading">Editorial cards</h1><p className="mt-2 text-sm text-black/50">These three panels keep the current homepage composition while making their content editable.</p></div><div className="space-y-5">{cards.items.map((item, index) => <article key={item.id} className="border border-black/10 p-4"><div className="grid gap-5 lg:grid-cols-[150px_1fr]"><div><div className="relative aspect-[4/5] overflow-hidden bg-[#eee5dd]"><img src={imagePreview(item.image.path, `item-${item.id}`, item.image.signedUrl || itemFallback(item.title)) || ""} alt={item.title} className="h-full w-full object-cover" /></div><label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center border border-dashed border-[var(--burgundy)] px-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--burgundy)]">Change image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(`item-${item.id}`, event)} className="sr-only" /></label></div><div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><label className="admin-label">Eyebrow<input value={item.eyebrow || ""} onChange={(event) => setItem(cards.id, item.id, { eyebrow: event.target.value })} className="admin-input" /></label><label className="admin-label">Title<input value={item.title} onChange={(event) => setItem(cards.id, item.id, { title: event.target.value })} className="admin-input" /></label></div><label className="admin-label">Subtitle<input value={item.subtitle || ""} onChange={(event) => setItem(cards.id, item.id, { subtitle: event.target.value })} className="admin-input" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="admin-label">CTA label<input value={item.ctaLabel || ""} onChange={(event) => setItem(cards.id, item.id, { ctaLabel: event.target.value })} className="admin-input" /></label><label className="admin-label">CTA destination<input value={item.ctaHref || ""} onChange={(event) => setItem(cards.id, item.id, { ctaHref: event.target.value })} className="admin-input" placeholder="/shop or https://..." /></label></div><div className="flex flex-wrap items-center gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={item.active} onChange={(event) => setItem(cards.id, item.id, { active: event.target.checked })} className="h-5 w-5 accent-[var(--burgundy)]" /> Active</label><button type="button" onClick={() => moveItem(cards.id, item.id, -1)} disabled={index === 0} className="admin-action disabled:opacity-30">Move left</button><button type="button" onClick={() => moveItem(cards.id, item.id, 1)} disabled={index === cards.items.length - 1} className="admin-action disabled:opacity-30">Move right</button><button type="button" onClick={() => saveCard(cards, item)} disabled={saving === `item-${item.id}`} className="admin-button">{saving === `item-${item.id}` ? "Saving" : "Save card"}</button></div></div></div></article>)}</div></section>}
    {feature && <section className="admin-panel"><div className="mb-6"><p className="admin-eyebrow">Homepage</p><h2 className="admin-heading">Rosy Edit feature</h2><p className="mt-2 text-sm text-black/50">Edit the content of the existing split image and burgundy-panel feature.</p></div><div className="grid gap-6 lg:grid-cols-[240px_1fr]"><div><div className="relative aspect-[3/4] overflow-hidden bg-[#eee5dd]"><img src={imagePreview(feature.image.path, `section-${feature.id}`, feature.image.signedUrl || sectionFallback(feature.key)) || ""} alt={feature.heading || "Rosy Edit"} className="h-full w-full object-cover" /></div><label className="mt-3 flex min-h-11 cursor-pointer items-center justify-center border border-dashed border-[var(--burgundy)] px-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--burgundy)]">Change image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(`section-${feature.id}`, event)} className="sr-only" /></label></div><div className="space-y-4"><label className="admin-label">Eyebrow<input value={feature.eyebrow || ""} onChange={(event) => setSection(feature.id, { eyebrow: event.target.value })} className="admin-input" /></label><label className="admin-label">Heading<input value={feature.heading || ""} onChange={(event) => setSection(feature.id, { heading: event.target.value })} className="admin-input" /></label><label className="admin-label">Body<textarea value={feature.body || ""} onChange={(event) => setSection(feature.id, { body: event.target.value })} className="admin-input min-h-28 resize-y" rows={4} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="admin-label">CTA label<input value={feature.ctaLabel || ""} onChange={(event) => setSection(feature.id, { ctaLabel: event.target.value })} className="admin-input" /></label><label className="admin-label">CTA destination<input value={feature.ctaHref || ""} onChange={(event) => setSection(feature.id, { ctaHref: event.target.value })} className="admin-input" /></label></div><div className="flex flex-wrap items-center gap-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={feature.active} onChange={(event) => setSection(feature.id, { active: event.target.checked })} className="h-5 w-5 accent-[var(--burgundy)]" /> Active</label><button type="button" onClick={() => saveFeature(feature)} disabled={saving === `section-${feature.id}`} className="admin-button">{saving === `section-${feature.id}` ? "Saving" : "Save feature"}</button></div></div></div></section>}
  </div>;
}
