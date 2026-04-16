import { useMemo } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SalesAnalysis from './components/SalesAnalysis';
import ProductDemand from './components/ProductDemand';
import ProductList from './components/ProductList';
import InventoryView from './components/InventoryView';
import AnalyticsView from './components/AnalyticsView';
import OrdersView from './components/OrdersView';
import Login from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, Package, IndianRupee, FileText, LogOut, DollarSign, Search } from 'lucide-react';
import { Product, Order } from './types';
import { formatCurrency } from './constants';
import { ProductDetailModal, InvoiceModal, PaymentConfirmationModal, PaymentStatusModal, DirectBuyModal, TrackOrderModal, OrderDetailsModal } from './components/Modals';
import CartView from './components/CartView';
import { handlePayRazorpay } from './services/paymentService';
import { useAuthStore } from './store/useAuthStore';
import { useProductStore } from './store/useProductStore';
import { useCartStore } from './store/useCartStore';
import { useOrderStore } from './store/useOrderStore';
import { useUIStore } from './store/useUIStore';

export default function App() {
  const { user, setUser, logout } = useAuthStore();
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    orderMore,
    decrementStock
  } = useProductStore();
  const { cart, addToCart, clearCart } = useCartStore();
  const { orders, addOrders } = useOrderStore();
  const {
    currentView,
    setCurrentView,
    selectedProduct,
    setSelectedProduct,
    isInvoiceOpen,
    setIsInvoiceOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    isDirectBuyOpen,
    setIsDirectBuyOpen,
    isTrackingOpen,
    isOrderDetailsOpen,
    selectedOrder,
    confirmAmount,
    setConfirmAmount,
    confirmPaymentMethod,
    setConfirmPaymentMethod,
    onConfirmAction,
    setOnConfirmAction,
    statusModal,
    setStatusModal,
    closeModals
  } = useUIStore();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleCheckout = async (shippingDetails: any) => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = 50;
    const codCharge = shippingDetails.paymentMethod === 'cod' ? 50 : 0;
    const total = subtotal + shippingCost + codCharge;
    
    setConfirmAmount(total);
    setConfirmPaymentMethod(shippingDetails.paymentMethod);
    setOnConfirmAction({
      action: async () => {
        setIsConfirmOpen(false);
        
        const placeOrder = (paymentId?: string) => {
          const newOrders: Order[] = cart.map(item => ({
            id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            customer: shippingDetails.name || user?.displayName || user?.email || 'Customer',
            customerEmail: shippingDetails.email || user?.email,
            customerPhone: shippingDetails.phone,
            shippingAddress: shippingDetails.address,
            city: shippingDetails.city,
            pincode: shippingDetails.pincode,
            date: new Date().toISOString().split('T')[0],
            total: item.price * item.quantity + (shippingCost / cart.length) + (codCharge / cart.length),
            status: 'Pending',
            paymentStatus: shippingDetails.paymentMethod === 'razorpay' ? 'Paid' : 'Pending',
            paymentMethod: shippingDetails.paymentMethod === 'razorpay' ? 'Razorpay' : 'COD',
            productId: item.productId
          }));

          addOrders(newOrders);
          
          // Update stock levels
          cart.forEach(item => decrementStock(item.productId, item.quantity));

          clearCart();
          setCurrentView('orders');

          setStatusModal({
            isOpen: true,
            status: 'success',
            message: shippingDetails.paymentMethod === 'razorpay' 
              ? 'Payment successful! Order placed.' 
              : 'Order placed successfully! Please keep ₹' + total + ' ready for Cash on Delivery.'
          });
        };

        if (shippingDetails.paymentMethod === 'razorpay') {
          handlePayRazorpay(
            total, 
            user, 
            (paymentId) => placeOrder(paymentId),
            (message) => setStatusModal({ isOpen: true, status: 'error', message })
          );
        } else {
          placeOrder();
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleDirectBuyConfirm = async (shippingDetails: any) => {
    setIsDirectBuyOpen(false);
    const subtotal = selectedProduct!.price;
    const shippingCost = 50;
    const codCharge = shippingDetails.paymentMethod === 'cod' ? 50 : 0;
    const total = subtotal + shippingCost + codCharge;

    setConfirmAmount(total);
    setConfirmPaymentMethod(shippingDetails.paymentMethod);
    setOnConfirmAction({
      action: async () => {
        setIsConfirmOpen(false);
        
        const placeOrder = (paymentId?: string) => {
          const newOrder: Order = {
            id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            customer: shippingDetails.name || user?.displayName || user?.email || 'Customer',
            customerEmail: shippingDetails.email || user?.email,
            customerPhone: shippingDetails.phone,
            shippingAddress: shippingDetails.address,
            city: shippingDetails.city,
            pincode: shippingDetails.pincode,
            date: new Date().toISOString().split('T')[0],
            total: total,
            status: 'Pending',
            paymentStatus: shippingDetails.paymentMethod === 'razorpay' ? 'Paid' : 'Pending',
            paymentMethod: shippingDetails.paymentMethod === 'razorpay' ? 'Razorpay' : 'COD',
            productId: selectedProduct!.id
          };

          addOrders([newOrder]);
          decrementStock(selectedProduct!.id, 1);

          setCurrentView('orders');
          setSelectedProduct(null);

          setStatusModal({
            isOpen: true,
            status: 'success',
            message: shippingDetails.paymentMethod === 'razorpay' 
              ? 'Payment successful! Order placed.' 
              : 'Order placed successfully! Please keep ₹' + total + ' ready for Cash on Delivery.'
          });
        };

        if (shippingDetails.paymentMethod === 'razorpay') {
          handlePayRazorpay(
            total, 
            user, 
            (paymentId) => placeOrder(paymentId),
            (message) => setStatusModal({ isOpen: true, status: 'error', message })
          );
        } else {
          placeOrder();
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleExportReport = () => {
    const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Demand Score'];
    const csvRows = products.map(p => [p.id, p.name, p.category, p.price, p.stockLevel, p.demandScore].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `agri_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const totalRevenue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price * p.stockLevel * 0.1), 0);
  }, [products]);

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue / 1000), change: '+12.5%', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Orders', value: '1,240', change: '+5.2%', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: '850', change: '+18.1%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Market Demand', value: 'High', change: 'Stable', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'inventory':
        return <InventoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'orders':
        return <OrdersView />;
      case 'cart':
        return <CartView onCheckout={handleCheckout} />;
      default:
        return (
          <>
            {user.role === 'admin' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-2xl card-shadow border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          stat.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-50'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 gap-8 mb-12">
                  <SalesAnalysis />
                  <ProductDemand />
                </div>
              </>
            )}

            {/* Product Inventory Section */}
            <ProductList />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardHeader 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onExport={handleExportReport}
        user={user}
        onLogout={logout}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <ProductDetailModal 
        product={selectedProduct} 
        user={user}
        onClose={closeModals} 
        onGenerateInvoice={() => setIsInvoiceOpen(true)}
        onAddToCart={addToCart}
        onBuyNow={(p) => { setSelectedProduct(p); setIsDirectBuyOpen(true); }}
      />

      {isInvoiceOpen && (
        <InvoiceModal 
          product={selectedProduct} 
          onClose={() => setIsInvoiceOpen(false)} 
        />
      )}

      <PaymentConfirmationModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => onConfirmAction?.action()}
        amount={confirmAmount}
        paymentMethod={confirmPaymentMethod}
      />

      <DirectBuyModal
        product={selectedProduct}
        isOpen={isDirectBuyOpen}
        onClose={() => setIsDirectBuyOpen(false)}
        onConfirm={handleDirectBuyConfirm}
      />

      <PaymentStatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        status={statusModal.status}
        message={statusModal.message}
      />

      <TrackOrderModal
        order={selectedOrder}
        product={products.find(p => p.id === selectedOrder?.productId) || null}
        isOpen={isTrackingOpen}
        onClose={closeModals}
      />

      <OrderDetailsModal
        order={selectedOrder}
        product={products.find(p => p.id === selectedOrder?.productId) || null}
        isOpen={isOrderDetailsOpen}
        onClose={closeModals}
      />

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">AgriMart</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 AgriMart. Empowering farmers with data-driven insights.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}



