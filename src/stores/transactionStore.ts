import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, CartItem, PaymentMethod, TransactionStatus, Invoice, User } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  createTransaction: (items: CartItem[], paymentMethod: PaymentMethod, userId: string) => Transaction;
  updateTransactionStatus: (transactionId: string, status: TransactionStatus) => void;
  getTransaction: (transactionId: string) => Transaction | undefined;
  getUserTransactions: (userId: string) => Transaction[];
  generateInvoice: (transactionId: string, user: User) => Invoice | null;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      currentTransaction: null,
      
      createTransaction: (items: CartItem[], paymentMethod: PaymentMethod, userId: string) => {
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        
        const transaction: Transaction = {
          id: 'txn-' + Date.now(),
          userId,
          items,
          total,
          paymentMethod,
          status: 'pending',
          createdAt: new Date(),
        };
        
        set((state) => ({
          transactions: [...state.transactions, transaction],
          currentTransaction: transaction,
        }));
        
        return transaction;
      },
      
      updateTransactionStatus: (transactionId: string, status: TransactionStatus) => {
        set((state) => ({
          transactions: state.transactions.map((txn) =>
            txn.id === transactionId
              ? { 
                  ...txn, 
                  status, 
                  paidAt: status === 'success' ? new Date() : txn.paidAt 
                }
              : txn
          ),
          currentTransaction: state.currentTransaction?.id === transactionId
            ? { 
                ...state.currentTransaction, 
                status,
                paidAt: status === 'success' ? new Date() : state.currentTransaction.paidAt
              }
            : state.currentTransaction,
        }));
      },
      
      getTransaction: (transactionId: string) => {
        return get().transactions.find((txn) => txn.id === transactionId);
      },
      
      getUserTransactions: (userId: string) => {
        return get().transactions.filter((txn) => txn.userId === userId);
      },
      
      generateInvoice: (transactionId: string, user: User) => {
        const transaction = get().getTransaction(transactionId);
        if (!transaction) return null;
        
        const subtotal = transaction.total;
        const tax = Math.round(subtotal * 0.11); // 11% PPN
        
        const invoice: Invoice = {
          id: 'inv-' + Date.now(),
          transactionId: transaction.id,
          invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          user,
          items: transaction.items,
          subtotal,
          tax,
          total: subtotal + tax,
          paymentMethod: transaction.paymentMethod,
          status: transaction.status,
          createdAt: transaction.createdAt,
          paidAt: transaction.paidAt,
        };
        
        return invoice;
      },
    }),
    {
      name: 'thrift-transactions',
    }
  )
);
