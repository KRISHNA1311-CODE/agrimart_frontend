export interface Product {
  id: string;
  name: string;
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Legumes';
  price: number;
  unit: string;
  demandScore: number; // 0-100
  stockLevel: number;
  image: string;
}

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

export interface CategoryDemand {
  name: string;
  value: number;
}

export interface Order {
  id: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  city?: string;
  pincode?: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Packing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod?: 'Razorpay' | 'COD';
  productId?: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}
