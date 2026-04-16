import { create } from 'zustand';
import { Product } from '../types';
import { products as initialProducts } from '../data/mockData';
import { sendLowStockAlert } from '../services/notificationService';

interface ProductState {
  products: Product[];
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpload: (newProducts: Omit<Product, 'id'>[]) => void;
  orderMore: (id: string) => void;
  decrementStock: (id: string, quantity: number) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: initialProducts,
  searchQuery: '',
  selectedCategory: 'All Categories',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  addProduct: (product) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ products: [...state.products, { ...product, id }] }));
  },
  updateProduct: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    }));
    if (updatedProduct.stockLevel < 100) {
      sendLowStockAlert(updatedProduct.name, updatedProduct.stockLevel);
    }
  },
  deleteProduct: (id) => {
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },
  bulkUpload: (newProducts) => {
    const productsWithIds = newProducts.map((p) => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9),
    }));
    set((state) => ({ products: [...state.products, ...productsWithIds] }));
  },
  orderMore: (id) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, stockLevel: p.stockLevel + 100 } : p
      ),
    }));
  },
  decrementStock: (id, quantity) => {
    set((state) => ({
      products: state.products.map((p) => {
        if (p.id === id) {
          const newStock = p.stockLevel - quantity;
          if (newStock < 100) {
            sendLowStockAlert(p.name, newStock);
          }
          return { ...p, stockLevel: newStock };
        }
        return p;
      }),
    }));
  },
}));
