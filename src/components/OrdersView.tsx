import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  Truck,
  Box,
  ChevronRight,
  Download,
  MapPin,
  Filter,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { formatCurrency } from "../constants";
import { Product, Order, User } from "../types";
import * as XLSX from "xlsx";

import { useOrderStore } from "../store/useOrderStore";
import { useProductStore } from "../store/useProductStore";
import { useAuthStore } from "../store/useAuthStore";
import { useUIStore } from "../store/useUIStore";

export default function OrdersView() {
  const { user } = useAuthStore();
  const { products } = useProductStore();
  const { orders, updateOrderStatus } = useOrderStore();
  const {
    setSelectedOrder,
    setIsTrackingOpen,
    setIsOrderDetailsOpen,
    setSelectedProduct,
  } = useUIStore();

  const isAdmin = user?.role === "admin";
  const userOrders = isAdmin
    ? orders
    : orders.filter((o) => o.customerEmail === user?.email);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filteredOrders = useMemo(() => {
    return userOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      const orderDate = new Date(order.date);
      const matchesStartDate = !startDate || orderDate >= new Date(startDate);
      const matchesEndDate = !endDate || orderDate <= new Date(endDate);
      return matchesStatus && matchesStartDate && matchesEndDate;
    });
  }, [userOrders, statusFilter, startDate, endDate]);

  const resetFilters = () => {
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
  };

  const exportToExcel = () => {
    const exportData = userOrders.map((order) => {
      const product = products.find((p) => p.id === order.productId);
      return {
        "Order ID": order.id,
        "Product Name": product?.name || "Product Removed",
        "Customer Name": order.customer,
        "Order Date": order.date,
        "Total Amount": order.total,
        "Payment Status": order.paymentStatus,
        "Payment Method": order.paymentMethod || "N/A",
        "Order Status": order.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Generate buffer and download
    XLSX.writeFile(
      workbook,
      `AgriMart_Orders_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handleViewProduct = (productId?: string) => {
    if (!productId) return;
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return {
          color: "bg-orange-50 text-orange-700 border-orange-200",
          icon: Clock,
          next: "Processing",
          dot: "bg-orange-500",
          pulse: true,
        };
      case "Processing":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Box,
          next: "Packing",
          dot: "bg-blue-500",
          pulse: true,
        };
      case "Packing":
        return {
          color: "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: Package,
          next: "Shipped",
          dot: "bg-yellow-500",
          pulse: true,
        };
      case "Shipped":
        return {
          color: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Truck,
          next: "Out for Delivery",
          dot: "bg-purple-500",
          pulse: true,
        };
      case "Out for Delivery":
        return {
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Truck,
          next: "Delivered",
          dot: "bg-indigo-500",
          pulse: true,
        };
      case "Delivered":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          next: null,
          dot: "bg-emerald-500",
          pulse: false,
        };
      case "Cancelled":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          next: null,
          dot: "bg-red-500",
          pulse: false,
        };
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Clock,
          next: null,
          dot: "bg-slate-500",
          pulse: false,
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? "Order History" : "My Orders"}
          </h1>
          <p className="text-slate-500">
            {isAdmin
              ? "Track and manage your customer orders"
              : "View and track your previous orders"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold shadow-lg shadow-emerald-200/50 w-fit"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Filters
            </span>
          </div>

          <div className="flex-1 min-w-[200px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-900 focus:ring-0 py-2"
            />
            <span className="text-slate-300">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-sm text-slate-900 focus:ring-0 py-2"
            />
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div
        className={
          isAdmin
            ? "bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden"
            : "space-y-6"
        }
      >
        {isAdmin ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const product = products.find(
                      (p) => p.id === order.productId,
                    );
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                          {order.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product ? (
                              <>
                                <img
                                  src={product.image}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                                  referrerPolicy="no-referrer"
                                  alt={product.name}
                                />
                                <span className="text-sm font-medium text-slate-900">
                                  {product.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400 italic">
                                Product Removed
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                                order.paymentStatus === "Paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                            {order.paymentMethod && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                via {order.paymentMethod}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border w-fit ${getStatusConfig(order.status).color}`}
                            >
                              <div className="relative flex h-2 w-2">
                                {getStatusConfig(order.status).pulse && (
                                  <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusConfig(order.status).dot}`}
                                  ></span>
                                )}
                                <span
                                  className={`relative inline-flex rounded-full h-2 w-2 ${getStatusConfig(order.status).dot}`}
                                ></span>
                              </div>
                              {(() => {
                                const Icon = getStatusConfig(order.status).icon;
                                return <Icon className="w-3 h-3" />;
                              })()}
                              {order.status}
                            </span>
                            {getStatusConfig(order.status).next && (
                              <button
                                onClick={() =>
                                  updateOrderStatus(
                                    order.id,
                                    getStatusConfig(order.status)
                                      .next as Order["status"],
                                  )
                                }
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 uppercase tracking-wider"
                              >
                                Move to {getStatusConfig(order.status).next}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() => handleViewProduct(order.productId)}
                              className="flex items-center gap-1 text-primary text-sm font-bold hover:underline"
                            >
                              <Eye className="w-4 h-4" />
                              View Product
                            </button>
                            {order.status !== "Delivered" &&
                              order.status !== "Cancelled" && (
                                <button
                                  onClick={() =>
                                    updateOrderStatus(order.id, "Cancelled")
                                  }
                                  className="text-xs text-red-500 font-medium hover:underline"
                                >
                                  Cancel Order
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ShoppingBag className="w-12 h-12 opacity-20" />
                        <p className="font-medium">
                          No orders found matching your filters
                        </p>
                        <button
                          onClick={resetFilters}
                          className="text-sm text-primary font-bold hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const product = products.find((p) => p.id === order.productId);
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden card-shadow"
                  >
                    {/* Amazon-style Card Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-6 text-sm">
                      <div className="flex flex-wrap items-center gap-8">
                        <div>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Order Placed
                          </p>
                          <p className="font-bold text-slate-900">
                            {order.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Total
                          </p>
                          <p className="font-bold text-slate-900">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Ship To
                          </p>
                          <div className="group relative">
                            <p className="font-bold text-primary cursor-help underline decoration-dotted underline-offset-4">
                              {order.customer}
                            </p>
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                              <p className="text-xs font-bold text-slate-900 mb-1">
                                {order.customer}
                              </p>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                {order.shippingAddress}
                                <br />
                                {order.city}, {order.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                          Order # {order.id}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderDetailsOpen(true);
                          }}
                          className="text-primary font-bold hover:underline"
                        >
                          View order details
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 flex gap-6">
                          <div className="w-24 h-24 flex-shrink-0">
                            {product ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-xl border border-slate-100"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                                <Package className="w-8 h-8 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.color}`}
                              >
                                <div className="relative flex h-2 w-2">
                                  {statusConfig.pulse && (
                                    <span
                                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.dot}`}
                                    ></span>
                                  )}
                                  <span
                                    className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`}
                                  ></span>
                                </div>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {order.status}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                via {order.paymentMethod} •{" "}
                                {order.paymentStatus}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                              {product?.name || "Product Removed"}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">
                              Thank you for shopping with AgriMart. Your order
                              is currently {order.status.toLowerCase()}.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-48">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsTrackingOpen(true);
                            }}
                            className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Track package
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderDetailsOpen(true);
                            }}
                            className="w-full bg-white text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Order info
                          </button>
                          {order.status === "Pending" && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, "Cancelled")
                              }
                              className="w-full text-red-500 text-xs font-bold hover:underline py-1"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 card-shadow text-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <h3 className="text-xl font-bold text-slate-900">
                    No orders found
                  </h3>
                  <p className="max-w-xs mx-auto">
                    We couldn't find any orders matching your current filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="text-primary font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-slate-900">
                {userOrders.filter((o) => o.status === "Pending").length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-xl font-bold text-slate-900">
                {
                  userOrders.filter((o) =>
                    ["Processing", "Packing"].includes(o.status),
                  ).length
                }
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">In Transit</p>
              <p className="text-xl font-bold text-slate-900">
                {
                  userOrders.filter((o) =>
                    ["Shipped", "Out for Delivery"].includes(o.status),
                  ).length
                }
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Delivered</p>
              <p className="text-xl font-bold text-slate-900">
                {userOrders.filter((o) => o.status === "Delivered").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
