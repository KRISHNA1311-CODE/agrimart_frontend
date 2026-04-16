import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, ShoppingCart, Tag, Package, TrendingUp, FileText, ShoppingBag, CreditCard, MapPin, Phone, User as UserIcon, Clock, CheckCircle, XCircle, Box, Truck } from 'lucide-react';
import { Product, User, Order } from '../types';
import { formatCurrency } from '../constants';

interface ProductDetailModalProps {
  product: Product | null;
  user: User | null;
  onClose: () => void;
  onGenerateInvoice: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetailModal({ product, user, onClose, onGenerateInvoice, onAddToCart, onBuyNow }: ProductDetailModalProps) {
  if (!product) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors md:hidden"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            
            <div className="md:w-1/2 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">{product.name}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors hidden md:block"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-slate-600 font-medium">Price</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(product.price)}/{product.unit}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Stock</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{product.stockLevel} {product.unit}</p>
                  </div>
                  <div className="p-4 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Demand</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{product.demandScore}%</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {isAdmin ? (
                    <button 
                      onClick={onGenerateInvoice}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      <FileText className="w-5 h-5" />
                      Generate Invoice
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          onAddToCart(product);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button 
                        onClick={() => onBuyNow(product)}
                        className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                      >
                        Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface InvoiceModalProps {
  product: Product | null;
  onClose: () => void;
}

export function InvoiceModal({ product, onClose }: InvoiceModalProps) {
  if (!product) return null;

  const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const date = new Date().toLocaleDateString();
  const tax = product.price * 0.18;
  const total = product.price + tax;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">AgriMart</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">INVOICE</h2>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-medium">Invoice Number</p>
                <p className="text-lg font-bold text-slate-900">{invoiceNumber}</p>
                <p className="text-slate-500 font-medium mt-2">Date</p>
                <p className="text-lg font-bold text-slate-900">{date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">From</p>
                <p className="font-bold text-slate-900">AgriMart Solutions</p>
                <p className="text-slate-500">123 Agriculture Hub</p>
                <p className="text-slate-500">New Delhi, India</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Bill To</p>
                <p className="font-bold text-slate-900">Valued Customer</p>
                <p className="text-slate-500">Client Address Line 1</p>
                <p className="text-slate-500">City, Country</p>
              </div>
            </div>

            <table className="w-full mb-12">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-left py-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Description</th>
                  <th className="text-center py-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Qty</th>
                  <th className="text-right py-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Unit Price</th>
                  <th className="text-right py-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="py-6">
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.category} - Premium Quality</p>
                  </td>
                  <td className="text-center py-6 font-medium text-slate-900">1 {product.unit}</td>
                  <td className="text-right py-6 font-medium text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="text-right py-6 font-bold text-slate-900">{formatCurrency(product.price)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (18% GST)</span>
                  <span className="font-bold text-slate-900">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-end items-center gap-6">
              <p className="text-slate-400 text-sm mr-auto">Thank you for your business!</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button 
                  onClick={onClose}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  paymentMethod?: 'razorpay' | 'cod';
}

export function PaymentConfirmationModal({ isOpen, onClose, onConfirm, amount, paymentMethod = 'razorpay' }: PaymentConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              {paymentMethod === 'razorpay' ? (
                <CreditCard className="w-10 h-10 text-primary" />
              ) : (
                <ShoppingBag className="w-10 h-10 text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {paymentMethod === 'razorpay' ? 'Confirm Payment' : 'Confirm Order'}
            </h2>
            <p className="text-slate-500 mb-8">
              {paymentMethod === 'razorpay' ? (
                <>
                  You are about to make a payment of <span className="font-bold text-slate-900">{formatCurrency(amount)}</span> via <span className="text-blue-600 font-bold">Razorpay</span>. 
                  Would you like to proceed to the secure checkout?
                </>
              ) : (
                <>
                  You are about to place an order for <span className="font-bold text-slate-900">{formatCurrency(amount)}</span> using <span className="text-primary font-bold">Cash on Delivery</span>. 
                  A ₹50 COD charge is included.
                </>
              )}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="flex-[2] px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                {paymentMethod === 'razorpay' ? 'Confirm & Pay' : 'Confirm & Place Order'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error';
  message: string;
}

export function PaymentStatusModal({ isOpen, onClose, status, message }: PaymentStatusModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              status === 'success' ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              {status === 'success' ? (
                <TrendingUp className="w-10 h-10 text-emerald-600" />
              ) : (
                <X className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {status === 'success' ? 'Order Successful' : 'Order Failed'}
            </h2>
            <p className="text-slate-500 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 mb-8 text-slate-400 text-xs">
              <CreditCard className="w-3 h-3" />
              Secure Transaction Processing
            </div>
            <button 
              onClick={onClose}
              className={`w-full px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                status === 'success' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-red-600 shadow-red-200 hover:bg-red-700'
              }`}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DirectBuyModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shippingDetails: any) => void;
}


export function DirectBuyModal({ product, isOpen, onClose, onConfirm }: DirectBuyModalProps) {
  const [shipping, setShipping] = React.useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'razorpay' as 'razorpay' | 'cod'
  });

  if (!product) return null;

  const subtotal = product.price;
  const shippingCost = 50;
  const codCharge = shipping.paymentMethod === 'cod' ? 50 : 0;
  const total = subtotal + shippingCost + codCharge;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>
              <div className="flex items-center gap-4 mb-6">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                  <p className="text-slate-500 text-xs">{formatCurrency(product.price)}</p>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                {shipping.paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>COD Charge</span>
                    <span>{formatCurrency(codCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-primary pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Shipping Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      Full Name
                    </label>
                    <input 
                      type="text"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Delivery Address
                  </label>
                  <textarea 
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    placeholder="House No, Street, Landmark..."
                    rows={2}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">City</label>
                    <input 
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      placeholder="New Delhi"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Pincode</label>
                    <input 
                      type="text"
                      value={shipping.pincode}
                      onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                      placeholder="110001"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block">Payment Method</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setShipping({ ...shipping, paymentMethod: 'razorpay' })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        shipping.paymentMethod === 'razorpay' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Online Payment</p>
                        <p className="text-xs opacity-70">Razorpay</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setShipping({ ...shipping, paymentMethod: 'cod' })}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        shipping.paymentMethod === 'cod' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-xs opacity-70">+ ₹50 Charge</p>
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => onConfirm(shipping)}
                  disabled={!shipping.name || !shipping.phone || !shipping.address}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & {shipping.paymentMethod === 'razorpay' ? 'Pay' : 'Place Order'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface OrderDetailsModalProps {
  order: Order | null;
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, product, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {order.id}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Product Info */}
              {product && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(product.price)} / {product.unit}</p>
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Order Date</p>
                  <p className="text-sm font-bold text-slate-900">{order.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Amount</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                  <p className="text-sm font-bold text-slate-900">{order.paymentMethod || 'N/A'}</p>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Shipping Details</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.customer}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      {order.customerPhone && <p className="text-xs text-slate-500">{order.customerPhone}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-900">{order.shippingAddress || 'N/A'}</p>
                      <p className="text-sm text-slate-900">{order.city}{order.pincode ? `, ${order.pincode}` : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={onClose}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface TrackOrderModalProps {
  order: Order | null;
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TrackOrderModal({ order, product, isOpen, onClose }: TrackOrderModalProps) {
  if (!order) return null;

  const steps = [
    { status: 'Pending', label: 'Order Placed', icon: ShoppingBag, desc: 'We have received your order' },
    { status: 'Processing', label: 'Processing', icon: Box, desc: 'Your order is being processed' },
    { status: 'Packing', label: 'Packing', icon: Package, desc: 'Items are being packed for shipping' },
    { status: 'Shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on its way' },
    { status: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin, desc: 'Order is arriving today' },
    { status: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Order has been delivered' },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Track Order</h2>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {order.id}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-8">
              {product && (
                <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">{formatCurrency(order.total)} • {order.date}</p>
                  </div>
                </div>
              )}

              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Order Cancelled</h3>
                  <p className="text-slate-500 mt-2">This order has been cancelled and will not be processed further.</p>
                </div>
              ) : (
                <div className="relative space-y-8">
                  {/* Progress Line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />
                  <div 
                    className="absolute left-[19px] top-2 w-0.5 bg-primary transition-all duration-1000" 
                    style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                  />

                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.status} className="flex gap-6 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-300 border-2 border-slate-100'
                        } ${isCurrent ? 'ring-4 ring-primary/10' : ''}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={onClose}
                className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
