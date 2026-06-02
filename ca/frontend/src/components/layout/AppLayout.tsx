"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className={`flex flex-col min-h-screen ${isDashboard ? "bg-white text-gray-900" : "bg-[#FAF7F2] text-[#3B2F2F]"}`}>
      {!isDashboard && (
        <Suspense fallback={<div className="h-16 bg-[#FAF7F2] border-b border-[#D6B370]/10" />}>
          <Navbar />
        </Suspense>
      )}
      
      <main className={`flex-grow ${isDashboard ? "bg-[#f8fafc] text-gray-900" : ""}`}>
        {children}
      </main>

      {!isDashboard && <Footer />}

      {/* Floating WhatsApp Support Button */}
      <AnimatePresence>
        {!isDashboard && (
          <motion.a
            href="https://wa.me/917356198300"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg flex items-center justify-center cursor-pointer group"
            aria-label="Contact support on WhatsApp"
          >
            <MessageCircle size={24} fill="currentColor" className="text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 ease-out whitespace-nowrap text-sm font-semibold">
              Chat with Salman
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
