import { beforeEach, describe, expect, test } from 'bun:test';

import { createCartStore, selectItemCount, selectSubtotalCents } from '@/stores/cart-store';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage(),
  });
});

describe('cart store', () => {
  test('adds new products and increments existing products', () => {
    const store = createCartStore();
    const lamp = {
      id: 1,
      title: 'Amber Lamp',
      price: 16.99,
      thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.webp',
    };

    store.getState().addItem(lamp);
    store.getState().addItem(lamp);

    expect(store.getState().items).toEqual([{ ...lamp, quantity: 2 }]);
    expect(selectItemCount(store.getState())).toBe(2);
    expect(selectSubtotalCents(store.getState())).toBe(3398);
  });

  test('increments, decrements, removes and clears products', () => {
    const store = createCartStore();
    const tote = {
      id: 2,
      title: 'Canvas Tote',
      price: 30,
      thumbnail: 'https://cdn.dummyjson.com/product-images/2/thumbnail.webp',
    };

    store.getState().addItem(tote);
    store.getState().incrementItem(tote.id);
    store.getState().decrementItem(tote.id);
    expect(store.getState().items[0]?.quantity).toBe(1);

    store.getState().removeItem(tote.id);
    expect(store.getState().items).toEqual([]);

    store.getState().addItem(tote);
    store.getState().clearCart();
    expect(store.getState().items).toEqual([]);
  });

  test('rehydrates items from session storage', async () => {
    const lamp = {
      id: 1,
      title: 'Amber Lamp',
      price: 16.99,
      thumbnail: 'https://cdn.dummyjson.com/product-images/1/thumbnail.webp',
    };
    const firstStore = createCartStore();
    firstStore.getState().addItem(lamp);

    const rehydratedStore = createCartStore();
    await rehydratedStore.persist.rehydrate();

    expect(rehydratedStore.getState().items).toEqual([{ ...lamp, quantity: 1 }]);
  });

  test('remains usable when session storage is blocked', async () => {
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });
    const store = createCartStore();

    await store.persist.rehydrate();
    store.getState().addItem({
      id: 2,
      title: 'Canvas Tote',
      price: 30,
      thumbnail: 'https://cdn.dummyjson.com/product-images/2/thumbnail.webp',
    });

    expect(store.getState().items).toHaveLength(1);
  });
});
