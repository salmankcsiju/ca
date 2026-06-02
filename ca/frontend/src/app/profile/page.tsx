"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ShoppingBag, Heart, LogOut, ArrowRight, Sparkles, Scissors, Calendar, Edit2, X, Check, Trash2, Clipboard } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Edit form states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Authentication check and load data
  useEffect(() => {
    const token = localStorage.getItem("casa_amora_token");
    const storedUser = localStorage.getItem("casa_amora_user");
    
    if (!token) {
      router.push("/auth?redirect=/profile");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    const loadProfileData = async () => {
      try {
        const profile = await fetchApi("/auth/me/");
        setUser(profile);
        localStorage.setItem("casa_amora_user", JSON.stringify(profile));
      } catch (err) {
        console.error("Failed to load user profile: ", err);
      } finally {
        setLoading(false);
      }
    };

    const loadOrders = async () => {
      try {
        const orderData = await fetchApi("/orders/");
        setOrders(orderData);
      } catch (err) {
        console.error("Failed to load orders: ", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadProfileData();
    loadOrders();

    // Load saved custom designs
    const saved = localStorage.getItem("casa_amora_saved_designs");
    if (saved) {
      try {
        setSavedDesigns(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  const handleStartEdit = () => {
    setEditName(user?.name || user?.username || "");
    setEditPhone(user?.phone_number || "");
    setEditWhatsapp(user?.whatsapp_number || "");
    setEditError("");
    setEditSuccess(false);
    setIsEditing(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setEditError("");
    setEditSuccess(false);

    try {
      const updatedProfile = await fetchApi("/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({
          name: editName.trim(), // Maps to first_name source field in backend serializer
          phone_number: editPhone.trim(),
          whatsapp_number: editWhatsapp.trim(),
        }),
      });

      setUser(updatedProfile);
      localStorage.setItem("casa_amora_user", JSON.stringify(updatedProfile));
      
      // Notify other layouts
      window.dispatchEvent(new Event("storage"));
      
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess(false);
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("casa_amora_token");
    localStorage.removeItem("casa_amora_user");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  const handleDeleteDesign = (id: number) => {
    const updated = savedDesigns.filter(d => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem("casa_amora_saved_designs", JSON.stringify(updated));
  };

  if (loading && !user) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32">
        <p className="text-slate-400/60 tracking-[2.5px] text-xs uppercase animate-pulse font-serif">
          Authenticating details...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-28 pb-24 px-6 md:px-12 text-[#3B2F2F]">
      
      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#D6B370]/20 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D8A7B1]/10 text-[#D8A7B1] text-[10px] font-semibold uppercase tracking-wider rounded-full">
            <Sparkles size={10} /> Atelier Member
          </div>
          <h1 className="font-serif text-3xl md:text-5xl text-[#3B2F2F]">
            Hello, {user?.name || "Guest"}
          </h1>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            Manage your bespoke custom sizing reservations, design closet, and order status.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="btn-secondary py-3 text-xs flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Profile Info Card (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-4 sm:p-8 rounded-3xl border border-[#D6B370]/20 shadow-lg relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/20 flex items-center justify-center text-[#D8A7B1] text-lg font-bold font-serif shadow-2xs">
                        {(user?.name || "C").substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#3B2F2F]">{user?.name || "Customer"}</h3>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Registered Member</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleStartEdit}
                      className="p-2 border border-[#D6B370]/20 text-[#3B2F2F]/70 hover:text-[#D8A7B1] rounded-full hover:bg-white/50 transition-all"
                      aria-label="Edit Profile Details"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#D6B370]/15 text-xs font-light">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Phone Number</span>
                      <span className="font-medium text-[#3B2F2F]">{user?.phone_number || "Not set"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">WhatsApp updates</span>
                      <span className="font-medium text-[#3B2F2F]">{user?.whatsapp_number || "Not set"}</span>
                    </div>
                    
                    {user?.is_staff && (
                      <div className="pt-2">
                        <Link href="/dashboard" className="btn-primary w-full py-2.5 text-xs text-center justify-center font-semibold">
                          Enter Staff ERP
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="profile-edit"
                  onSubmit={handleSaveChanges}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#D6B370]/15 pb-3">
                    <h3 className="font-serif text-sm font-semibold text-[#3B2F2F]">Edit Profile Specs</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-slate-400 hover:text-[#3B2F2F] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {editError && (
                    <div className="bg-red-50 text-red-600 border border-red-200 text-[10px] p-2 rounded-lg text-center">
                      {editError}
                    </div>
                  )}

                  {editSuccess && (
                    <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] p-2 rounded-lg text-center flex items-center justify-center gap-1.5 font-semibold">
                      <Check size={12} /> Profile Updated!
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] rounded-lg outline-none focus:border-[#D8A7B1] transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] rounded-lg outline-none focus:border-[#D8A7B1] transition-all"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-slate-400">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] rounded-lg outline-none focus:border-[#D8A7B1] transition-all"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary flex-1 py-2 text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="btn-primary flex-1 py-2 text-[10px]"
                    >
                      {updating ? "Saving..." : "Save Specs"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>

          {/* Quick Customizer Promo */}
          <div className="bg-[#F3E9DC]/60 border border-[#D6B370]/20 p-4 sm:p-8 rounded-3xl space-y-4 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-white border border-[#D6B370]/25 flex items-center justify-center text-[#D8A7B1]">
              <Scissors size={18} />
            </div>
            <h3 className="font-serif text-lg text-[#3B2F2F] font-semibold">Design Studio</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Have a unique custom dress idea? Jump into our Canva-style dress studio to configure necklines, sleeves, fabrics, and lengths interactively!
            </p>
            <Link href="/customize" className="text-xs font-semibold text-[#D8A7B1] hover:underline flex items-center gap-1">
              Open Custom Studio <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right Side: Orders History & Closet (8 Columns) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Order History */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-[#3B2F2F] border-b border-[#D6B370]/20 pb-3 flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#D6B370]" /> Custom Dress Reservations
            </h2>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/40 border border-[#D6B370]/10 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 border border-[#D6B370]/15 bg-white/40 rounded-2xl shadow-2xs p-8 space-y-4">
                <ShoppingBag size={32} className="mx-auto text-slate-300" />
                <p className="text-xs text-slate-400 font-light">You have no custom orders yet.</p>
                <Link href="/products" className="btn-primary py-2.5 px-6 text-xs inline-block">
                  Explore Collections
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/60 border border-[#D6B370]/20 rounded-2xl p-6 shadow-sm space-y-4 transition-all hover:shadow-md">
                    
                    {/* Order Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#D6B370]/10 pb-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#3B2F2F]">Order #{order.id}</span>
                        <span className="text-slate-400">|</span>
                        <span className="flex items-center gap-1 text-slate-500 font-light">
                          <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-light">Total: <strong className="font-bold text-[#D8A7B1] font-serif text-sm">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</strong></span>
                        <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full shadow-2xs ${
                          order.status === "Pending" ? "bg-amber-100 text-amber-700" :
                          order.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                          order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-2">
                          <div className="space-y-1">
                            <p className="font-medium text-[#3B2F2F]">{item.product_name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-light">
                              <span>Size: {item.size}</span>
                              {item.size === "Custom" && (
                                <span className="text-[#D8A7B1] italic font-semibold">(Tailoring Sizing Request Submitted)</span>
                              )}
                              <span>Qty: {item.quantity}</span>
                            </div>
                            
                            {/* Render custom specifications if present */}
                            {item.custom_measurements && (
                              <div className="text-[10px] text-slate-500 bg-[#FAF7F2] border border-[#D6B370]/15 rounded-lg p-2.5 mt-1 font-light italic flex items-start gap-1.5 max-w-xl">
                                <Clipboard size={12} className="text-[#D6B370] shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-slate-600 not-italic block mb-0.5 text-[9px] uppercase tracking-wider">Specs:</span>
                                  {item.custom_measurements.note || "Bespoke design specifications."}
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="font-serif font-medium text-slate-500">₹{parseFloat(item.product_price).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Designs Closet */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-[#3B2F2F] border-b border-[#D6B370]/20 pb-3 flex items-center gap-2">
              <Heart size={20} className="text-[#D6B370]" /> My Studio Designs
            </h2>

            {savedDesigns.length === 0 ? (
              <div className="text-center py-16 border border-[#D6B370]/15 bg-white/40 rounded-2xl shadow-2xs p-8 space-y-4">
                <Heart size={32} className="mx-auto text-slate-300" />
                <p className="text-xs text-slate-400 font-light">You have no saved custom designs.</p>
                <Link href="/customize" className="btn-primary py-2.5 px-6 text-xs inline-block">
                  Design Your First Dress
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {savedDesigns.map((design) => (
                  <div key={design.id} className="bg-white/60 border border-[#D6B370]/20 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-light">
                        <span>Saved: {design.date}</span>
                        <span className="px-2 py-0.5 bg-[#D8A7B1]/10 text-[#D8A7B1] rounded-full uppercase tracking-wider font-semibold">Custom</span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-[#3B2F2F] capitalize">
                        {design.parentName ? `Custom ${design.parentName}` : `${design.fabric} ${design.length} Dress`}
                      </h4>
                      <ul className="text-[10px] text-slate-500 space-y-1 font-light pl-2 list-disc capitalize">
                        <li>Neck: {design.neck} {design.neckNote && <span className="text-[#D8A7B1] font-normal italic">({design.neckNote})</span>}</li>
                        <li>Sleeve: {design.sleeve} {design.sleeveNote && <span className="text-[#D8A7B1] font-normal italic">({design.sleeveNote})</span>}</li>
                        <li>Shade: {design.color} {design.colorNote && <span className="text-[#D8A7B1] font-normal italic">({design.colorNote})</span>}</li>
                        <li>Fabric: {design.fabric} {design.fabricNote && <span className="text-[#D8A7B1] font-normal italic">({design.fabricNote})</span>}</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-[#D6B370]/10">
                      <button
                        onClick={() => handleDeleteDesign(design.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                      <button 
                        onClick={() => router.push(`/customize?product=${design.parentName ? 1 : ""}`)}
                        className="text-[10px] font-semibold text-[#3B2F2F] hover:text-[#D8A7B1] underline cursor-pointer"
                      >
                        Open Studio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
