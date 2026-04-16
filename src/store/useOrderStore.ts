import { create } from 'zustand';
import { Order } from '../types';
import { orders as initialOrders } from '../data/mockData';
import { sendOrderStatusUpdate, sendPaymentReceivedNotification } from '../services/notificationService';

interface OrderState {
  orders: Order[];
  addOrders: (newOrders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: initialOrders,
  addOrders: (newOrders) => set((state) => ({ orders: [...newOrders, ...state.orders] })),
  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const updatedOrders = state.orders.map((o) => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status };
          if (status === 'Delivered' && o.paymentMethod === 'COD') {
            updatedOrder.paymentStatus = 'Paid';
          }
          return updatedOrder;
        }
        return o;
      });

      const order = updatedOrders.find((o) => o.id === orderId);
      if (order) {
        sendOrderStatusUpdate(order.id, status, order.customer);
        if (status === 'Delivered' && order.paymentMethod === 'COD') {
          sendPaymentReceivedNotification(order.id, order.total, order.customer);
        }
      }

      return { orders: updatedOrders };
    });
  },
}));
