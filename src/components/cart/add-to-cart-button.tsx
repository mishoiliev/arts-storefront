'use client';

import { faBagShopping, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import { ConfirmRemoveDialog } from '@/components/cart/confirm-dialog';
import { useCartHydrated, useCartStore } from '@/providers/cart-store-provider';
import type { CartProduct } from '@/types/product';

type AddToCartButtonProps = {
  product: CartProduct;
  variant?: 'compact' | 'primary';
  outOfStock?: boolean;
};

export function AddToCartButton({
  product,
  variant = 'compact',
  outOfStock = false,
}: AddToCartButtonProps) {
  const hydrated = useCartHydrated();
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const quantity = useCartStore(
    (state) => state.items.find((item) => item.id === product.id)?.quantity ?? 0
  );
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  function handleDecrement() {
    if (quantity <= 1) {
      setConfirmingRemoval(true);
      return;
    }
    decrementItem(product.id);
  }

  const isPrimary = variant === 'primary';
  const inCart = quantity > 0 && !outOfStock;

  const layerTransition = 'absolute inset-0 transition-all duration-300 ease-out';
  const hiddenLayer = 'pointer-events-none scale-90 opacity-0';
  const visibleLayer = 'scale-100 opacity-100';

  const addButtonStyles = isPrimary
    ? 'rounded-full bg-ink px-4 text-sm whitespace-nowrap text-white enabled:hover:bg-accent'
    : 'rounded-full border border-line bg-white px-4 text-xs text-ink enabled:hover:border-ink enabled:hover:bg-ink enabled:hover:text-white';

  const stepperStyles = isPrimary
    ? 'rounded-full bg-ink text-sm text-white'
    : 'rounded-full border border-line bg-white text-xs text-ink';

  const stepperButtonStyles = isPrimary ? 'hover:bg-white/15' : 'hover:bg-surface';

  return (
    <div className={`relative w-full ${isPrimary ? 'h-14' : 'h-11'}`}>
      <button
        type='button'
        onClick={() => addItem(product)}
        disabled={!hydrated || outOfStock}
        inert={inCart}
        aria-hidden={inCart}
        aria-label={
          outOfStock ? `${product.title} is out of stock` : `Add ${product.title} to cart`
        }
        className={`inline-flex items-center justify-center gap-2 font-semibold tracking-[0.12em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60 ${outOfStock ? 'disabled:cursor-not-allowed' : 'disabled:cursor-wait'} ${addButtonStyles} ${layerTransition} ${inCart ? hiddenLayer : visibleLayer}`}
      >
        {isPrimary ? null : (
          <FontAwesomeIcon
            icon={faBagShopping}
            className='size-3.5'
          />
        )}
        <span>{outOfStock ? 'Out of stock' : 'Add to cart'}</span>
      </button>

      <div
        inert={!inCart}
        aria-hidden={!inCart}
        className={`flex items-center justify-between font-semibold ${stepperStyles} ${layerTransition} ${inCart ? visibleLayer : hiddenLayer}`}
      >
        <button
          type='button'
          onClick={handleDecrement}
          aria-label={
            quantity <= 1
              ? `Remove ${product.title} from cart`
              : `Decrease quantity of ${product.title}`
          }
          className={`flex aspect-square h-full items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${stepperButtonStyles}`}
        >
          <FontAwesomeIcon
            icon={faMinus}
            className='size-3'
          />
        </button>
        <span
          aria-live='polite'
          className='min-w-7 text-center tabular-nums'
          aria-label={`${quantity} in cart`}
        >
          <span
            key={quantity}
            className='qty-pop block'
          >
            {quantity}
          </span>
        </span>
        <button
          type='button'
          onClick={() => incrementItem(product.id)}
          aria-label={`Increase quantity of ${product.title}`}
          className={`flex aspect-square h-full items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${stepperButtonStyles}`}
        >
          <FontAwesomeIcon
            icon={faPlus}
            className='size-3'
          />
        </button>
      </div>

      {confirmingRemoval ? (
        <ConfirmRemoveDialog
          item={product}
          onConfirm={() => {
            removeItem(product.id);
            setConfirmingRemoval(false);
          }}
          onCancel={() => setConfirmingRemoval(false)}
        />
      ) : null}
    </div>
  );
}
