"use client";

import { FormEvent, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AdminCategory } from "@/lib/admin/catalog";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SortableCategoryCardProps = {
  category: AdminCategory;
  index: number;
  canManage: boolean;
  savingOrder: boolean;
  onLocalUpdate: (id: string, updates: Partial<AdminCategory>) => void;
  onPersistUpdate: (
    category: AdminCategory,
    updates: Partial<AdminCategory>,
  ) => Promise<void>;
};

function SortableCategoryCard({
  category,
  index,
  canManage,
  savingOrder,
  onLocalUpdate,
  onPersistUpdate,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    disabled: !canManage || savingOrder,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`admin-category-card ${
        isDragging ? "is-dragging" : ""
      }`}
    >
      <button
        type="button"
        className="admin-category-drag-handle"
        disabled={!canManage || savingOrder}
        aria-label={`Drag ${category.name} to reorder`}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden="true">⋮⋮</span>
      </button>

      <div className="admin-category-order">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="admin-category-copy">
        <input
          aria-label={`Name for ${category.name}`}
          value={category.name}
          disabled={!canManage}
          onChange={(event) =>
            onLocalUpdate(category.id, {
              name: event.target.value,
            })
          }
          onBlur={(event) =>
            onPersistUpdate(category, {
              name: event.target.value.trim(),
              slug: slugify(event.target.value),
            })
          }
          className="admin-category-name"
        />

        <p className="admin-category-slug">/{category.slug}</p>
      </div>

      <div className="admin-category-controls">
        <label className="admin-switch">
          <input
            type="checkbox"
            checked={category.active}
            disabled={!canManage}
            onChange={(event) =>
              onPersistUpdate(category, {
                active: event.target.checked,
              })
            }
          />

          <span className="admin-switch-track" aria-hidden="true">
            <span />
          </span>

          <span>{category.active ? "Active" : "Hidden"}</span>
        </label>

        <span className="admin-category-drag-hint">
          Drag to reorder
        </span>
      </div>
    </article>
  );
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
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function updateLocalCategory(
    id: string,
    updates: Partial<AdminCategory>,
  ) {
    setCategories((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || !name.trim()) return;

    setMessage("");

    const supabase = createSupabaseBrowserClient();

    const nextSort =
      categories.length === 0
        ? 10
        : Math.max(...categories.map((category) => category.sort_order)) + 10;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        slug: slugify(name),
        sort_order: nextSort,
      })
      .select(
        "id, name, slug, description, sort_order, active, created_at, updated_at",
      )
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setCategories((current) => [...current, data]);
    setName("");
    setMessage("Category created.");
  }

  async function updateCategory(
    category: AdminCategory,
    updates: Partial<AdminCategory>,
  ) {
    if (!canManage) return;

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", category.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? { ...item, ...updates }
          : item,
      ),
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      !canManage ||
      !over ||
      active.id === over.id ||
      savingOrder
    ) {
      return;
    }

    const oldIndex = categories.findIndex(
      (category) => category.id === active.id,
    );

    const newIndex = categories.findIndex(
      (category) => category.id === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const previousCategories = categories;

    const reordered = arrayMove(
      categories,
      oldIndex,
      newIndex,
    ).map((category, index) => ({
      ...category,
      sort_order: (index + 1) * 10,
    }));

    setCategories(reordered);
    setSavingOrder(true);
    setMessage("Saving category order...");

    try {
      const supabase = createSupabaseBrowserClient();

      const results = await Promise.all(
        reordered.map((category) =>
          supabase
            .from("categories")
            .update({
              sort_order: category.sort_order,
            })
            .eq("id", category.id),
        ),
      );

      const failed = results.find((result) => result.error);

      if (failed?.error) {
        throw new Error(failed.error.message);
      }

      setMessage("Category order saved.");
    } catch (error) {
      setCategories(previousCategories);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save category order.",
      );
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="admin-category-layout">
      <section>
        <div className="admin-category-instructions">
          <div>
            <p className="admin-eyebrow">Display order</p>
            <p>
              Drag categories up or down. The new storefront order saves
              automatically.
            </p>
          </div>

          {savingOrder && (
            <span className="admin-order-saving">
              Saving...
            </span>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="admin-category-list">
              {categories.map((category, index) => (
                <SortableCategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  canManage={canManage}
                  savingOrder={savingOrder}
                  onLocalUpdate={updateLocalCategory}
                  onPersistUpdate={updateCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {message && (
          <div role="status" className="admin-toast mt-4">
            <span className="admin-toast-dot" aria-hidden="true" />
            {message}
          </div>
        )}
      </section>

      <aside className="admin-surface admin-category-create">
        <p className="admin-eyebrow">Catalog structure</p>
        <h2 className="admin-heading">New category</h2>

        <p className="admin-help mt-3">
          Add another browsing path without touching existing products.
        </p>

        {canManage ? (
          <form onSubmit={addCategory} className="mt-6 space-y-4">
            <label className="admin-label">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="admin-input"
                placeholder="e.g. Accessories"
                required
              />
            </label>

            <button className="admin-button w-full">
              Add category
            </button>
          </form>
        ) : (
          <p className="mt-5 text-sm text-black/50">
            Editors can manage products, but not categories.
          </p>
        )}
      </aside>
    </div>
  );
}