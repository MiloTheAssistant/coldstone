'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../data/products';
import {
  addCartItem,
  clearCart as clearCartItems,
  getCartSummary,
  removeCartItem,
  updateCartQuantity,
} from './cart-model';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  priceCents: number;
  image: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'coldstone-cart';
const CartContext = createContext<CartContextValue | null>(null);

function loadStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

function isCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as CartItem;
  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.priceCents === 'number' &&
    typeof candidate.image === 'string' &&
    typeof candidate.quantity === 'number'
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setItems(loadStoredCart());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hasLoaded, items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((current) => addCartItem(current, product, quantity));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => updateCartQuantity(current, productId, quantity));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => removeCartItem(current, productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems(clearCartItems());
  }, []);

  const summary = useMemo(() => getCartSummary(items), [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount: summary.itemCount,
      subtotalCents: summary.subtotalCents,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, summary.itemCount, summary.subtotalCents, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
