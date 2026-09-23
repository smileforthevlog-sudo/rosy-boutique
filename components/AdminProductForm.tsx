"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminCategory, AdminProduct, AdminVariant } from "@/lib/admin/catalog";
import type { Database } from "@/lib/supabase/database.types";

const quickVariantNames = ["XS", "S", "M", "L", "XL", "One Size"];
type ProductStatus = Database["public"]["Enums"]["product_status"];
type Availability = Database["public"]["Enums"]["availability_status"];

type DraftVariant = AdminVariant & { id: string };
type NewImage = { file: File; previewUrl: string; altText: string };

type ProductFormProps = {
  categories: AdminCategory[];
  initialProduct?: AdminProduct | null;
  role: "owner" | "admin" | "editor";
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminProductForm({
  categories,
  initialProduct,
  role,
}: ProductFormProps) {
  const router = useRouter();
  const canPublish = role !== "editor";
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProduct));
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");
  const [price, setPrice] = useState(((initialProduct?.price_cents || 0) / 100).toFixed(2));
  const [compareAt, setCompareAt] = useState(
    initialProduct?.compare_at_price_cents
      ? (initialProduct.compare_at_price_cents / 100).toFixed(2)
      : "",
  );
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [sku, setSku] = useState(initialProduct?.sku || "");
  const [inventory, setInventory] = useState(String(initialProduct?.inventory_quantity || 0));
  const [availability, setAvailability] = useState<Availability>(initialProduct?.availability_status || "in_stock");
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || "draft");
  const [variants, setVariants] = useState<DraftVariant[]>(initialProduct?.variants || []);
  const [images, setImages] = useState(initialProduct?.images || []);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [workingProductId, setWorkingProductId] = useState<string | null>(
    initialProduct?.id || null,
  );
  const [imageEdits, setImageEdits] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const activeVariantInventory = useMemo(
    () => variants.filter((variant) => variant.active).reduce((sum, variant) => sum + variant.inventory_quantity, 0),
    [variants],
  );

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addVariant(name: string) {
    if (variants.some((variant) => variant.name.toLowerCase() === name.toLowerCase())) return;
    setVariants((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        sku: null,
        inventory_quantity: 0,
        active: true,
        sort_order: current.length,
      },
    ]);
  }

  function updateVariant(id: string, updates: Partial<DraftVariant>) {
    setVariants((current) => current.map((variant) => (variant.id === id ? { ...variant, ...updates } : variant)));
  }

  function moveVariant(id: string, direction: -1 | 1) {
    setVariants((current) => {
      const index = current.findIndex((variant) => variant.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((variant, sortOrder) => ({ ...variant, sort_order: sortOrder }));
    });
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((image, sortOrder) => ({ ...image, sort_order: sortOrder }));
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const rejected = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024);
    if (rejected) {
      setMessage("Use JPG, PNG, or WebP images under 8 MB. HEIC/HEIF is not supported here.");
      return;
    }
    setNewImages((current) => [
      ...current,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file), altText: title || file.name })),
    ]);
    event.target.value = "";
  }

  async function removeExistingImage(imageId: string, storagePath: string) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setImages((current) => current.filter((image) => image.id !== imageId));
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([storagePath]);
    if (storageError) {
      setMessage(`Image metadata was removed, but storage cleanup needs attention: ${storageError.message}`);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const cleanTitle = title.trim();
    const cleanSlug = slugify(slug);
    const priceCents = Math.round(Number(price) * 100);
    const compareAtCents = compareAt ? Math.round(Number(compareAt) * 100) : null;
    const requestedStatus = canPublish ? status : "draft";
    const variantInventory = variants.length > 0 ? activeVariantInventory : Number(inventory);

    if (!cleanTitle || !cleanSlug) return setMessage("Add a product title and a unique slug.");
    if (initialProduct?.status === "published" && cleanSlug !== initialProduct.slug) return setMessage("Published product URLs cannot change silently. Unpublish this product before changing its slug.");
    if (!Number.isFinite(priceCents) || priceCents < 0) return setMessage("Enter a valid price.");
    if (compareAtCents !== null && compareAtCents < priceCents) return setMessage("Compare-at price must be greater than or equal to the price.");
    if (requestedStatus === "published" && availability === "in_stock" && variantInventory <= 0) return setMessage("Add inventory before publishing an in-stock product.");
    if (variants.some((variant) => !variant.name.trim() || variant.inventory_quantity < 0)) return setMessage("Every variant needs a name and valid inventory.");

    setIsSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const productPayload = {
        title: cleanTitle,
        slug: cleanSlug,
        category_id: categoryId || null,
        price_cents: priceCents,
        compare_at_price_cents: compareAtCents,
        short_description: shortDescription.trim() || null,
        description: description.trim() || null,
        sku: sku.trim() || null,
        inventory_quantity: variantInventory,
        availability_status: availability,
        featured,
      };
      const productResult = workingProductId
        ? await supabase.from("products").update(productPayload).eq("id", workingProductId).select("id").single()
        : await supabase.from("products").insert({ ...productPayload, status: "draft" }).select("id").single();

      if (productResult.error || !productResult.data) {
        setMessage(
          productResult.error?.code === "23505"
            ? "That slug is already in use. Choose a different URL slug."
            : productResult.error?.message || "Unable to save product.",
        );
        return;
      }

      const productId = productResult.data.id;
      if (!workingProductId) {
        setWorkingProductId(productId);
      }
      const originalVariantIds = new Set((initialProduct?.variants || []).map((variant) => variant.id));
      const keptVariantIds = variants.filter((variant) => originalVariantIds.has(variant.id)).map((variant) => variant.id);
      const removedVariantIds = [...originalVariantIds].filter((id) => !keptVariantIds.includes(id));
      if (removedVariantIds.length > 0) {
        const { error } = await supabase.from("product_variants").delete().in("id", removedVariantIds);
        if (error) throw new Error(error.message);
      }
      if (variants.length > 0) {
        const variantRows = variants.map((variant, sortOrder) => ({
          ...(originalVariantIds.has(variant.id) ? { id: variant.id } : {}),
          product_id: productId,
          name: variant.name.trim(),
          sku: variant.sku?.trim() || null,
          inventory_quantity: variant.inventory_quantity,
          active: variant.active,
          sort_order: sortOrder,
        }));
        const { error } = await supabase.from("product_variants").upsert(variantRows, { onConflict: "id" });
        if (error) throw new Error(error.message);
      }

      for (const image of images) {
        const editedAltText = imageEdits[image.id];
        const { error } = await supabase.from("product_images").update({
          alt_text: editedAltText !== undefined ? editedAltText.trim() || null : image.alt_text,
          sort_order: image.sort_order,
        }).eq("id", image.id);
        if (error) {
          throw new Error(error.message);
        }
      }

      let nextImageSortOrder = images.length;
      for (const image of [...newImages]) {
        const safeFilename = image.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `products/${productId}/${crypto.randomUUID()}-${safeFilename}`;
        const upload = await supabase.storage.from("product-images").upload(storagePath, image.file, { contentType: image.file.type, upsert: false });
        if (upload.error) throw new Error(upload.error.message);
        const sortOrder = nextImageSortOrder;
        const metadata = await supabase.from("product_images").insert({ product_id: productId, storage_path: storagePath, alt_text: image.altText.trim() || cleanTitle, sort_order: sortOrder }).select("id").single();
        if (metadata.error) {
          await supabase.storage.from("product-images").remove([storagePath]);
          throw new Error(metadata.error.message);
        }
        const { data: signedImage } = await supabase.storage
          .from("product-images")
          .createSignedUrl(storagePath, 60 * 60);
        setImages((current) => [
          ...current,
          {
            id: metadata.data.id,
            storage_path: storagePath,
            alt_text: image.altText.trim() || cleanTitle,
            sort_order: sortOrder,
            signedUrl: signedImage?.signedUrl || null,
          },
        ]);
        nextImageSortOrder += 1;
        setNewImages((current) => current.filter((pending) => pending !== image));
      }

      if (requestedStatus !== (initialProduct?.status || "draft")) {
        const { error: statusError } = await supabase
          .from("products")
          .update({ status: requestedStatus })
          .eq("id", productId);
        if (statusError) {
          setMessage(
            statusError.code === "23505"
              ? "That slug is already in use. Choose a different URL slug."
              : statusError.message,
          );
          return;
        }
      }

      setMessage(requestedStatus === "published" ? "Product published." : "Product saved as draft.");
      router.push(`/admin/products/${productId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveProduct} className="admin-form-shell space-y-6 pb-28">
      <section className="admin-panel">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">Basic information</p><h2 className="admin-heading">Product details</h2></div></div>
        <div className="space-y-4">
          <label className="admin-label">Title<input value={title} onChange={(event) => handleTitleChange(event.target.value)} className="admin-input" required /></label>
          <label className="admin-label">Slug<input value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} className="admin-input" pattern="[a-z0-9-]+" required /></label>
          <label className="admin-label">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="admin-input"><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="admin-label">Price<input value={price} onChange={(event) => setPrice(event.target.value)} className="admin-input" type="number" min="0" step="0.01" required /></label><label className="admin-label">Compare-at price<span className="admin-help">Optional sale reference</span><input value={compareAt} onChange={(event) => setCompareAt(event.target.value)} className="admin-input" type="number" min="0" step="0.01" /></label></div>
          <label className="admin-label">SKU<span className="admin-help">Optional</span><input value={sku} onChange={(event) => setSku(event.target.value)} className="admin-input" /></label>
          <label className="admin-label">Short description<textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className="admin-input min-h-24 resize-y" rows={3} /></label>
          <label className="admin-label">Full description<textarea value={description} onChange={(event) => setDescription(event.target.value)} className="admin-input min-h-36 resize-y" rows={6} /></label>
        </div>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">Merchandising</p><h2 className="admin-heading">Store visibility</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="admin-label">Availability<select value={availability} onChange={(event) => setAvailability(event.target.value as Availability)} className="admin-input"><option value="in_stock">In stock</option><option value="sold_out">Sold out</option><option value="coming_soon">Coming soon</option></select></label><label className="admin-label">Status<select value={canPublish ? status : "draft"} onChange={(event) => setStatus(event.target.value as ProductStatus)} className="admin-input" disabled={!canPublish}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label></div>
        <label className="mt-5 flex min-h-12 items-center gap-3 text-sm"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-5 w-5 accent-[var(--burgundy)]" /> Feature this product on the storefront</label>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">Inventory</p><h2 className="admin-heading">Variants and sizes</h2>
        <div className="mt-4 flex flex-wrap gap-2">{quickVariantNames.map((name) => <button key={name} type="button" onClick={() => addVariant(name)} className="min-h-10 border border-black/15 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] hover:border-[var(--burgundy)]">+ {name}</button>)}</div>
        {variants.length === 0 ? <label className="admin-label mt-5">Product inventory<input value={inventory} onChange={(event) => setInventory(event.target.value)} className="admin-input" type="number" min="0" step="1" /></label> : <div className="mt-5 space-y-3">{variants.map((variant, index) => <div key={variant.id} className="border border-black/10 p-4"><div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto]"><input value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} className="admin-input" aria-label="Variant name" /><input value={variant.sku || ""} onChange={(event) => updateVariant(variant.id, { sku: event.target.value })} className="admin-input" placeholder="SKU" aria-label="Variant SKU" /><input value={variant.inventory_quantity} onChange={(event) => updateVariant(variant.id, { inventory_quantity: Math.max(0, Number(event.target.value)) })} className="admin-input" type="number" min="0" aria-label="Variant quantity" /><div className="flex gap-1"><button type="button" onClick={() => moveVariant(variant.id, -1)} disabled={index === 0} className="min-h-12 min-w-12 border border-black/15 disabled:opacity-30" aria-label="Move variant up">â†‘</button><button type="button" onClick={() => moveVariant(variant.id, 1)} disabled={index === variants.length - 1} className="min-h-12 min-w-12 border border-black/15 disabled:opacity-30" aria-label="Move variant down">â†“</button><button type="button" onClick={() => setVariants((current) => current.filter((item) => item.id !== variant.id))} className="min-h-12 min-w-12 border border-black/15 text-[var(--burgundy)]" aria-label={`Remove ${variant.name}`}>Ã—</button></div></div></div>)}</div>}
        <p className="mt-4 text-xs text-black/50">Active variant inventory: {activeVariantInventory}</p>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">Product photography</p><h2 className="admin-heading">Images</h2><p className="admin-help mt-2">JPG, PNG, or WebP under 8 MB. HEIC/HEIF is not supported in this uploader.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={image.id} className="overflow-hidden border border-black/10"><div className="relative aspect-square bg-[#eee5dd]">{image.signedUrl && <img src={image.signedUrl} alt={imageEdits[image.id] || image.alt_text || title} className="h-full w-full object-cover" />}</div><input value={imageEdits[image.id] ?? image.alt_text ?? ""} onChange={(event) => setImageEdits((current) => ({ ...current, [image.id]: event.target.value }))} className="w-full border-t border-black/10 px-2 py-3 text-xs outline-none" aria-label={`Alt text for image ${index + 1}`} /><div className="flex border-t border-black/10"><button type="button" onClick={() => moveImage(image.id, -1)} disabled={index === 0} className="min-h-10 flex-1 border-r border-black/10 text-xs disabled:opacity-30" aria-label="Move image left">â†</button><button type="button" onClick={() => moveImage(image.id, 1)} disabled={index === images.length - 1} className="min-h-10 flex-1 border-r border-black/10 text-xs disabled:opacity-30" aria-label="Move image right">â†’</button><button type="button" onClick={() => removeExistingImage(image.id, image.storage_path)} className="min-h-10 flex-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--burgundy)]">Remove</button></div></div>)}{newImages.map((image, index) => <div key={image.previewUrl} className="overflow-hidden border border-black/10"><div className="aspect-square bg-[#eee5dd]"><img src={image.previewUrl} alt={image.altText} className="h-full w-full object-cover" /></div><input value={image.altText} onChange={(event) => setNewImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, altText: event.target.value } : item))} className="w-full border-t border-black/10 px-2 py-3 text-xs outline-none" aria-label={`Alt text for new image ${index + 1}`} /><button type="button" onClick={() => setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="w-full border-t border-black/10 px-2 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--burgundy)]">Remove</button></div>)}</div>
        <label className="mt-5 flex min-h-14 cursor-pointer items-center justify-center border border-dashed border-[var(--burgundy)] px-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="sr-only" /></label>
      </section>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 border border-black/10 bg-[var(--paper)]/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:justify-end"><button type="button" onClick={() => router.push("/admin/products")} className="min-h-12 px-5 text-[10px] font-semibold uppercase tracking-[0.18em]">Cancel</button><button type="submit" disabled={isSaving} className="min-h-12 bg-[var(--ink)] px-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--burgundy)] disabled:opacity-60">{isSaving ? "Saving product" : canPublish && status === "published" ? "Publish product" : "Save draft"}</button></div>
      {message && <p role="status" className="text-sm text-[var(--burgundy)]">{message}</p>}
    </form>
  );
}
