import { cache } from 'react';

import type { Product } from '@/types/product';

const API_URL = 'https://dummyjson.com/products';
const PRODUCT_LIST_FIELDS = [
  'id',
  'title',
  'description',
  'category',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'brand',
  'thumbnail',
  'images',
].join(',');

type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export async function getProducts(limit = 0): Promise<ProductsResponse> {
  const query = new URLSearchParams({
    limit: String(limit),
    select: PRODUCT_LIST_FIELDS,
  });

  const response = await fetch(`${API_URL}?${query}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error('The product catalogue is temporarily unavailable.');
  }

  return response.json() as Promise<ProductsResponse>;
}

export const getProduct = cache(async function getProduct(id: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    next: { revalidate: 3600 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('This product could not be loaded right now.');
  }

  return response.json() as Promise<Product>;
});
