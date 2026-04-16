import React, { useState, useRef } from 'react';
import { Product, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Search, Filter, Upload, X, Eye } from 'lucide-react';
import Papa from 'papaparse';
import { formatCurrency } from '../constants';

import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export default function InventoryView() {
  const { user } = useAuthStore();
  const { products, addProduct, updateProduct, deleteProduct, bulkUpload } = useProductStore();
  const { setSelectedProduct } = useUIStore();
  
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const editProductImageInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Grains',
    price: 0,
    unit: 'kg',
    demandScore: 50,
    stockLevel: 0,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
  });

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(newProduct);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      category: 'Grains',
      price: 0,
      unit: 'kg',
      demandScore: 50,
      stockLevel: 0,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const parsedProducts = results.data.map((row: any) => ({
            name: row.Name || row.name,
            category: row.Category || row.category || 'Grains',
            price: Number(row.Price || row.price || 0),
            unit: row.Unit || row.unit || 'kg',
            demandScore: Number(row.DemandScore || row.demandScore || 50),
            stockLevel: Number(row.StockLevel || row.stockLevel || 0),
            image: row.Image || row.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
          })).filter((p: any) => p.name);
          bulkUpload(parsedProducts);
        }
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: base64String });
        } else {
          setNewProduct({ ...newProduct, image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Add, edit, or remove products from your catalog</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-all"
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:text-primary transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Demand</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.tr 
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-semibold text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(product.price)}/{product.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.stockLevel < 500 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-slate-900 font-medium">{product.stockLevel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: `${product.demandScore}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-slate-400 hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    >
                      <option>Grains</option>
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Legumes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. kg, pcs"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.stockLevel}
                      onChange={(e) => setNewProduct({ ...newProduct, stockLevel: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => productImageInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-all overflow-hidden bg-slate-50"
                    >
                      {newProduct.image ? (
                        <img src={newProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-400 font-medium">Upload</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        ref={productImageInputRef}
                        onChange={(e) => handleImageUpload(e, false)}
                        accept="image/*"
                        className="hidden"
                      />
                      <input 
                        type="url" 
                        placeholder="Or paste image URL..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Upload a file or provide a URL</p>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all mt-4"
                >
                  Create Product
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    >
                      <option>Grains</option>
                      <option>Vegetables</option>
                      <option>Fruits</option>
                      <option>Legumes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. kg, pcs"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                      value={editingProduct.stockLevel}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockLevel: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => editProductImageInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-slate-50 transition-all overflow-hidden bg-slate-50"
                    >
                      {editingProduct.image ? (
                        <img src={editingProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-400 font-medium">Upload</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        ref={editProductImageInputRef}
                        onChange={(e) => handleImageUpload(e, true)}
                        accept="image/*"
                        className="hidden"
                      />
                      <input 
                        type="url" 
                        placeholder="Or paste image URL..."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={editingProduct.image.startsWith('data:') ? '' : editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Upload a file or provide a URL</p>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all mt-4"
                >
                  Update Product
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

