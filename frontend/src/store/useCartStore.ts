import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Design } from '../types';

export interface CartItem {
  id: string; // Unique local id (e.g. uuid)
  product: Product;
  quantity: number;
  design?: Design; // Associated custom design if any
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          // If it's a generic product without a specific custom design, we could group it.
          // But for custom manufacturing, treating each addition as unique is safer.
          const newItem = { ...item, id: crypto.randomUUID() };
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (parseFloat(item.product.base_price) * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
