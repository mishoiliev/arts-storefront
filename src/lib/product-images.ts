import type { Product } from '@/types/product';

type ProductImages = Pick<Product, 'images' | 'thumbnail'>;

export function getProductGalleryImages(product: ProductImages) {
  const galleryImages = Array.from(
    new Set(product.images.filter((image) => image.trim().length > 0))
  );

  return galleryImages.length > 0 ? galleryImages : [product.thumbnail];
}
