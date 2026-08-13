import {
  faArrowRight,
  faBagShopping,
  faMagnifyingGlass,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';

import { CatalogControls } from '@/components/products/catalog-controls';
import { CatalogPagination } from '@/components/products/catalog-pagination';
import { ProductCard } from '@/components/products/product-card';
import { type CatalogSearchParams, getCatalogResult, parseCatalogFilters } from '@/lib/catalog';
import { formatCategory, formatPrice } from '@/lib/format';
import { getDiscount } from '@/lib/pricing';
import { getProducts } from '@/lib/products';

type HomeProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [{ products, total }, rawSearchParams] = await Promise.all([getProducts(), searchParams]);
  const filters = parseCatalogFilters(rawSearchParams);
  const result = getCatalogResult(products, filters);
  const categoryCounts = products.reduce<Map<string, number>>(
    (counts, product) => counts.set(product.category, (counts.get(product.category) ?? 0) + 1),
    new Map()
  );
  const categories = Array.from(categoryCounts, ([value, count]) => ({
    value,
    count,
  })).toSorted((left, right) => left.value.localeCompare(right.value));
  const heroCategories = categories
    .toSorted((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, 4);
  const categoryShowcaseProducts = [
    { category: 'furniture', preferredId: 12 },
    { category: 'fragrances', preferredId: 7 },
    { category: 'beauty', preferredId: 4 },
  ].flatMap(({ category, preferredId }) => {
    const product =
      products.find((item) => item.id === preferredId && item.stock > 0) ??
      products.find((item) => item.category === category && item.stock > 0);

    return product ? [product] : [];
  });
  const showcaseProducts = [
    ...categoryShowcaseProducts,
    ...products.filter(
      (product) => !categoryShowcaseProducts.some((item) => item.id === product.id)
    ),
  ].slice(0, 3);
  const [leadProduct, ...supportingProducts] = showcaseProducts;
  const firstVisible = result.filteredTotal === 0 ? 0 : (result.page - 1) * filters.pageSize + 1;
  const lastVisible = Math.min(result.page * filters.pageSize, result.filteredTotal);

  return (
    <>
      <section
        aria-labelledby='hero-heading'
        className='overflow-hidden border-b border-line'
      >
        <div className='mx-auto grid max-w-350 gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(560px,1.18fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-12'>
          <div className='py-4 lg:py-8'>
            <p className='mb-5 text-xs font-semibold tracking-[0.18em] text-accent uppercase'>
              {total} products · {categories.length} categories
            </p>
            <h1
              id='hero-heading'
              className='max-w-2xl text-[clamp(3.6rem,6.6vw,7.2rem)] leading-[0.88] font-semibold tracking-[-0.07em] text-balance text-ink'
            >
              Shop everyday essentials.
            </h1>
            <p className='mt-7 max-w-xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8'>
              Browse beauty, home, groceries, tech, and more. Search the full catalog or narrow it
              by category, price, and availability.
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-3'>
              <Link
                href='#collection'
                className='inline-flex min-h-12 items-center gap-3 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
              >
                Browse all products
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className='size-3'
                />
              </Link>
              <Link
                href='/?availability=in-stock#collection'
                className='inline-flex min-h-12 items-center rounded-full border border-line bg-canvas px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
              >
                Shop in stock
              </Link>
            </div>

            <div className='mt-10 border-t border-line pt-5'>
              <p className='text-[10px] font-semibold tracking-[0.16em] text-muted uppercase'>
                Popular categories
              </p>
              <div className='mt-3 flex flex-wrap gap-x-5 gap-y-2'>
                {heroCategories.map((category) => (
                  <Link
                    key={category.value}
                    href={`/?category=${encodeURIComponent(category.value)}#collection`}
                    className='group inline-flex items-center gap-2 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'
                  >
                    {formatCategory(category.value)}
                    <span className='text-xs font-normal text-muted tabular-nums transition group-hover:text-accent'>
                      {category.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className='grid min-h-115 grid-cols-[minmax(0,1.25fr)_minmax(150px,0.75fr)] gap-3 rounded-[2rem] bg-ink p-3 shadow-[0_24px_70px_rgba(25,26,23,0.16)] sm:min-h-130 sm:gap-4 sm:p-4'>
            {leadProduct ? (
              <Link
                href={`/products/${leadProduct.id}`}
                className='group relative overflow-hidden rounded-[1.35rem] bg-[#d8d0c1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
              >
                <Image
                  src={leadProduct.thumbnail}
                  alt=''
                  fill
                  priority
                  sizes='(max-width: 1023px) 64vw, 36vw'
                  className='object-contain p-6 transition duration-500 ease-out group-hover:scale-[1.04] sm:p-10'
                />
                <div className='absolute inset-x-3 bottom-3 flex items-end justify-between gap-4 rounded-2xl bg-white/88 p-4 shadow-sm backdrop-blur-md sm:inset-x-4 sm:bottom-4 sm:p-5'>
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold tracking-[0.14em] text-muted uppercase'>
                      {formatCategory(leadProduct.category)}
                    </p>
                    <p className='mt-1 truncate text-sm font-semibold tracking-[-0.02em] text-ink sm:text-base'>
                      {leadProduct.title}
                    </p>
                    <p className='mt-1 text-xs font-semibold text-muted tabular-nums'>
                      {formatPrice(
                        getDiscount(leadProduct.price, leadProduct.discountPercentage).salePrice
                      )}
                    </p>
                  </div>
                  <span className='grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition group-hover:bg-accent'>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className='size-3'
                    />
                  </span>
                </div>
              </Link>
            ) : null}

            <div className='grid min-w-0 grid-rows-2 gap-3 sm:gap-4'>
              {supportingProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={`group relative overflow-hidden rounded-[1.35rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                    index === 0 ? 'bg-accent-soft text-ink' : 'bg-sage text-white'
                  }`}
                >
                  <Image
                    src={product.thumbnail}
                    alt=''
                    fill
                    priority
                    sizes='(max-width: 1023px) 32vw, 20vw'
                    className='object-contain p-4 pb-16 transition duration-500 ease-out group-hover:scale-[1.05] sm:p-6 sm:pb-18'
                  />
                  <div className='absolute inset-x-3 bottom-3 flex items-end justify-between gap-2'>
                    <div className='min-w-0'>
                      <p
                        className={`text-[9px] font-semibold tracking-[0.13em] uppercase ${
                          index === 0 ? 'text-muted' : 'text-white/65'
                        }`}
                      >
                        {formatCategory(product.category)}
                      </p>
                      <p className='mt-1 truncate text-xs font-semibold sm:text-sm'>
                        {product.title}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className='mb-1 size-3 shrink-0 transition group-hover:translate-x-0.5'
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label='Store benefits'
        className='border-b border-line'
      >
        <div className='mx-auto grid max-w-350 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12'>
          {[
            {
              icon: faMagnifyingGlass,
              title: 'Find it faster',
              copy: 'Search products, brands, and categories',
            },
            {
              icon: faSliders,
              title: 'Shop your way',
              copy: 'Narrow the choice by price and availability',
            },
            {
              icon: faBagShopping,
              title: 'Change your mind',
              copy: 'Adjust quantities or remove items anytime',
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className='flex items-center gap-4 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0'
            >
              <FontAwesomeIcon
                icon={benefit.icon}
                className='size-4 text-accent'
              />
              <div>
                <p className='text-xs font-semibold tracking-[0.12em] text-ink uppercase'>
                  {benefit.title}
                </p>
                <p className='mt-1 text-xs text-muted'>{benefit.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id='collection'
        aria-labelledby='collection-heading'
        className='scroll-mt-28 py-16 sm:py-20 lg:py-24'
      >
        <div className='mx-auto max-w-350 px-5 sm:px-8 lg:px-12'>
          <div className='mb-8 flex flex-col justify-between gap-4 border-b border-line pb-7 sm:flex-row sm:items-end'>
            <div>
              <p className='mb-2 text-xs font-semibold tracking-[0.18em] text-accent uppercase'>
                Shop all
              </p>
              <h2
                id='collection-heading'
                className='text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl'
              >
                The collection
              </h2>
            </div>
            <p
              className='text-sm text-muted tabular-nums'
              aria-live='polite'
            >
              {result.filteredTotal === 0
                ? `No matching pieces · ${total} total`
                : `Showing ${firstVisible}–${lastVisible} of ${result.filteredTotal} pieces`}
            </p>
          </div>

          <CatalogControls
            categories={categories}
            filters={filters}
          />

          {result.items.length > 0 ? (
            <div className='grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6'>
              {result.items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className='rounded-3xl border border-dashed border-line bg-surface/45 px-6 py-20 text-center'>
              <p className='text-xs font-semibold tracking-[0.16em] text-accent uppercase'>
                Nothing found
              </p>
              <h3 className='mt-3 text-2xl font-semibold tracking-[-0.035em] text-ink'>
                Try a broader search.
              </h3>
              <p className='mx-auto mt-3 max-w-md text-sm leading-6 text-muted'>
                Clear one or more filters to bring more considered pieces back into view.
              </p>
            </div>
          )}

          <CatalogPagination
            filters={filters}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </section>
    </>
  );
}
