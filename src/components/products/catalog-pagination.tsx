import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

import { type CatalogFilters, getCatalogHref } from '@/lib/catalog';

type CatalogPaginationProps = {
  filters: CatalogFilters;
  page: number;
  totalPages: number;
};

export function CatalogPagination({ filters, page, totalPages }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label='Catalogue pagination'
      className='mt-14 flex items-center justify-between gap-4 border-t border-line pt-7'
    >
      {page > 1 ? (
        <Link
          href={getCatalogHref(filters, { page: page - 1 })}
          scroll={false}
          className='inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-semibold tracking-[0.1em] text-ink uppercase transition hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className='size-3'
          />
          Previous
        </Link>
      ) : (
        <span />
      )}

      <p className='text-sm font-medium text-muted tabular-nums'>
        Page <span className='text-ink'>{page}</span> of {totalPages}
      </p>

      {page < totalPages ? (
        <Link
          href={getCatalogHref(filters, { page: page + 1 })}
          scroll={false}
          className='inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-semibold tracking-[0.1em] text-ink uppercase transition hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
        >
          Next
          <FontAwesomeIcon
            icon={faArrowRight}
            className='size-3'
          />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
