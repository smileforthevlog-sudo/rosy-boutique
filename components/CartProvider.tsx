"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
};

type AddItemProduct = {
  slug: string;
  name: string;
  price: string;
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

function priceToNumber(price: string) {
  return Number(price.replace(/[^0-9.]/g, "")) || 0;
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem("rosy-cart");

      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore invalid local cart data.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem("rosy-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const cartCount = useMemo(
    () =>
      items.reduce((total, item) => {
        return total + item.quantity;
      }, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        return total + priceToNumber(item.price) * item.quantity;
      }, 0),
    [items],
  );

  function addItem(product: AddItemProduct, size: string) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.slug === product.slug && item.size === size,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.slug === product.slug && item.size === size
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          size,
          quantity: 1,
        },
      ];
    });

    setIsOpen(true);
  }

  function removeItem(slug: string, size: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.slug === slug && item.size === size),
      ),
    );
  }

  function increaseQuantity(slug: string, size: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.slug === slug && item.size === size
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function decreaseQuantity(slug: string, size: string) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.slug === slug && item.size === size
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
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