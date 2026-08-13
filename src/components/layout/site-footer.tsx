import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className='mt-auto border-t border-line bg-surface'>
      <div className='mx-auto grid max-w-[1400px] gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:px-12'>
        <div>
          <Link
            href='/'
            className='text-xl font-bold tracking-[-0.04em] text-ink uppercase'
          >
            Morrow<span className='text-accent'>.</span>
          </Link>
          <p className='mt-3 max-w-sm text-sm leading-6 text-muted'>
            A considered collection of useful, beautiful things for everyday life.
          </p>
        </div>
        <div className='sm:text-right'>
          <p className='text-xs font-semibold tracking-[0.15em] text-muted uppercase'>
            Technical assignment
          </p>
          <p className='mt-3 text-sm text-muted'>Product data provided by DummyJSON.</p>
        </div>
      </div>
    </footer>
  );
}
