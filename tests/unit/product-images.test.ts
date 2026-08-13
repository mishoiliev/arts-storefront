import { describe, expect, test } from 'bun:test';

import { getProductGalleryImages } from '@/lib/product-images';

describe('product gallery images', () => {
  test('does not rotate a thumbnail into a single gallery image', () => {
    expect(
      getProductGalleryImages({
        thumbnail: 'product-thumbnail.webp',
        images: ['product-main.webp'],
      })
    ).toEqual(['product-main.webp']);
  });

  test('deduplicates gallery images and preserves their order', () => {
    expect(
      getProductGalleryImages({
        thumbnail: 'product-thumbnail.webp',
        images: ['front.webp', 'detail.webp', 'front.webp'],
      })
    ).toEqual(['front.webp', 'detail.webp']);
  });

  test('falls back to the thumbnail when gallery images are unavailable', () => {
    expect(
      getProductGalleryImages({
        thumbnail: 'product-thumbnail.webp',
        images: [],
      })
    ).toEqual(['product-thumbnail.webp']);
  });
});
