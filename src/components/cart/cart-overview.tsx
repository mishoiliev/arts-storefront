'use client';

import { faBagShopping, faMinus, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ConfirmRemoveDialog } from '@/components/cart/confirm-dialog';
import { formatPrice } from '@/lib/format';
import { useCartHydrated, useCartStore } from '@/providers/cart-store-provider';
import { selectItemCount, selectSubtotalCents } from '@/stores/cart-store';
import type { CartItem } from '@/types/product';

export function CartOverview() {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const itemCount = useCartStore(selectItemCount);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const [open, setOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Light dismiss: outside click and Escape (unless the removal dialog owns Escape).
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !pendingRemoval) setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, pendingRemoval]);

  function handleDecrement(item: CartItem) {
    if (item.quantity <= 1) {
      setPendingRemoval(item);
      return;
    }
    decrementItem(item.id);
  }

  // Close when the route changes (e.g. back/forward navigation).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const triggerLabel = hydrated
    ? `Cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
    : 'Cart';

  return (
    <div
      ref={containerRef}
      className='relative'
    >
      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls='cart-overview'
        className='group relative inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
      >
        <FontAwesomeIcon
          icon={faBagShopping}
          className='size-4'
        />
        {hydrated && itemCount > 0 ? (
          <span className='absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] leading-none font-bold text-white ring-2 ring-canvas'>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section
          id='cart-overview'
          aria-label='Cart overview'
          className='overview-pop absolute top-full right-0 z-50 mt-3 flex max-h-[calc(100dvh-8.5rem)] w-[min(24rem,calc(100vw-2.5rem))] origin-top-right flex-col overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-xl'
        >
          <div className='flex shrink-0 items-baseline justify-between gap-4 border-b border-line pb-4'>
            <h2 className='text-sm font-semibold tracking-[0.14em] text-ink uppercase'>
              Your cart
            </h2>
            <p className='text-xs text-muted'>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {items.length === 0 ? (
            <div className='flex min-h-0 flex-1 flex-col items-center overflow-y-auto py-8 text-center'>
              <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-surface text-ink'>
                <FontAwesomeIcon
                  icon={faBagShopping}
                  className='size-4'
                />
              </div>
              <p className='text-sm font-semibold text-ink'>Your cart is empty.</p>
              <Link
                href='/#collection'
                onClick={() => setOpen(false)}
                className='mt-2 text-xs font-semibold tracking-[0.12em] text-accent uppercase underline decoration-accent/40 underline-offset-4 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
              >
                Explore the collection
              </Link>
            </div>
          ) : (
            <>
              <ul className='min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain'>
                {items.map((item) => (
                  <li
                    key={item.id}
                    className='flex gap-4 py-4'
                  >
                    <Link
                      href={`/products/${item.id}`}
                      onClick={() => setOpen(false)}
                      className='relative size-14 shrink-0 self-start overflow-hidden rounded-xl bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
                    >
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes='56px'
                        className='object-contain p-1.5'
                      />
                    </Link>
                    <div className='min-w-0 flex-1'>
                      <Link
                        href={`/products/${item.id}`}
                        onClick={() => setOpen(false)}
                        className='line-clamp-1 text-sm font-semibold text-ink transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
                      >
                        {item.title}
                      </Link>
                      <p className='mt-0.5 text-xs text-muted tabular-nums'>
                        {formatPrice(item.price)} each
                      </p>
                      <div className='mt-2.5 inline-flex h-8 items-center rounded-full border border-line bg-white'>
                        <button
                          type='button'
                          onClick={() => handleDecrement(item)}
                          aria-label={
                            item.quantity <= 1
                              ? `Remove ${item.title} from cart`
                              : `Decrease quantity of ${item.title}`
                          }
                          className='flex size-8 items-center justify-center rounded-full text-ink transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink'
                        >
                          <FontAwesomeIcon
                            icon={faMinus}
                            className='size-2.5'
                          />
                        </button>
                        <span
                          className='min-w-6 text-center text-xs font-semibold text-ink tabular-nums'
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
                          className='flex size-8 items-center justify-center rounded-full text-ink transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink'
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            className='size-2.5'
                          />
                        </button>
                      </div>
                    </div>
                    <div className='flex flex-col items-end justify-between self-stretch'>
                      <p className='text-sm font-semibold text-ink tabular-nums'>
                        {formatPrice((Math.round(item.price * 100) * item.quantity) / 100)}
                      </p>
                      <button
                        type='button'
                        onClick={() => setPendingRemoval(item)}
                        aria-label={`Remove ${item.title} from cart`}
                        className='flex size-8 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink'
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className='size-3.5'
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className='flex shrink-0 items-center justify-between gap-4 border-t border-line py-4'>
                <p className='text-sm text-muted'>Subtotal</p>
                <p className='text-base font-semibold text-ink tabular-nums'>
                  {formatPrice(subtotalCents / 100)}
                </p>
              </div>
            </>
          )}

          <Link
            href='/cart'
            onClick={() => setOpen(false)}
            className='inline-flex h-12 w-full shrink-0 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
          >
            Go to cart
          </Link>
        </section>
      ) : null}

      {pendingRemoval ? (
        <ConfirmRemoveDialog
          item={pendingRemoval}
          onConfirm={() => {
            removeItem(pendingRemoval.id);
            setPendingRemoval(null);
          }}
          onCancel={() => setPendingRemoval(null)}
        />
      ) : null}
    </div>
  );
}
