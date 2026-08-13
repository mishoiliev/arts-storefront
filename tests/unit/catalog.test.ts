import { describe, expect, test } from 'bun:test';

import {
  type CatalogFilters,
  catalogFiltersToParams,
  filterAndSortProducts,
  getCatalogResult,
  parseCatalogFilters,
} from '@/lib/catalog';
import { getDiscount } from '@/lib/pricing';
import type { Product } from '@/types/product';

function product(overrides: Partial<Product> & Pick<Product, 'id' | 'title'>) {
  return {
    description: `${overrides.title} description`,
    category: 'home-decoration',
    price: 50,
    discountPercentage: 0,
    rating: 4,
    stock: 5,
    thumbnail: `https://cdn.dummyjson.com/product-images/${overrides.id}/thumbnail.webp`,
    images: [`https://cdn.dummyjson.com/product-images/${overrides.id}/1.webp`],
    ...overrides,
  } satisfies Product;
}

const products = [
  product({
    id: 1,
    title: 'Amber Lamp',
    brand: 'Morrow Home',
    price: 20,
    rating: 4.2,
  }),
  product({
    id: 2,
    title: 'Canvas Tote',
    category: 'womens-bags',
    price: 40,
    discountPercentage: 25,
    rating: 4.8,
  }),
  product({
    id: 3,
    title: 'Desk Chair',
    category: 'furniture',
    price: 125,
    rating: 4.6,
    stock: 0,
  }),
  product({ id: 4, title: 'Enamel Tray', price: 75, rating: 3.9 }),
];

const defaults: CatalogFilters = {
  query: '',
  category: '',
  price: 'all',
  availability: 'all',
  sort: 'featured',
  page: 1,
  pageSize: 24,
};

describe('catalogue query parsing', () => {
  test('accepts supported values and normalizes unsafe pagination', () => {
    expect(
      parseCatalogFilters({
        q: '  canvas  ',
        category: 'womens-bags',
        price: '25-50',
        availability: 'in-stock',
        sort: 'rating-desc',
        page: '-2',
        perPage: '48',
      })
    ).toEqual({
      query: 'canvas',
      category: 'womens-bags',
      price: '25-50',
      availability: 'in-stock',
      sort: 'rating-desc',
      page: 1,
      pageSize: 48,
    });
  });

  test('falls back when filters are unsupported', () => {
    expect(
      parseCatalogFilters({
        price: 'free',
        availability: 'maybe',
        sort: 'random',
        page: 'NaN',
        perPage: '500',
      })
    ).toEqual(defaults);
  });
});

describe('catalogue filters and sorting', () => {
  test('searches product, brand and category text', () => {
    expect(filterAndSortProducts(products, { ...defaults, query: 'morrow home' })).toEqual([
      products[0],
    ]);
    expect(filterAndSortProducts(products, { ...defaults, query: 'furniture' })).toEqual([
      products[2],
    ]);
  });

  test('combines category, sale-price and availability filters', () => {
    expect(
      filterAndSortProducts(products, {
        ...defaults,
        category: 'womens-bags',
        price: '25-50',
        availability: 'in-stock',
      })
    ).toEqual([products[1]]);

    expect(
      filterAndSortProducts(products, {
        ...defaults,
        availability: 'out-of-stock',
      })
    ).toEqual([products[2]]);
  });

  test('sorts by effective sale price, rating and name', () => {
    expect(
      filterAndSortProducts(products, { ...defaults, sort: 'price-asc' }).map(({ id }) => id)
    ).toEqual([1, 2, 4, 3]);
    expect(
      filterAndSortProducts(products, { ...defaults, sort: 'price-desc' }).map(({ id }) => id)
    ).toEqual([3, 4, 2, 1]);
    expect(
      filterAndSortProducts(products, {
        ...defaults,
        sort: 'rating-desc',
      }).map(({ id }) => id)
    ).toEqual([2, 3, 1, 4]);
    expect(
      filterAndSortProducts(products, { ...defaults, sort: 'name-asc' }).map(({ id }) => id)
    ).toEqual([1, 2, 3, 4]);
  });
});

describe('catalogue pagination and URLs', () => {
  test('paginates and clamps pages that exceed the result set', () => {
    const expandedProducts = Array.from({ length: 15 }, (_, index) =>
      product({ id: index + 1, title: `Product ${index + 1}` })
    );
    const secondPage = getCatalogResult(expandedProducts, {
      ...defaults,
      page: 2,
      pageSize: 12,
    });

    expect(secondPage.page).toBe(2);
    expect(secondPage.totalPages).toBe(2);
    expect(secondPage.filteredTotal).toBe(15);
    expect(secondPage.items).toHaveLength(3);

    const clampedPage = getCatalogResult(expandedProducts, {
      ...defaults,
      page: 99,
      pageSize: 12,
    });
    expect(clampedPage.page).toBe(2);
  });

  test('serializes only active, non-default controls', () => {
    expect(
      catalogFiltersToParams({
        ...defaults,
        query: 'lamp',
        availability: 'in-stock',
        sort: 'price-asc',
        page: 2,
        pageSize: 12,
      }).toString()
    ).toBe('q=lamp&availability=in-stock&sort=price-asc&page=2&perPage=12');
  });
});

describe('pricing', () => {
  test('rounds discounted prices to cents and rejects invalid percentages', () => {
    expect(getDiscount(19.99, 15)).toEqual({
      salePrice: 16.99,
      savingsAmount: 3,
    });
    expect(getDiscount(19.99, 100)).toEqual({
      salePrice: 19.99,
      savingsAmount: 0,
    });
  });
});
