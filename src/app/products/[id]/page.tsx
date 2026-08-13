import {
  faArrowLeft,
  faRotateLeft,
  faShieldHalved,
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { QuickBuyButton } from '@/components/cart/quick-buy-button';
import { ProductGallery } from '@/components/products/product-gallery';
import { Rating } from '@/components/products/rating';
import { formatCategory, formatPercentage, formatPrice } from '@/lib/format';
import { getDiscount } from '@/lib/pricing';
import { getProductGalleryImages } from '@/lib/product-images';
import { getProduct } from '@/lib/products';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return { title: 'Product not found' };
  }

  const product = await getProduct(id);

  if (!product) {
    return { title: 'Product not found' };
  }

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const { salePrice, savingsAmount } = getDiscount(product.price, product.discountPercentage);
  const cartProduct = {
    id: product.id,
    title: product.title,
    price: salePrice,
    thumbnail: product.thumbnail,
  };
  const galleryImages = getProductGalleryImages(product);

  return (
    <div className='mx-auto w-full max-w-350 px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16'>
      <Link
        href='/#collection'
        className='mb-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.13em] text-muted uppercase transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className='size-3'
        />
        Back to collection
      </Link>

      <div className='grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] lg:gap-14 xl:gap-20'>
        <ProductGallery
          images={galleryImages}
          title={product.title}
        />

        <section className='self-start lg:sticky lg:top-32'>
          <div className='flex items-center justify-between gap-4'>
            <p className='text-xs font-semibold tracking-[0.17em] text-accent uppercase'>
              {formatCategory(product.category)}
            </p>
            <Rating value={product.rating} />
          </div>

          <h1 className='mt-5 text-4xl leading-[1.02] font-semibold tracking-[-0.055em] text-balance text-ink sm:text-5xl lg:text-[3.35rem]'>
            {product.title}
          </h1>
          {product.brand ? <p className='mt-3 text-sm text-muted'>By {product.brand}</p> : null}

          <div className='mt-8 flex items-center gap-3 border-y border-line py-5'>
            <p className='text-2xl font-semibold tracking-[-0.03em] text-ink tabular-nums'>
              {formatPrice(salePrice)}
            </p>
            {product.discountPercentage > 0 ? (
              <>
                <p className='text-base text-muted tabular-nums line-through'>
                  {formatPrice(product.price)}
                </p>
                <span className='rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-accent uppercase'>
                  {formatPercentage(product.discountPercentage)}% off ({formatPrice(savingsAmount)})
                </span>
              </>
            ) : null}
          </div>

          <p className='mt-7 text-base leading-7 text-muted'>{product.description}</p>

          <div className='mt-7 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ink uppercase'>
            <span
              className={`size-2 rounded-full ${product.stock > 0 ? 'bg-sage' : 'bg-accent'}`}
            />
            {product.stock > 0
              ? product.availabilityStatus || `${product.stock} available`
              : 'Out of stock'}
          </div>

          <div className='mt-7 grid grid-cols-2 gap-3'>
            <AddToCartButton
              product={cartProduct}
              variant='primary'
              outOfStock={product.stock <= 0}
            />
            <QuickBuyButton
              product={cartProduct}
              outOfStock={product.stock <= 0}
            />
          </div>

          <ul className='mt-8 divide-y divide-line border-y border-line'>
            {[
              {
                icon: faTruckFast,
                title: 'Fast delivery',
                copy: 'Shipping calculated at checkout',
              },
              {
                icon: faRotateLeft,
                title: 'Easy returns',
                copy: 'Return within 30 days',
              },
              {
                icon: faShieldHalved,
                title: 'Session-safe cart',
                copy: 'Stored only for this browser session',
              },
            ].map((detail) => (
              <li
                key={detail.title}
                className='flex items-center gap-4 py-4'
              >
                <FontAwesomeIcon
                  icon={detail.icon}
                  className='size-4 text-accent'
                />
                <div>
                  <p className='text-sm font-semibold text-ink'>{detail.title}</p>
                  <p className='mt-0.5 text-xs text-muted'>{detail.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
