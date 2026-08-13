'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { formatPercentage, formatPrice } from '@/lib/format';
import { getProductGalleryImages } from '@/lib/product-images';
import type { Product } from '@/types/product';

type ProductCardMediaProps = {
  product: Product;
  priority: boolean;
  savingsAmount: number;
};

export function ProductCardMedia({ product, priority, savingsAmount }: ProductCardMediaProps) {
  const images = useMemo(
    () =>
      getProductGalleryImages({
        images: product.images,
        thumbnail: product.thumbnail,
      }),
    [product.images, product.thumbnail]
  );
  const [activeImage, setActiveImage] = useState(0);
  const [rotating, setRotating] = useState(false);
  const canRotate = images.length > 1;

  useEffect(() => {
    if (!rotating || !canRotate) return;

    let interval: number | undefined;
    const firstChange = window.setTimeout(() => {
      setActiveImage((current) => (current + 1) % images.length);
      interval = window.setInterval(() => {
        setActiveImage((current) => (current + 1) % images.length);
      }, 2000);
    }, 500);

    return () => {
      window.clearTimeout(firstChange);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [canRotate, images.length, rotating]);

  function stopRotation() {
    setRotating(false);
    setActiveImage(0);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      onPointerEnter={() => setRotating(true)}
      onPointerLeave={stopRotation}
      onFocus={() => setRotating(true)}
      onBlur={stopRotation}
      data-testid='product-card-media'
      data-active-image={activeImage}
      data-active-image-src={images[activeImage]}
      data-image-count={images.length}
      data-detail-image-count={images.length}
      data-crossfade={canRotate}
      data-zoomed={rotating}
      className='group relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
    >
      {product.discountPercentage > 10 ? (
        <span className='absolute top-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-accent uppercase shadow-sm'>
          Save {formatPercentage(product.discountPercentage)}% ({formatPrice(savingsAmount)})
        </span>
      ) : null}

      <div className='absolute inset-0 transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] group-focus:scale-[1.045]'>
        {canRotate ? (
          (rotating ? images : images.slice(0, 1)).map((image, index) => (
            <Image
              key={image}
              src={image}
              alt={index === activeImage ? product.title : ''}
              aria-hidden={index !== activeImage}
              fill
              preload={priority && index === 0}
              sizes='(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw'
              className={`object-contain p-6 transition-opacity duration-500 ease-out sm:p-8 ${
                index === activeImage ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <Image
            src={images[0]}
            alt={product.title}
            fill
            preload={priority}
            sizes='(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw'
            className='object-contain p-6 sm:p-8'
          />
        )}
      </div>
    </Link>
  );
}
