'use client';

import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useMemo, useState } from 'react';

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const uniqueImages = useMemo(() => Array.from(new Set(images)), [images]);
  const [activeImage, setActiveImage] = useState(0);
  const imageCount = uniqueImages.length;
  const firstImage = uniqueImages[0];

  if (!firstImage) return null;

  if (imageCount === 1) {
    return (
      <section
        aria-label={`${title} product image`}
        data-testid='product-image'
        className='relative aspect-[4/5] min-w-0 overflow-hidden rounded-[2rem] bg-surface sm:aspect-square sm:rounded-[2.5rem] lg:aspect-[5/6]'
      >
        <Image
          src={firstImage}
          alt={title}
          fill
          preload
          sizes='(max-width: 1023px) 100vw, 56vw'
          className='object-contain p-8 sm:p-14 lg:p-16'
        />
      </section>
    );
  }

  function move(direction: -1 | 1) {
    setActiveImage((current) => (current + direction + imageCount) % imageCount);
  }

  return (
    <section
      aria-label={`${title} image gallery`}
      data-testid='product-gallery'
      data-active-image={activeImage}
      data-image-count={imageCount}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          move(-1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          move(1);
        }
      }}
      className='grid min-w-0 gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-5'
    >
      <div className='order-1 flex min-w-0 items-start gap-3 sm:flex-col'>
        <div className='flex shrink-0 gap-2'>
          <button
            type='button'
            onClick={() => move(-1)}
            aria-label='Previous product image'
            className='flex size-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-[border-color,background-color,color,transform] hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 sm:size-9'
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className='size-3'
            />
          </button>
          <button
            type='button'
            onClick={() => move(1)}
            aria-label='Next product image'
            className='flex size-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-[border-color,background-color,color,transform] hover:border-ink hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 sm:size-9'
          >
            <FontAwesomeIcon
              icon={faArrowRight}
              className='size-3'
            />
          </button>
        </div>

        <div className='flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 sm:w-full sm:flex-col sm:overflow-visible sm:pb-0'>
          {uniqueImages.map((image, index) => (
            <button
              key={image}
              type='button'
              onClick={() => setActiveImage(index)}
              aria-label={`View product image ${index + 1} of ${imageCount}`}
              aria-current={index === activeImage ? 'true' : undefined}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-2xl border bg-surface transition-[border-color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:w-full ${
                index === activeImage
                  ? 'scale-[0.96] border-ink shadow-[0_0_0_1px_var(--ink)]'
                  : 'border-transparent hover:border-line'
              }`}
            >
              <Image
                src={image}
                alt=''
                fill
                sizes='76px'
                className='object-contain p-2'
              />
            </button>
          ))}
        </div>
      </div>

      <div className='relative order-2 aspect-[4/5] min-w-0 overflow-hidden rounded-[2rem] bg-surface sm:aspect-square sm:rounded-[2.5rem] lg:aspect-[5/6]'>
        {uniqueImages.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={index === activeImage ? title : ''}
            aria-hidden={index !== activeImage}
            fill
            preload={index === 0}
            sizes='(max-width: 1023px) 100vw, 56vw'
            className={`object-contain p-8 transition-[opacity,transform] duration-500 ease-out sm:p-14 lg:p-16 ${
              index === activeImage ? 'scale-100 opacity-100' : 'scale-[1.015] opacity-0'
            }`}
          />
        ))}
        <p className='absolute right-4 bottom-4 rounded-full border border-line/80 bg-white/90 px-3 py-1.5 text-[0.66rem] font-semibold tracking-[0.16em] text-muted backdrop-blur-sm'>
          {String(activeImage + 1).padStart(2, '0')} / {String(imageCount).padStart(2, '0')}
        </p>
        <p
          className='sr-only'
          aria-live='polite'
        >
          Image {activeImage + 1} of {imageCount}
        </p>
      </div>
    </section>
  );
}
