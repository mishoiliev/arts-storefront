'use client';

import { faBagShopping, faMinus, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ConfirmDialog, ConfirmRemoveDialog } from '@/components/cart/confirm-dialog';
import { formatPrice } from '@/lib/format';
import { useCartHydrated, useCartStore } from '@/providers/cart-store-provider';
import { selectItemCount, selectSubtotalCents } from '@/stores/cart-store';
import type { CartItem } from '@/types/product';

type PendingAction = { kind: 'remove'; item: CartItem } | { kind: 'clear' };

export function CartPageContent() {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  function handleDecrement(item: CartItem) {
    if (item.quantity <= 1) {
      setPendingAction({ kind: 'remove', item });
      return;
    }
    decrementItem(item.id);
  }

  if (!hydrated) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <section className='mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center sm:py-32'>
        <div className='mb-7 flex size-20 items-center justify-center rounded-full bg-surface text-ink'>
          <FontAwesomeIcon
            icon={faBagShopping}
            className='size-7'
          />
        </div>
        <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-muted uppercase'>
          Your selection
        </p>
        <h1 className='text-4xl font-semibold tracking-[-0.045em] text-balance text-ink sm:text-5xl'>
          Your cart is waiting.
        </h1>
        <p className='mt-5 max-w-md text-base leading-7 text-muted'>
          Browse the collection and add something that deserves a place in your everyday.
        </p>
        <Link
          href='/#collection'
          className='mt-8 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
        >
          Explore the collection
        </Link>
      </section>
    );
  }

  return (
    <div className='mx-auto w-full max-w-350 px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20'>
      <div className='mb-10 flex items-end justify-between gap-6 border-b border-line pb-7'>
        <div>
          <p className='mb-2 text-xs font-semibold tracking-[0.18em] text-muted uppercase'>
            Your selection
          </p>
          <h1 className='text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl'>
            Shopping cart
          </h1>
          <p className='mt-3 text-sm text-muted'>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} saved for this session
          </p>
        </div>
        <button
          type='button'
          onClick={() => setPendingAction({ kind: 'clear' })}
          className='hidden text-xs font-semibold tracking-[0.14em] text-muted uppercase underline decoration-line underline-offset-4 transition hover:text-ink sm:block'
        >
          Clear cart
        </button>
      </div>

      <div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16'>
        <div className='divide-y divide-line border-y border-line'>
          {items.map((item) => (
            <article
              key={item.id}
              className='grid grid-cols-[92px_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[132px_minmax(0,1fr)_auto] sm:items-center sm:gap-7'
            >
              <Link
                href={`/products/${item.id}`}
                className='relative aspect-square overflow-hidden rounded-2xl bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes='132px'
                  className='object-contain p-3'
                />
              </Link>

              <div className='min-w-0 self-start sm:self-center'>
                <Link
                  href={`/products/${item.id}`}
                  className='line-clamp-2 text-base font-semibold tracking-[-0.02em] text-ink transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-lg'
                >
                  {item.title}
                </Link>
                <p className='mt-1 text-sm text-muted'>{formatPrice(item.price)} each</p>

                <div className='mt-5 flex flex-wrap items-center gap-4'>
                  <div className='inline-flex h-10 items-center rounded-full border border-line bg-white'>
                    <button
                      type='button'
                      onClick={() => handleDecrement(item)}
                      aria-label={
                        item.quantity <= 1
                          ? `Remove ${item.title} from cart`
                          : `Decrease quantity of ${item.title}`
                      }
                      className='flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink'
                    >
                      <FontAwesomeIcon
                        icon={faMinus}
                        className='size-3'
                      />
                    </button>
                    <span
                      className='min-w-7 text-center text-sm font-semibold text-ink tabular-nums'
                      aria-label={`Quantity ${item.quantity}`}
                    >
                      <span
                        key={item.quantity}
                        className='qty-pop block'
                      >
                        {item.quantity}
                      </span>
                    </span>
                    <button
                      type='button'
                      onClick={() => incrementItem(item.id)}
                      aria-label={`Increase quantity of ${item.title}`}
                      className='flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink'
                    >
                      <FontAwesomeIcon
                        icon={faPlus}
                        className='size-3'
                      />
                    </button>
                  </div>
                  <button
                    type='button'
                    onClick={() => setPendingAction({ kind: 'remove', item })}
                    aria-label={`Remove ${item.title} from cart`}
                    className='inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className='size-3'
                    />
                    Remove
                  </button>
                </div>
              </div>

              <p className='col-start-2 text-right text-base font-semibold text-ink tabular-nums sm:col-auto sm:self-start sm:pt-1 sm:text-lg'>
                {formatPrice((Math.round(item.price * 100) * item.quantity) / 100)}
              </p>
            </article>
          ))}
        </div>

        <aside className='h-fit rounded-3xl bg-surface p-6 sm:p-8 lg:sticky lg:top-28'>
          <h2 className='text-xl font-semibold tracking-tight text-ink'>Order summary</h2>
          <dl className='mt-7 space-y-4 border-b border-line pb-6 text-sm'>
            <div className='flex justify-between gap-5'>
              <dt className='text-muted'>Subtotal ({itemCount})</dt>
              <dd className='font-medium text-ink tabular-nums'>
                {formatPrice(subtotalCents / 100)}
              </dd>
            </div>
            <div className='flex justify-between gap-5'>
              <dt className='text-muted'>Shipping</dt>
              <dd className='font-medium text-ink'>Calculated at checkout</dd>
            </div>
          </dl>
          <div className='flex items-end justify-between gap-5 py-6'>
            <span className='text-sm font-semibold text-ink'>Estimated total</span>
            <span className='text-2xl font-semibold tracking-[-0.03em] text-ink tabular-nums'>
              {formatPrice(subtotalCents / 100)}
            </span>
          </div>
          <Link
            href='/#collection'
            className='inline-flex h-13 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
          >
            Continue shopping
          </Link>
          <p className='mt-4 text-center text-xs leading-5 text-muted'>
            Checkout is intentionally outside the scope of this demo.
          </p>
        </aside>
      </div>

      <button
        type='button'
        onClick={() => setPendingAction({ kind: 'clear' })}
        className='mt-8 text-xs font-semibold tracking-[0.14em] text-muted uppercase underline decoration-line underline-offset-4 sm:hidden'
      >
        Clear cart
      </button>

      {pendingAction?.kind === 'remove' ? (
        <ConfirmRemoveDialog
          item={pendingAction.item}
          onConfirm={() => {
            removeItem(pendingAction.item.id);
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}
      {pendingAction?.kind === 'clear' ? (
        <ConfirmDialog
          eyebrow='Clear cart'
          title='Clear your entire cart?'
          description={`This removes all ${itemCount} ${
            itemCount === 1 ? 'item' : 'items'
          } from your selection at once.`}
          confirmLabel='Clear cart'
          cancelLabel='Keep items'
          onConfirm={() => {
            clearCart();
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div
      className='mx-auto w-full max-w-350 animate-pulse px-5 py-16 sm:px-8 lg:px-12'
      aria-label='Loading cart'
    >
      <div className='h-12 w-64 rounded-xl bg-surface' />
      <div className='mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='space-y-5'>
          {[0, 1].map((item) => (
            <div
              key={item}
              className='flex gap-6 border-t border-line py-6'
            >
              <div className='size-28 rounded-2xl bg-surface' />
              <div className='flex-1 space-y-3 py-2'>
                <div className='h-5 max-w-xs rounded bg-surface' />
                <div className='h-4 w-24 rounded bg-surface' />
              </div>
            </div>
          ))}
        </div>
        <div className='h-72 rounded-3xl bg-surface' />
      </div>
    </div>
  );
}
