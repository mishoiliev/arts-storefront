'use client';

import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className='mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center sm:py-32'>
      <div className='mb-7 flex size-20 items-center justify-center rounded-full bg-accent-soft text-accent'>
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className='size-7'
        />
      </div>
      <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-accent uppercase'>
        Something went wrong
      </p>
      <h1 className='text-4xl font-semibold tracking-[-0.045em] text-balance text-ink sm:text-5xl'>
        We lost the thread.
      </h1>
      <p className='mt-5 text-base leading-7 text-muted'>
        This page could not be loaded right now. Please try again.
      </p>
      <button
        type='button'
        onClick={reset}
        className='mt-8 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
      >
        Try again
      </button>
    </section>
  );
}
