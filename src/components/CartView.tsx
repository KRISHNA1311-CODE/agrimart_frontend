import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Phone,
  User as UserIcon,
  CreditCard,
} from "lucide-react";
import { CartItem } from "../types";
import { formatCurrency } from "../constants";

import { useCartStore } from "../store/useCartStore";

interface CartViewProps {
  onCheckout: (shippingDetails: any) => void;
}

export default function CartView({ onCheckout }: CartViewProps) {
  const {
    cart: items,
    updateQuantity,
    removeFromCart: onRemove,
  } = useCartStore();
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "razorpay" as "razorpay" | "cod",
  });

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = items.length > 0 ? 50 : 0;
  const codCharge = shipping.paymentMethod === "cod" ? 50 : 0;
  const total = subtotal + shippingCost + codCharge;

  const handleNextStep = () => {
    if (step === "cart") {
      setStep("shipping");
    } else {
      onCheckout(shipping);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <ShoppingCart className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-slate-500 max-w-xs">
          Looks like you haven't added any products to your cart yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === "cart" ? "Shopping Cart" : "Shipping Details"}
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${step === "cart" ? "bg-primary" : "bg-slate-200"}`}
            />
            <div
              className={`w-2 h-2 rounded-full ${step === "shipping" ? "bg-primary" : "bg-slate-200"}`}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "cart" ? (
            <motion.div
              key="cart-items"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  className="bg-white p-4 rounded-2xl border border-slate-100 card-shadow flex gap-4 items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <p className="text-slate-500 text-sm">
                      {formatCurrency(item.price)} / {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-white rounded-md transition-colors text-slate-600"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 ml-auto mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="shipping-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={shipping.name}
                    onChange={(e) =>
                      setShipping({ ...shipping, name: e.target.value })
                    }
                    placeholder="Enter your full name"
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
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                    placeholder="+91 XXXXX XXXXX"
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
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  placeholder="House No, Street, Landmark..."
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    placeholder="New Delhi"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={shipping.pincode}
                    onChange={(e) =>
                      setShipping({ ...shipping, pincode: e.target.value })
                    }
                    placeholder="110001"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <label className="text-sm font-bold text-slate-700 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setShipping({ ...shipping, paymentMethod: "razorpay" })
                    }
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      shipping.paymentMethod === "razorpay"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-sm">Online Payment</p>
                      <p className="text-xs opacity-70">Razorpay</p>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setShipping({ ...shipping, paymentMethod: "cod" })
                    }
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      shipping.paymentMethod === "cod"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
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
                onClick={() => setStep("cart")}
                className="text-slate-400 text-sm font-medium hover:text-primary transition-colors"
              >
                ← Back to Cart
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow sticky top-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(shippingCost)}
              </span>
            </div>
            {shipping.paymentMethod === "cod" && (
              <div className="flex justify-between text-slate-500">
                <span>COD Charge</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(codCharge)}
                </span>
              </div>
            )}
            <div className="border-t border-slate-100 pt-4 flex justify-between">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            disabled={
              step === "shipping" &&
              (!shipping.name || !shipping.phone || !shipping.address)
            }
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === "cart" ? (
              <>
                Proceed to Shipping
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                {shipping.paymentMethod === "razorpay"
                  ? "Pay Now"
                  : "Place Order (COD)"}{" "}
                - {formatCurrency(total)}
                {shipping.paymentMethod === "razorpay" ? (
                  <CreditCard className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
            {shipping.paymentMethod === "razorpay" ? (
              <CreditCard className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            {shipping.paymentMethod === "razorpay"
              ? "Secure Online Payment"
              : "Cash on Delivery Available"}
          </div>
        </div>
      </div>
    </div>
  );
}
