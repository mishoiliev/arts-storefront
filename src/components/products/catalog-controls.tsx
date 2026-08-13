'use client';

import { faMagnifyingGlass, faSliders, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { CatalogSelect, type CatalogSelectOption } from '@/components/products/catalog-select';
import { type CatalogFilters, catalogFiltersToParams } from '@/lib/catalog';
import { formatCategory } from '@/lib/format';

type CategoryOption = {
  value: string;
  count: number;
};

type CatalogControlsProps = {
  categories: CategoryOption[];
  filters: CatalogFilters;
};

const priceOptions: CatalogSelectOption[] = [
  { value: 'all', label: 'Any price' },
  { value: 'under-25', label: 'Under $25' },
  { value: '25-50', label: '$25 – $50' },
  { value: '50-100', label: '$50 – $100' },
  { value: '100-plus', label: '$100 and over' },
];

const availabilityOptions: CatalogSelectOption[] = [
  { value: 'all', label: 'All availability' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
];

const sortOptions: CatalogSelectOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating-desc', label: 'Highest rated' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

const pageSizeOptions: CatalogSelectOption[] = [
  { value: '12', label: '12 products' },
  { value: '24', label: '24 products' },
  { value: '48', label: '48 products' },
];

export function CatalogControls({ categories, filters }: CatalogControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const productTotal = categories.reduce((total, category) => total + category.count, 0);
  const categoryOptions: CatalogSelectOption[] = [
    { value: '', label: 'All categories', meta: String(productTotal) },
    ...categories.map((category) => ({
      value: category.value,
      label: formatCategory(category.value),
      meta: String(category.count),
    })),
  ];
  const hasFilters =
    filters.query !== '' ||
    filters.category !== '' ||
    filters.price !== 'all' ||
    filters.availability !== 'all' ||
    filters.sort !== 'featured' ||
    filters.pageSize !== 24;

  function navigate(params: URLSearchParams) {
    const query = params.toString();
    startTransition(() => {
      router.push(`${query ? `/?${query}` : '/'}#collection`, {
        scroll: false,
      });
    });
  }

  function updateFilter(name: string, value: string, defaultValue = '') {
    const params = catalogFiltersToParams(filters);

    if (value === defaultValue) {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    params.delete('page');
    navigate(params);
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateFilter('q', String(data.get('q') ?? '').trim());
  }

  return (
    <div
      aria-busy={isPending}
      className='mb-10 rounded-[2rem] border border-line bg-surface/55 p-4 sm:p-5'
    >
      <div className='mb-4 flex items-center justify-between gap-4 px-1'>
        <p className='inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink uppercase'>
          <FontAwesomeIcon
            icon={faSliders}
            className='size-3.5'
          />
          Refine the collection
        </p>
        {hasFilters ? (
          <button
            type='button'
            onClick={() => navigate(new URLSearchParams())}
            disabled={isPending}
            className='inline-flex h-8 items-center gap-2 rounded-full border border-line bg-white px-3 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase transition hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60'
          >
            <FontAwesomeIcon
              icon={faXmark}
              className='size-3'
            />
            Clear all
          </button>
        ) : null}
      </div>

      <form
        role='search'
        aria-label='Search products'
        onSubmit={handleSearch}
        className='mb-4 flex gap-2'
      >
        <label
          htmlFor='catalog-search'
          className='sr-only'
        >
          Search products
        </label>
        <input
          key={filters.query}
          id='catalog-search'
          name='q'
          type='search'
          defaultValue={filters.query}
          placeholder='Search by product, brand or category'
          maxLength={100}
          disabled={isPending}
          className='h-13 min-w-0 flex-1 rounded-full border border-line bg-white px-5 text-sm text-ink transition outline-none placeholder:text-muted/75 hover:border-ink/60 focus:border-ink focus:shadow-[0_7px_22px_rgba(25,26,23,0.07)] disabled:cursor-wait disabled:opacity-60'
        />
        <button
          type='submit'
          disabled={isPending}
          aria-label='Search products'
          className='flex size-13 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60'
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className='size-4'
          />
        </button>
      </form>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        <CatalogSelect
          label='Category'
          value={filters.category}
          defaultValue=''
          options={categoryOptions}
          disabled={isPending}
          onValueChange={(value) => updateFilter('category', value)}
        />
        <CatalogSelect
          label='Price'
          value={filters.price}
          defaultValue='all'
          options={priceOptions}
          disabled={isPending}
          onValueChange={(value) => updateFilter('price', value, 'all')}
        />
        <CatalogSelect
          label='Availability'
          value={filters.availability}
          defaultValue='all'
          options={availabilityOptions}
          disabled={isPending}
          onValueChange={(value) => updateFilter('availability', value, 'all')}
        />
        <CatalogSelect
          label='Sort by'
          ariaLabel='Sort products'
          value={filters.sort}
          defaultValue='featured'
          options={sortOptions}
          align='right'
          disabled={isPending}
          onValueChange={(value) => updateFilter('sort', value, 'featured')}
        />
        <CatalogSelect
          label='Per page'
          ariaLabel='Products per page'
          value={String(filters.pageSize)}
          defaultValue='24'
          options={pageSizeOptions}
          align='right'
          disabled={isPending}
          onValueChange={(value) => updateFilter('perPage', value, '24')}
        />
      </div>
    </div>
  );
}
