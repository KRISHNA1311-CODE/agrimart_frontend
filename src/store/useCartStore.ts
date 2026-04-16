import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  addToCart: (product) => {
    set((state) => {
      const existing = state.cart.find((item) => item.productId === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        cart: [
          ...state.cart,
          {
            id: Math.random().toString(36).substr(2, 9),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            unit: product.unit,
          },
        ],
      };
    });
  },
  updateQuantity: (productId, delta) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      ),
    }));
  },
  removeFromCart: (productId) => {
    set((state) => ({ cart: state.cart.filter((item) => item.productId !== productId) }));
  },
  clearCart: () => set({ cart: [] }),
}));
