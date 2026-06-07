"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { 
  ArrowLeft, Bell, BellOff, Volume2, VolumeX, ShoppingBag, 
  User, Phone, Clock, Check, RefreshCw, X, Play, PackageCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveOrdersPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrdersCountRef = useRef<number>(0);
  const audioContextInitialized = useRef<boolean>(false);

  // Filter: 'active' (Pending + Processing), 'pending', 'processing', 'completed' (Shipped + Delivered), 'cancelled'
  const [filter, setFilter] = useState<"active" | "pending" | "processing" | "completed">("active");

  // Verify staff login
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("casa_amora_token");
      if (!token) {
        router.push("/dashboard/login");
        return;
      }
      try {
        const profile = await fetchApi("/auth/me/");
        if (profile.is_staff) {
          setStaffInfo(profile);
          setIsReady(true);
          loadOrders();
        } else {
          localStorage.removeItem("casa_amora_token");
          router.push("/dashboard/login");
        }
      } catch (err) {
        localStorage.removeItem("casa_amora_token");
        router.push("/dashboard/login");
      }
    };
    verifyUser();
  }, [router]);

  // Audio chime synthesizer
  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      
      // Note 1 (sweet gold chime - D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.8);
      
      // Note 2 (harmony - A5) after 120ms
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 1.0);
      }, 120);
    } catch (e) {
      console.warn("Audio Context playback blocked or unsupported", e);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await fetchApi("/orders/");
      setOrders(data);
      
      // Check for new orders
      const pendingCount = data.filter((o: any) => o.status === "Pending").length;
      if (previousOrdersCountRef.current > 0 && pendingCount > previousOrdersCountRef.current) {
        playNotificationChime();
      }
      previousOrdersCountRef.current = pendingCount;
    } catch (err) {
      console.error("Failed to load live orders", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time polling
  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, [isReady, soundEnabled]);

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetchApi(`/orders/${orderId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      // reload lists
      loadOrders();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    if (filter === "pending") return o.status === "Pending";
    if (filter === "processing") return o.status === "Processing";
    if (filter === "completed") return o.status === "Shipped" || o.status === "Delivered";
    // default 'active'
    return o.status === "Pending" || o.status === "Processing";
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200 animate-pulse";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-[#6B5A5B] tracking-[2px] text-xs uppercase animate-pulse">Loading live monitor workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#3A2A2B] font-sans flex flex-col overflow-hidden h-screen">
      
      {/* MONITOR HEADER */}
      <header className="bg-[#F3EDE2] border-b border-[#E5DAC6] px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 w-full md:w-auto">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-[#E5DAC6]/45 transition-colors cursor-pointer text-[#6B5A5B] flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold"
          >
            <ArrowLeft size={16} /> Dashboard ERP
          </button>
          
          <div className="h-5 w-[1px] bg-[#E5DAC6] hidden md:block"></div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="font-serif text-base md:text-lg tracking-wide text-[#2C1A1B] font-bold text-center sm:text-left">Atelier Live Order Board</h1>
          </div>
        </div>

        {/* Audio Alerts Toggle */}
        <div className="flex items-center gap-3 justify-center w-full md:w-auto">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              // user click interaction enables audio context
              audioContextInitialized.current = true;
            }}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 text-xs uppercase tracking-wider font-bold ${
              soundEnabled 
                ? "bg-[#722F37] text-white border-[#722F37] hover:bg-[#592228]" 
                : "bg-white text-[#6B5A5B] border-[#E5DAC6] hover:bg-slate-50"
            }`}
            title={soundEnabled ? "Disable Chime Alerts" : "Enable Chime Alerts"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound Alerts On" : "Muted"}</span>
          </button>

          <button 
            onClick={loadOrders}
            className="p-2.5 bg-white border border-[#E5DAC6] hover:bg-slate-50 rounded-full transition-colors cursor-pointer text-[#6B5A5B]"
            aria-label="Reload lists"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* FILTER CONTROL BAR */}
      <section className="bg-white border-b border-[#E5DAC6] px-6 py-3 flex flex-wrap gap-2 items-center justify-between shrink-0">
        <div className="flex gap-1">
          {[
            { id: "active", label: "Active Orders" },
            { id: "pending", label: "Pending (New)" },
            { id: "processing", label: "Processing" },
            { id: "completed", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-[1px] transition-all cursor-pointer ${
                filter === tab.id 
                  ? "bg-[#722F37] text-white rounded-xs" 
                  : "text-[#6B5A5B] hover:text-[#2C1A1B] hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6B5A5B]/85 font-medium mt-2 sm:mt-0">
          Showing <span className="text-[#722F37] font-bold">{filteredOrders.length}</span> of {orders.length} Total orders
        </div>
      </section>

      {/* ORDERS GRID DISPLAY */}
      <main className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-[#6B5A5B] tracking-wider animate-pulse uppercase">Fetching active boutique reservations...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag size={48} className="text-[#A8854A] opacity-35 mb-3" />
            <h3 className="font-serif text-lg text-[#2C1A1B]">No orders in this state</h3>
            <p className="text-xs text-[#6B5A5B]/85 font-light max-w-xs mt-1">
              Newly submitted client reservations will pop up here with audio chimes automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-[#E5DAC6] rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  
                  {/* Top: Order Info & Status */}
                  <div>
                    <div className="flex justify-between items-start mb-3 border-b border-[#FAF6EE] pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#A8854A] tracking-[1px]">Order Reference</span>
                        <h3 className="font-serif text-lg text-[#2C1A1B] font-semibold">#{order.id}</h3>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] uppercase tracking-[1px] font-bold rounded-full border ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div className="space-y-1.5 mb-4 text-xs font-light text-[#6B5A5B]">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-[#A8854A]" />
                        <span className="font-semibold text-[#2C1A1B]">{order.user_name || "Guest Customer"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-[#A8854A]" />
                        <span>{order.user_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#A8854A]" />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Order Items & Customizations */}
                    <div className="space-y-3 mb-4">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-[1px] border-b border-slate-100 pb-1">Bespoke Specs</span>
                      {order.items.map((item: any, idx: number) => {
                        const hasCustoms = item.custom_measurements && Object.keys(item.custom_measurements).length > 0;
                        return (
                          <div key={idx} className="bg-[#FCFAF7] p-3 rounded-lg border border-[#FAF6EE] space-y-2">
                            <div className="flex justify-between text-xs text-[#2C1A1B] font-semibold">
                              <span className="truncate max-w-[180px]">{item.product_name}</span>
                              <span className="shrink-0">Qty: {item.quantity}</span>
                            </div>
                            
                            <div className="flex gap-4 text-[10px] text-[#6B5A5B]">
                              <span>Size: <strong className="text-[#722F37] uppercase">{item.size}</strong></span>
                              <span>Base Price: ₹{parseFloat(item.product_price).toLocaleString("en-IN")}</span>
                            </div>

                            {/* Customized measurements and notes */}
                            {hasCustoms && (
                              <div className="text-[10px] pt-1.5 border-t border-[#E5DAC6]/40 space-y-1 text-[#6B5A5B]/90 font-light">
                                {item.custom_measurements.color && (
                                  <div className="flex items-center gap-1.5">
                                    <span>Color Shade:</span>
                                    {item.custom_measurements.color.code?.startsWith("#") ? (
                                      <span 
                                        className="h-3 w-3 rounded-full border border-slate-300 inline-block shrink-0" 
                                        style={{ backgroundColor: item.custom_measurements.color.code }}
                                        title={item.custom_measurements.color.name}
                                      />
                                    ) : null}
                                    <span className="font-medium text-[#2C1A1B]">{item.custom_measurements.color.name}</span>
                                  </div>
                                )}
                                {item.custom_measurements.sleeve && (
                                  <div>Sleeve: <strong className="text-[#2C1A1B]">{item.custom_measurements.sleeve.name}</strong></div>
                                )}
                                {item.custom_measurements.neck && (
                                  <div>Neckline: <strong className="text-[#2C1A1B]">{item.custom_measurements.neck.name}</strong></div>
                                )}
                                {item.custom_measurements.length && (
                                  <div>Hemline: <strong className="text-[#2C1A1B]">{item.custom_measurements.length.name}</strong></div>
                                )}
                                {item.custom_measurements.fabric && (
                                  <div>Fabric: <strong className="text-[#2C1A1B]">{item.custom_measurements.fabric.name}</strong></div>
                                )}
                                {item.custom_measurements.notes && (
                                  <div className="mt-1 bg-amber-50/50 p-2 border border-amber-100 rounded-sm text-[#722F37] italic">
                                    Note: "{item.custom_measurements.notes}"
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom: Action CTAs */}
                  <div className="border-t border-[#FAF6EE] pt-3 flex gap-2">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Processing")}
                        className="flex-1 py-2 px-3 bg-[#722F37] text-white hover:bg-[#592228] transition-colors rounded-lg text-xs font-semibold uppercase tracking-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Play size={13} /> Accept Order
                      </button>
                    )}
                    
                    {order.status === "Processing" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "Shipped")}
                        className="flex-1 py-2 px-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg text-xs font-semibold uppercase tracking-[1px] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck size={13} /> Mark Shipped
                      </button>
                    )}

                    {order.status !== "Shipped" && order.status !== "Delivered" && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this order reference?")) {
                            updateOrderStatus(order.id, "Cancelled");
                          }
                        }}
                        className="py-2 px-3 border border-red-200 hover:bg-red-50 text-red-600 transition-colors rounded-lg text-xs font-semibold uppercase cursor-pointer"
                        title="Cancel Order"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

    </div>
  );
}
