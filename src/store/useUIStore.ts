import { create } from 'zustand';
import { Product, Order } from '../types';

interface UIState {
  currentView: string;
  selectedProduct: Product | null;
  isInvoiceOpen: boolean;
  isConfirmOpen: boolean;
  isDirectBuyOpen: boolean;
  isTrackingOpen: boolean;
  isOrderDetailsOpen: boolean;
  selectedOrder: Order | null;
  confirmAmount: number;
  confirmPaymentMethod: 'razorpay' | 'cod';
  onConfirmAction: { action: () => void } | null;
  statusModal: {
    isOpen: boolean;
    status: 'success' | 'error';
    message: string;
  };
  setCurrentView: (view: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedOrder: (order: Order | null) => void;
  setIsInvoiceOpen: (isOpen: boolean) => void;
  setIsConfirmOpen: (isOpen: boolean) => void;
  setIsDirectBuyOpen: (isOpen: boolean) => void;
  setIsTrackingOpen: (isOpen: boolean) => void;
  setIsOrderDetailsOpen: (isOpen: boolean) => void;
  setConfirmAmount: (amount: number) => void;
  setConfirmPaymentMethod: (method: 'razorpay' | 'cod') => void;
  setOnConfirmAction: (action: { action: () => void } | null) => void;
  setStatusModal: (modal: { isOpen: boolean; status: 'success' | 'error'; message: string }) => void;
  closeModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'dashboard',
  selectedProduct: null,
  selectedOrder: null,
  isInvoiceOpen: false,
  isConfirmOpen: false,
  isDirectBuyOpen: false,
  isTrackingOpen: false,
  isOrderDetailsOpen: false,
  confirmAmount: 0,
  confirmPaymentMethod: 'razorpay',
  onConfirmAction: null,
  statusModal: { isOpen: false, status: 'success', message: '' },
  setCurrentView: (currentView) => set({ currentView }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
  setIsInvoiceOpen: (isInvoiceOpen) => set({ isInvoiceOpen }),
  setIsConfirmOpen: (isConfirmOpen) => set({ isConfirmOpen }),
  setIsDirectBuyOpen: (isDirectBuyOpen) => set({ isDirectBuyOpen }),
  setIsTrackingOpen: (isTrackingOpen) => set({ isTrackingOpen }),
  setIsOrderDetailsOpen: (isOrderDetailsOpen) => set({ isOrderDetailsOpen }),
  setConfirmAmount: (confirmAmount) => set({ confirmAmount }),
  setConfirmPaymentMethod: (confirmPaymentMethod) => set({ confirmPaymentMethod }),
  setOnConfirmAction: (onConfirmAction) => set({ onConfirmAction }),
  setStatusModal: (statusModal) => set({ statusModal }),
  closeModals: () => set({ 
    selectedProduct: null, 
    selectedOrder: null,
    isInvoiceOpen: false, 
    isConfirmOpen: false, 
    isDirectBuyOpen: false,
    isTrackingOpen: false,
    isOrderDetailsOpen: false
  }),
}));
