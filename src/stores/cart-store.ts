import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { CartItem, CartProduct } from '@/types/product';

export type CartState = {
  items: CartItem[];
};

export type CartActions = {
  addItem: (product: CartProduct) => void;
  removeItem: (id: number) => void;
  incrementItem: (id: number) => void;
  decrementItem: (id: number) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

const initialState: CartState = { items: [] };

const safeSessionStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.sessionStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.sessionStorage?.setItem(name, value);
    } catch {
      // The cart remains usable in memory when browser storage is unavailable.
    }
  },
  removeItem: (name) => {
    try {
      globalThis.sessionStorage?.removeItem(name);
    } catch {
      // The cart remains usable in memory when browser storage is unavailable.
    }
  },
};

export function createCartStore() {
  return createStore<CartStore>()(
    persist(
      (set) => ({
        ...initialState,
        addItem: (product) =>
          set((state) => {
            const existingItem = state.items.find((item) => item.id === product.id);

            if (existingItem) {
              return {
                items: state.items.map((item) =>
                  item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ),
              };
            }

            return { items: [...state.items, { ...product, quantity: 1 }] };
          }),
        removeItem: (id) =>
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          })),
        incrementItem: (id) =>
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          })),
        decrementItem: (id) =>
          set((state) => ({
            items: state.items.flatMap((item) => {
              if (item.id !== id) return [item];
              if (item.quantity <= 1) return [];
              return [{ ...item, quantity: item.quantity - 1 }];
            }),
          })),
        clearCart: () => set(initialState),
      }),
      {
        name: 'morrow-cart-v1',
        storage: createJSONStorage(() => safeSessionStorage),
        partialize: (state) => ({ items: state.items }),
        version: 1,
        skipHydration: true,
      }
    )
  );
}

export type CartStoreApi = ReturnType<typeof createCartStore>;

export const selectItemCount = (state: CartStore) =>
  state.items.reduce((count, item) => count + item.quantity, 0);

export const selectSubtotalCents = (state: CartStore) =>
  state.items.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0);
