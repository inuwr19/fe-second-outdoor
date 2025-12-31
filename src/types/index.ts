export interface Product {
  id: string;
  slug: string;

  name: string;
  price: number;
  description: string;

  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  conditionLabel: 'New' | 'Like New' | 'Good' | 'Fair';

  size: string;
  stock: number;

  status?: 'active' | 'sold_out' | 'reserved' | string;

  image: string;
  createdAt: string;
}

export interface User {
  id: string | number;
  email: string;
  name: string;
  address: string;
  phone: string;
  role?: 'admin' | 'customer' | string;
  avatar?: string;
}

export interface CartItem {
  id?: string; // id CartItem dari backend (optional untuk guest/local)
  product: Product;
  quantity: number;
  price_snapshot?: number; // optional jika Anda ingin total pakai snapshot
}

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cod';

export type TransactionStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: Date;
  paidAt?: Date;
}

export interface Invoice {
  id: string;
  transactionId: string;
  invoiceNumber: string;
  user: User;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: Date;
  paidAt?: Date;
}
