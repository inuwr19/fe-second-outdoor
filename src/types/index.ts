export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair';
  category: string;
  image: string;
  size: string;
  stock: number; // Always 1 for thrift items, 0 when sold
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  address: string;
  phone: string;
  avatar?: string;
}

export interface CartItem {
  product: Product;
  quantity: number; // Always 1 for thrift items
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
