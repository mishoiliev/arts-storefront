import Link from 'next/link';

export default function NotFound() {
  return (
    <section className='mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center sm:py-32'>
      <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-accent uppercase'>
        Error 404
      </p>
      <h1 className='text-5xl font-semibold tracking-[-0.055em] text-balance text-ink sm:text-6xl'>
        Nothing on this shelf.
      </h1>
      <p className='mt-5 max-w-md text-base leading-7 text-muted'>
        The product you’re looking for may have moved or no longer be available.
      </p>
      <Link
        href='/#collection'
        className='mt-8 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
      >
        Back to the collection
      </Link>
    </section>
  );
}
