import { getDiscount } from '@/lib/pricing';
import type { Product } from '@/types/product';

export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

export const PRICE_FILTERS = ['under-25', '25-50', '50-100', '100-plus'] as const;

export const AVAILABILITY_FILTERS = ['in-stock', 'out-of-stock'] as const;

export const SORT_OPTIONS = [
  'featured',
  'price-asc',
  'price-desc',
  'rating-desc',
  'name-asc',
] as const;

export type PriceFilter = (typeof PRICE_FILTERS)[number] | 'all';
export type AvailabilityFilter = (typeof AVAILABILITY_FILTERS)[number] | 'all';
export type SortOption = (typeof SORT_OPTIONS)[number];

export type CatalogFilters = {
  query: string;
  category: string;
  price: PriceFilter;
  availability: AvailabilityFilter;
  sort: SortOption;
  page: number;
  pageSize: (typeof PAGE_SIZE_OPTIONS)[number];
};

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export type CatalogResult = {
  items: Product[];
  filteredTotal: number;
  page: number;
  totalPages: number;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(value: string | undefined, options: readonly T[]): value is T {
  return value !== undefined && options.includes(value as T);
}

export function parseCatalogFilters(searchParams: CatalogSearchParams): CatalogFilters {
  const rawPage = Number.parseInt(firstValue(searchParams.page) ?? '1', 10);
  const rawPageSize = Number.parseInt(firstValue(searchParams.perPage) ?? '24', 10);
  const price = firstValue(searchParams.price);
  const availability = firstValue(searchParams.availability);
  const sort = firstValue(searchParams.sort);

  return {
    query: (firstValue(searchParams.q) ?? '').trim().slice(0, 100),
    category: (firstValue(searchParams.category) ?? '').trim(),
    price: isOneOf(price, PRICE_FILTERS) ? price : 'all',
    availability: isOneOf(availability, AVAILABILITY_FILTERS) ? availability : 'all',
    sort: isOneOf(sort, SORT_OPTIONS) ? sort : 'featured',
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: PAGE_SIZE_OPTIONS.includes(rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
      ? (rawPageSize as (typeof PAGE_SIZE_OPTIONS)[number])
      : 24,
  };
}

export function getSalePrice(product: Product) {
  return getDiscount(product.price, product.discountPercentage).salePrice;
}

function isWithinPrice(price: number, filter: PriceFilter) {
  switch (filter) {
    case 'under-25':
      return price < 25;
    case '25-50':
      return price >= 25 && price < 50;
    case '50-100':
      return price >= 50 && price < 100;
    case '100-plus':
      return price >= 100;
    default:
      return true;
  }
}

export function filterAndSortProducts(products: Product[], filters: CatalogFilters) {
  const query = filters.query.toLocaleLowerCase();

  const filtered = products.filter((product) => {
    const searchableText = [product.title, product.description, product.brand, product.category]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();

    if (query && !searchableText.includes(query)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (!isWithinPrice(getSalePrice(product), filters.price)) return false;
    if (filters.availability === 'in-stock' && product.stock <= 0) {
      return false;
    }
    if (filters.availability === 'out-of-stock' && product.stock > 0) {
      return false;
    }

    return true;
  });

  return filtered.toSorted((left, right) => {
    switch (filters.sort) {
      case 'price-asc':
        return getSalePrice(left) - getSalePrice(right) || left.id - right.id;
      case 'price-desc':
        return getSalePrice(right) - getSalePrice(left) || left.id - right.id;
      case 'rating-desc':
        return right.rating - left.rating || left.id - right.id;
      case 'name-asc':
        return left.title.localeCompare(right.title) || left.id - right.id;
      default:
        return 0;
    }
  });
}

export function getCatalogResult(products: Product[], filters: CatalogFilters): CatalogResult {
  const filtered = filterAndSortProducts(products, filters);
  const totalPages = Math.max(1, Math.ceil(filtered.length / filters.pageSize));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * filters.pageSize;

  return {
    items: filtered.slice(start, start + filters.pageSize),
    filteredTotal: filtered.length,
    page,
    totalPages,
  };
}

export function catalogFiltersToParams(
  filters: CatalogFilters,
  overrides: Partial<CatalogFilters> = {}
) {
  const values = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (values.query) params.set('q', values.query);
  if (values.category) params.set('category', values.category);
  if (values.price !== 'all') params.set('price', values.price);
  if (values.availability !== 'all') {
    params.set('availability', values.availability);
  }
  if (values.sort !== 'featured') params.set('sort', values.sort);
  if (values.page > 1) params.set('page', String(values.page));
  if (values.pageSize !== 24) {
    params.set('perPage', String(values.pageSize));
  }

  return params;
}

export function getCatalogHref(filters: CatalogFilters, overrides: Partial<CatalogFilters>) {
  const query = catalogFiltersToParams(filters, overrides).toString();
  return `${query ? `/?${query}` : '/'}#collection`;
}
