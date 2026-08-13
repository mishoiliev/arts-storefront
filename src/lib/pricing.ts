// DummyJSON's `price` is the list price and `discountPercentage` is taken off
// it, so the sale price below is what gets displayed and charged in the cart.
export function getDiscount(price: number, discountPercentage: number) {
  if (discountPercentage <= 0 || discountPercentage >= 100) {
    return { salePrice: price, savingsAmount: 0 };
  }
  const salePrice = Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
  return {
    salePrice,
    savingsAmount: Math.round((price - salePrice) * 100) / 100,
  };
}
