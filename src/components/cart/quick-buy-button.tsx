'use client';

import { useRouter } from 'next/navigation';

import { useCartHydrated, useCartStore } from '@/providers/cart-store-provider';
import type { CartProduct } from '@/types/product';

type QuickBuyButtonProps = {
  product: CartProduct;
  outOfStock?: boolean;
};

export function QuickBuyButton({ product, outOfStock = false }: QuickBuyButtonProps) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const addItem = useCartStore((state) => state.addItem);
  const inCart = useCartStore((state) => state.items.some((item) => item.id === product.id));

  // Adds one only when the piece isn't in the cart yet, so buying now
  // twice never doubles the quantity — it just returns to the cart.
  function handleQuickBuy() {
    if (!inCart) addItem(product);
    router.push('/cart');
  }

  return (
    <button
      type='button'
      onClick={handleQuickBuy}
      disabled={!hydrated || outOfStock}
      aria-label={outOfStock ? `${product.title} is out of stock` : `Buy ${product.title} now`}
      className={`inline-flex h-14 w-full items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-white uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink enabled:hover:bg-ink disabled:opacity-60 ${outOfStock ? 'disabled:cursor-not-allowed' : 'disabled:cursor-wait'}`}
    >
      Buy now
    </button>
  );
}
