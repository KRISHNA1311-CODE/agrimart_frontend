import { motion, AnimatePresence } from 'motion/react';
import { Package, ShoppingCart, Info, Search, Eye } from 'lucide-react';
import { Product, User } from '../types';
import { formatCurrency } from '../constants';

import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useUIStore } from '../store/useUIStore';

export default function ProductList() {
  const { user } = useAuthStore();
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    orderMore 
  } = useProductStore();
  const { addToCart } = useCartStore();
  const { setSelectedProduct, setIsDirectBuyOpen } = useUIStore();

  const isAdmin = user?.role === 'admin';

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="mt-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Inventory</h2>
          <p className="text-slate-500">Manage and monitor your agricultural stock</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All Categories</option>
            <option>Grains</option>
            <option>Vegetables</option>
            <option>Fruits</option>
            <option>Legumes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden card-shadow border border-slate-100 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-primary">
                    {product.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                    <span className="text-primary font-bold">{formatCurrency(product.price)}/{product.unit}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 mb-6">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Stock Level</span>
                        <span className="font-medium text-slate-900">{product.stockLevel} {product.unit}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((product.stockLevel / 2000) * 100, 100)}%` }}
                          className="bg-primary h-full rounded-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isAdmin ? (
                      <button 
                        onClick={() => orderMore(product.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-opacity-90 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Order More
                      </button>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <button 
                          onClick={() => addToCart(product)}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 active:scale-95 transition-all"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedProduct(product); setIsDirectBuyOpen(true); }}
                          className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-opacity-90 active:scale-95 transition-all"
                        >
                          Buy Now
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="w-12 h-12 mb-4 opacity-20" />
              <p>No products found matching your criteria</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}


