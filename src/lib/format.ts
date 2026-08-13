const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return usdFormatter.format(value);
}

export function formatPercentage(value: number): string {
  return percentageFormatter.format(value);
}

export function formatCategory(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
