import Link from 'next/link';

import { CartOverview } from '@/components/cart/cart-overview';

export function SiteHeader() {
  return (
    <>
      <div className='bg-ink px-5 py-2.5 text-center text-[10px] font-semibold tracking-[0.18em] text-white uppercase sm:text-xs'>
        Complimentary delivery on orders over $75
      </div>
      <header className='sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-xl'>
        <div className='mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12'>
          <Link
            href='/'
            className='text-xl font-bold tracking-[-0.04em] text-ink uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-2xl'
          >
            Morrow<span className='text-accent'>.</span>
          </Link>

          <nav
            aria-label='Primary navigation'
            className='flex items-center gap-2'
          >
            <Link
              href='/'
              className='hidden rounded-full px-4 py-2 text-xs font-semibold tracking-[0.13em] text-muted uppercase transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:inline-flex'
            >
              Home
            </Link>
            <Link
              href='/#collection'
              className='hidden rounded-full px-4 py-2 text-xs font-semibold tracking-[0.13em] text-muted uppercase transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:inline-flex'
            >
              Shop
            </Link>
            <CartOverview />
          </nav>
        </div>
      </header>
    </>
  );
}
