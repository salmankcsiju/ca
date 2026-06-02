"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, Phone, CheckSquare, Square, LogIn } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion } from "framer-motion";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // State definitions (must be at the top of the hook)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [useSameForWhatsapp, setUseSameForWhatsapp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync WhatsApp number when toggle is active
  useEffect(() => {
    if (useSameForWhatsapp) {
      setWhatsapp(phone);
    }
  }, [phone, useSameForWhatsapp]);

  // Auth check on mount
  useEffect(() => {
    const token = localStorage.getItem("casa_amora_token");
    if (token) {
      router.push(redirect === "/" ? "/profile" : redirect);
    }
  }, [router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        phone_number: phone.trim(),
        name: activeTab === "register" ? (name.trim() || "Customer") : "",
        whatsapp_number: activeTab === "register" ? (useSameForWhatsapp ? phone.trim() : whatsapp.trim()) : "",
        mode: activeTab,
      };

      const response = await fetchApi("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("casa_amora_token", response.token);
      localStorage.setItem("casa_amora_user", JSON.stringify(response.user));
      
      // Notify components like Navbar of the login status change
      window.dispatchEvent(new Event("storage"));

      // Redirect to target path or profile
      router.push(redirect === "/" ? "/profile" : redirect);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please check details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#D6B370]/25 shadow-lg rounded-2xl p-8 md:p-10">
      
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-[#D8A7B1] transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>

      {/* Tabs */}
      <div className="flex border-b border-[#D6B370]/15 mb-8">
        <button
          onClick={() => {
            setActiveTab("login");
            setError("");
          }}
          className={`flex-1 pb-3 text-xs uppercase tracking-[2px] font-semibold transition-all relative ${
            activeTab === "login" ? "text-[#3B2F2F] font-bold" : "text-slate-400 hover:text-[#3B2F2F]/60"
          }`}
        >
          Sign In
          {activeTab === "login" && (
            <motion.div layoutId="auth-tab-line" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D8A7B1]" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setError("");
          }}
          className={`flex-1 pb-3 text-xs uppercase tracking-[2px] font-semibold transition-all relative ${
            activeTab === "register" ? "text-[#3B2F2F] font-bold" : "text-slate-400 hover:text-[#3B2F2F]/60"
          }`}
        >
          Register
          {activeTab === "register" && (
            <motion.div layoutId="auth-tab-line" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D8A7B1]" />
          )}
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl text-[#3B2F2F] mb-2 font-medium">
          {activeTab === "login" ? "Welcome Back" : "Join the Atelier"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed font-light">
          {activeTab === "login" 
            ? "Sign in with your registered phone number to view reservations and design closet."
            : "Create your Atelier customer account for custom tailoring and saved studio closet."}
        </p>
      </div>

      {/* Error Output */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs py-3 px-4 text-center rounded-xl font-light">
          {error}
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {activeTab === "register" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#3B2F2F]/65">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] text-xs outline-none focus:border-[#D8A7B1] transition-all placeholder:text-slate-400 rounded-xl shadow-2xs"
              />
              <User size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#3B2F2F]/65">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              placeholder="e.g. +91 9876543210"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] text-xs outline-none focus:border-[#D8A7B1] transition-all placeholder:text-slate-400 rounded-xl shadow-2xs"
            />
            <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>
        </div>

        {activeTab === "register" && (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setUseSameForWhatsapp(!useSameForWhatsapp)}
              className="flex items-center gap-2 text-xs text-[#3B2F2F]/80 hover:text-[#3B2F2F]"
            >
              {useSameForWhatsapp ? (
                <CheckSquare size={16} className="text-[#D8A7B1]" />
              ) : (
                <Square size={16} className="text-slate-300" />
              )}
              <span>Receive tailoring updates via WhatsApp</span>
            </button>

            {!useSameForWhatsapp && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label htmlFor="whatsapp" className="text-[9px] font-bold uppercase tracking-[1px] text-[#3B2F2F]/65">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  placeholder="Enter WhatsApp mobile number"
                  required={!useSameForWhatsapp}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D6B370]/25 bg-white/50 text-[#3B2F2F] text-xs outline-none focus:border-[#D8A7B1] transition-all placeholder:text-slate-400 rounded-xl shadow-2xs"
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[2px]"
        >
          {loading ? "Please wait..." : activeTab === "login" ? "Sign In" : "Register"} <LogIn size={14} />
        </button>
      </form>

      <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed font-light">
        Protected connection. Your numbers are strictly used to coordinate custom tailoring bookings, sizing verifications, and delivery slot reservations.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-24 pb-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-[#D6B370]/25 rounded-2xl p-10 text-center shadow-md">
          <p className="text-slate-400 animate-pulse font-serif">Loading auth panel...</p>
        </div>
      }>
        <AuthContent />
      </Suspense>
    </div>
  );
}
