"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const items = JSON.parse(localStorage.getItem("casa_amora_cart") || "[]");
      setCart(items);
    }
  }, []);

  const updateQuantity = (id: number, size: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id && item.size === size) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem("casa_amora_cart", JSON.stringify(updated));
  };

  const removeItem = (id: number, size: string) => {
    const updated = cart.filter(item => !(item.id === id && item.size === size));
    setCart(updated);
    localStorage.setItem("casa_amora_cart", JSON.stringify(updated));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 150; // Free shipping over 5000
  const total = subtotal + (cart.length > 0 ? shipping : 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("casa_amora_token");
    if (!token) {
      alert("Please login or verify your phone to proceed with checkout.");
      router.push("/auth");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cart.map(item => ({
          product: item.id,
          size: item.size,
          quantity: item.quantity,
          custom_measurements: item.size === "Custom" ? { note: "Tailor custom measurement request" } : null
        }))
      };

      await fetchApi("/orders/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // Clear local storage and state
      localStorage.removeItem("casa_amora_cart");
      setCart([]);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center pt-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-dark-950 p-8 border border-dark-800 text-center space-y-6 luxury-glow"
        >
          <span className="text-4xl">👑</span>
          <h2 className="font-serif text-3xl text-white">Order Reserved</h2>
          <p className="text-sm text-white/60 leading-relaxed font-light">
            Your custom couture order has been successfully logged at our atelier. We will contact you shortly to coordinate sizing and delivery.
          </p>
          <button 
            onClick={() => router.push("/products")} 
            className="btn-primary w-full py-3.5"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 min-h-screen pt-32 pb-24 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto space-y-4 mb-16 text-center">
        <span className="text-xs uppercase tracking-[4px] text-gold-500 font-semibold">Your Selection</span>
        <h1 className="font-serif text-4xl md:text-5xl tracking-wide">The Couture Bag</h1>
        <div className="w-12 h-[1px] bg-gold-500/20 mx-auto mt-4" />
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-sm text-center">
          {error}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-16 border border-dark-800/80 luxury-glow bg-dark-950">
          <ShoppingBag size={48} className="mx-auto text-white/20" />
          <p className="text-sm text-white/50 font-light">Your couture selection is currently empty.</p>
          <button 
            onClick={() => router.push("/products")}
            className="btn-primary py-3.5"
          >
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items list (Left) */}
          <div className="w-full lg:w-[65%] space-y-6">
            <div className="hidden md:grid grid-cols-3 pb-4 border-b border-dark-800 text-[0.65rem] uppercase tracking-[2px] text-white/40">
              <span>Item Details</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Price</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div 
                    key={`${item.id}-${item.size}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="grid grid-cols-1 md:grid-cols-3 items-center py-6 border-b border-dark-800/60 bg-dark-950/20 px-4 md:px-0"
                  >
                    {/* Details */}
                    <div className="flex space-x-4">
                      <div className="relative h-24 w-20 aspect-[3/4] bg-dark-950 border border-white/5 shrink-0 overflow-hidden">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1 justify-center flex flex-col">
                        <h3 className="font-serif text-base text-white hover:text-gold-500 transition-colors">
                          <Link href={`/product/${item.id}`}>{item.name}</Link>
                        </h3>
                        <p className="text-xs text-white/50 font-light">Size: {item.size}</p>
                        <p className="text-xs text-gold-500/80 font-medium md:hidden">₹{item.price.toLocaleString("en-IN")}</p>
                        <button 
                          onClick={() => removeItem(item.id, item.size)}
                          className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[1px] text-white/30 hover:text-red-400 transition-colors pt-2 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex justify-start md:justify-center mt-4 md:mt-0">
                      <div className="inline-flex items-center border border-white/10 bg-dark-950">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, -1)}
                          className="p-2 text-white/40 hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 text-xs font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, 1)}
                          className="p-2 text-white/40 hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="text-left md:text-right mt-4 md:mt-0 text-sm font-semibold text-gold-500">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Summary (Right) */}
          <div className="w-full lg:w-[35%] shrink-0">
            <div className="bg-dark-950 p-6 md:p-8 border border-dark-800/80 luxury-glow space-y-6">
              <h2 className="font-serif text-xl tracking-wide border-b border-dark-800 pb-4">Atelier Summary</h2>
              
              <div className="space-y-4 text-sm font-light text-white/70">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <div className="w-full h-[1px] bg-dark-800 my-2" />

                <div className="flex justify-between text-base font-semibold text-white">
                  <span>Total Amount</span>
                  <span className="text-gold-500">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[2px]"
              >
                {loading ? "Registering Reservation..." : "Proceed to Checkout"} <ArrowRight size={14} />
              </button>

              <div className="text-[0.65rem] text-center text-white/30 tracking-[1.5px] uppercase pt-2">
                🔒 Secure Atelier Connection
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
