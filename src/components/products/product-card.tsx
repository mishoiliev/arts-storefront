import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { ProductCardMedia } from '@/components/products/product-card-media';
import { Rating } from '@/components/products/rating';
import { formatCategory, formatPrice } from '@/lib/format';
import { getDiscount } from '@/lib/pricing';
import type { Product } from '@/types/product';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { salePrice, savingsAmount } = getDiscount(product.price, product.discountPercentage);
  const cartProduct = {
    id: product.id,
    title: product.title,
    price: salePrice,
    thumbnail: product.thumbnail,
  };

  return (
    <article
      data-testid='product-card'
      data-product-id={product.id}
      data-category={product.category}
      data-price={salePrice}
      data-in-stock={product.stock > 0}
      className='group flex min-w-0 flex-col'
    >
      <ProductCardMedia
        product={product}
        priority={priority}
        savingsAmount={savingsAmount}
      />

      <div className='flex flex-1 flex-col pt-4'>
        <div className='flex items-center justify-between gap-3'>
          <p className='truncate text-[10px] font-semibold tracking-[0.14em] text-muted uppercase'>
            {formatCategory(product.category)}
          </p>
          <Rating value={product.rating} />
        </div>
        <h3 className='mt-2 min-h-12'>
          <Link
            href={`/products/${product.id}`}
            className='line-clamp-2 text-[15px] leading-6 font-semibold tracking-[-0.02em] text-ink transition group-hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-base'
          >
            {product.title}
          </Link>
        </h3>
        <p className='mt-2 mb-4 flex items-baseline gap-2 text-sm font-semibold text-ink tabular-nums'>
          {formatPrice(salePrice)}
          {savingsAmount > 0 ? (
            <span className='font-normal text-muted line-through'>
              {formatPrice(product.price)}
            </span>
          ) : null}
        </p>
        <div className='mt-auto'>
          <AddToCartButton
            product={cartProduct}
            outOfStock={product.stock <= 0}
          />
        </div>
      </div>
    </article>
  );
}
