export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  availabilityStatus?: string;
};

export type CartProduct = Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>;

export type CartItem = CartProduct & {
  quantity: number;
};
