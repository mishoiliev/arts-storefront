import type { Metadata } from 'next';

import { CartPageContent } from '@/components/cart/cart-page-content';

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review the products in your Morrow cart.',
};

export default function CartPage() {
  return <CartPageContent />;
}
