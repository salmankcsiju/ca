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
      router.push("/auth?redirect=/cart");
      return;
    }

    setLoading(true);
    setError("");

    try {
      try {
        await fetchApi("/auth/me/");
      } catch {
        localStorage.removeItem("casa_amora_token");
        router.push("/auth?redirect=/cart");
        return;
      }

      const payload = {
        items: cart.map(item => ({
          product: typeof item.id === "string" && item.id.startsWith("custom-") 
            ? (item.parent_id || 1) 
            : item.id,
          size: item.size,
          quantity: item.quantity,
          custom_measurements: item.size === "Custom" 
            ? { ...item.custom_details, note: item.custom_details?.summary || item.name } 
            : null
        }))
      };

      await fetchApi("/orders/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.removeItem("casa_amora_cart");
      setCart([]);
      setSuccess(true);
    } catch (err: any) {
      const msg = err.message || "Failed to place order.";
      if (msg.includes("Authentication") || msg.includes("credentials") || msg.includes("token")) {
        localStorage.removeItem("casa_amora_token");
        router.push("/auth?redirect=/cart");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#FAF7F2] p-8 border border-[#D6B370]/25 shadow-lg rounded-2xl text-center space-y-6"
        >
          <span className="text-4xl">👑</span>
          <h2 className="font-serif text-3xl text-[#3B2F2F]">Order Reserved</h2>
          <p className="text-sm text-slate-500 leading-relaxed font-light">
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
    <div className="bg-[#FAF7F2] min-h-screen pt-32 pb-24 px-6 md:px-12 text-[#3B2F2F]">
      <div className="max-w-7xl mx-auto space-y-4 mb-16 text-center">
        <span className="text-xs uppercase tracking-[4px] text-[#D8A7B1] font-semibold">Your Selection</span>
        <h1 className="font-serif text-4xl md:text-5xl tracking-wide text-[#3B2F2F]">The Couture Bag</h1>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D6B370] to-transparent mx-auto mt-4" />
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 space-y-3">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-sm text-center rounded-lg">
            {error}
          </div>
          <div className="text-center flex justify-center gap-3">
            <button
              onClick={() => setError("")}
              className="btn-secondary py-2.5 text-xs"
            >
              Dismiss
            </button>
            <button
              onClick={() => router.push("/auth?redirect=/cart")}
              className="btn-primary py-2.5 text-xs"
            >
              Login &amp; Retry
            </button>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-16 border border-[#D6B370]/20 bg-white shadow-md rounded-2xl">
          <ShoppingBag size={48} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-500 font-light">Your couture selection is currently empty.</p>
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
            <div className="hidden md:grid grid-cols-3 pb-4 border-b border-[#D6B370]/20 text-[0.65rem] uppercase tracking-[2px] text-slate-400">
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
                    className="grid grid-cols-1 md:grid-cols-3 items-center py-6 border-b border-[#D6B370]/15 bg-white/40 px-4 md:px-0 rounded-xl shadow-2xs"
                  >
                    {/* Details */}
                    <div className="flex space-x-4 px-2">
                      <div className="relative h-24 w-20 aspect-[3/4] bg-[#FAF7F2] border border-[#D6B370]/15 shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1 justify-center flex flex-col">
                        <h3 className="font-serif text-base text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">
                          <Link href={`/product/${item.id}`}>{item.name}</Link>
                        </h3>
                        <p className="text-xs text-slate-500 font-light">Size: {item.size}</p>
                        <p className="text-xs text-[#D8A7B1] font-medium md:hidden">₹{item.price.toLocaleString("en-IN")}</p>
                        <button 
                          onClick={() => removeItem(item.id, item.size)}
                          className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[1px] text-slate-400 hover:text-red-500 transition-colors pt-2 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex justify-start md:justify-center mt-4 md:mt-0">
                      <div className="inline-flex items-center border border-[#D6B370]/20 bg-white/45 rounded-full overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, -1)}
                          className="p-2 text-slate-400 hover:text-[#D8A7B1] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 text-xs font-semibold text-[#3B2F2F]">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, 1)}
                          className="p-2 text-slate-400 hover:text-[#D8A7B1] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="text-left md:text-right mt-4 md:mt-0 text-sm font-semibold text-[#D8A7B1] pr-4">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary (Right) */}
          <div className="w-full lg:w-[35%] shrink-0">
            <div className="bg-[#F3E9DC] border border-[#D6B370]/20 shadow-md rounded-2xl p-6 md:p-8 space-y-6">
              <h2 className="font-serif text-xl tracking-wide text-[#3B2F2F] border-b border-[#D6B370]/20 pb-4">Atelier Summary</h2>
              
              <div className="space-y-4 text-sm font-light text-slate-500">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-[#3B2F2F] font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-[#3B2F2F] font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <div className="w-full h-[1px] bg-[#D6B370]/20 my-2" />

                <div className="flex justify-between text-base font-semibold text-[#3B2F2F]">
                  <span>Total Amount</span>
                  <span className="text-[#D8A7B1] font-bold">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[2px]"
              >
                {loading ? "Registering Reservation..." : "Proceed to Checkout"} <ArrowRight size={14} />
              </button>

              <div className="text-[0.65rem] text-center text-slate-400 tracking-[1.5px] uppercase pt-2">
                🔒 Secure Atelier Connection
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
