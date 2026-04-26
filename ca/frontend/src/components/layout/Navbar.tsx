"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-dark-900/80 backdrop-blur-md py-4 border-b border-dark-700/50 shadow-lg"
            : isHome
            ? "bg-transparent py-6"
            : "bg-dark-900/90 py-6 border-b border-dark-700/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-gold-500 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="text-xl md:text-2xl font-serif tracking-[4px] text-white">
            <Link href="/" className="hover:text-gold-400 transition-colors">
              CASA AMORA
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-[0.8rem] uppercase tracking-[2px] font-medium text-white/90">
            <Link href="/" className={`relative py-2 hover:text-gold-500 transition-colors ${pathname === "/" ? "text-gold-500" : ""}`}>
              Home
              {pathname === "/" && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold-500" />
              )}
            </Link>
            <Link href="/products" className={`relative py-2 hover:text-gold-500 transition-colors ${pathname === "/products" ? "text-gold-500" : ""}`}>
              All Products
              {pathname === "/products" && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-gold-500" />
              )}
            </Link>
            <Link href="/products?category=1" className={`relative py-2 hover:text-gold-500 transition-colors ${pathname.includes("women") ? "text-gold-500" : ""}`}>
              Women
            </Link>
            <Link href="/products?category=2" className={`relative py-2 hover:text-gold-500 transition-colors ${pathname.includes("kids") ? "text-gold-500" : ""}`}>
              Kids
            </Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-5 text-white">
            <Link href="/auth" className="hover:text-gold-500 transition-colors" aria-label="Account">
              <User size={20} />
            </Link>
            <Link href="/favorites" className="hover:text-gold-500 transition-colors" aria-label="Wishlist">
              <Heart size={20} />
            </Link>
            <Link href="/cart" className="relative hover:text-gold-500 transition-colors" aria-label="Shopping Cart">
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-dark-900/98 backdrop-blur-lg flex flex-col justify-center items-center space-y-8"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl uppercase tracking-[3px] font-serif text-white hover:text-gold-500"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl uppercase tracking-[3px] font-serif text-white hover:text-gold-500"
            >
              All Products
            </Link>
            <Link
              href="/products?category=1"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl uppercase tracking-[3px] font-serif text-white hover:text-gold-500"
            >
              Women
            </Link>
            <Link
              href="/products?category=2"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl uppercase tracking-[3px] font-serif text-white hover:text-gold-500"
            >
              Kids
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="px-8 py-3 border border-gold-500/30 text-gold-500 uppercase tracking-[2px] text-sm"
            >
              Login / Signup
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white hover:text-gold-500"
            >
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
