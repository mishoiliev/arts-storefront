'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useStore } from 'zustand';

import { type CartStore, type CartStoreApi, createCartStore } from '@/stores/cart-store';

type CartStoreContextValue = {
  store: CartStoreApi;
  hydrated: boolean;
};

const CartStoreContext = createContext<CartStoreContextValue | null>(null);

export function CartStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createCartStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        await store.persist?.rehydrate();
      } finally {
        if (active) setHydrated(true);
      }
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, [store]);

  return (
    <CartStoreContext.Provider value={{ store, hydrated }}>{children}</CartStoreContext.Provider>
  );
}

function useCartContext() {
  const context = useContext(CartStoreContext);

  if (!context) {
    throw new Error('Cart hooks must be used within CartStoreProvider.');
  }

  return context;
}

export function useCartStore<T>(selector: (state: CartStore) => T): T {
  const { store } = useCartContext();
  return useStore(store, selector);
}

export function useCartHydrated(): boolean {
  return useCartContext().hydrated;
}
