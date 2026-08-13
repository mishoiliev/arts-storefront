export default function Loading() {
  return (
    <div
      className='mx-auto w-full max-w-350 animate-pulse px-5 py-16 sm:px-8 lg:px-12'
      aria-label='Loading products'
    >
      <div className='h-12 w-2/3 rounded-[2rem] bg-surface sm:h-20' />
      <div className='mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className='aspect-4/5 rounded-3xl bg-surface' />
            <div className='mt-4 h-4 w-3/4 rounded bg-surface' />
            <div className='mt-3 h-4 w-1/3 rounded bg-surface' />
          </div>
        ))}
      </div>
    </div>
  );
}
