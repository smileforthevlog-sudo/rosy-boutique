"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price_cents: number;
  image: string;
  size: string;
  quantity: number;
};

type AddItemProduct = {
  productId: string;
  slug: string;
  name: string;
  price_cents: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: AddItemProduct, size: string) => void;
  removeItem: (slug: string, size: string) => void;
  increaseQuantity: (slug: string, size: string) => void;
  decreaseQuantity: (slug: string, size: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const cartStorageKey = "rosy-cart";
const cartListeners = new Set<() => void>();

function subscribeToCart(listener: () => void) {
  cartListeners.add(listener);

  if (typeof window === "undefined") {
    return () => cartListeners.delete(listener);
  }

  const handleStorage = () => listener();
  window.addEventListener("storage", handleStorage);

  return () => {
    cartListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getCartSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(cartStorageKey) || "[]";
}

function getServerCartSnapshot() {
  return "[]";
}

function parseCart(snapshot: string): CartItem[] {
  try {
    const parsed = JSON.parse(snapshot) as Partial<CartItem>[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is CartItem =>
        typeof item.productId === "string" &&
        typeof item.slug === "string" &&
        typeof item.name === "string" &&
        typeof item.price_cents === "number" &&
        typeof item.image === "string" &&
        typeof item.size === "string" &&
        typeof item.quantity === "number",
    );
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  cartListeners.forEach((listener) => listener());
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartSnapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const items = useMemo(() => parseCart(cartSnapshot), [cartSnapshot]);
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price_cents * item.quantity,
        0,
      ),
    [items],
  );

  function addItem(product: AddItemProduct, size: string) {
    const existingItem = items.find(
      (item) => item.slug === product.slug && item.size === size,
    );
    const nextItems = existingItem
      ? items.map((item) =>
          item.slug === product.slug && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [...items, { ...product, size, quantity: 1 }];

    saveCart(nextItems);
    setIsOpen(true);
  }

  function removeItem(slug: string, size: string) {
    saveCart(
      items.filter(
        (item) => !(item.slug === slug && item.size === size),
      ),
    );
  }

  function increaseQuantity(slug: string, size: string) {
    saveCart(
      items.map((item) =>
        item.slug === slug && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decreaseQuantity(slug: string, size: string) {
    saveCart(
      items
        .map((item) =>
          item.slug === slug && item.size === size
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        isOpen,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}