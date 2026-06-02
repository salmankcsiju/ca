"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, User, Menu, X, LogIn, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === "/";

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("casa_amora_token");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On home page at top: transparent nav, white text
  // On home page scrolled OR any other page: light cream nav, dark text
  const isLight = isScrolled || !isHome;

  const isOpaque = isScrolled || !isHome;

  const navBg = isScrolled
    ? "bg-[#FAF7F2]/85 backdrop-blur-md border-b border-[#D6B370]/20 shadow-xs py-4"
    : isHome
    ? "bg-transparent py-6"
    : "bg-[#FAF7F2]/85 backdrop-blur-md border-b border-[#D6B370]/20 py-6";

  const iconColor = isOpaque ? "text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" : "text-white hover:text-[#D8A7B1] transition-colors";
  const logoColor = isOpaque ? "text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" : "text-white hover:text-[#D8A7B1] transition-colors";
  const navLinkColor = isOpaque ? "text-[#3B2F2F]/80 hover:text-[#D8A7B1] transition-colors" : "text-white/80 hover:text-[#D8A7B1] transition-colors";
  const activeNavColor = "text-[#D8A7B1]";
  const underlineBg = "bg-[#D8A7B1]";
  const menuToggleColor = isOpaque ? "text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" : "text-white hover:text-[#D8A7B1] transition-colors";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden transition-colors ${menuToggleColor}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="text-xl md:text-2xl font-serif tracking-[4px]">
            <Link href="/" className={`transition-colors ${logoColor}`}>
              CASA AMORA
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[0.75rem] uppercase tracking-[1.5px] font-medium">
            <Link
              href="/"
              className={`relative py-2 transition-colors ${navLinkColor} ${pathname === "/" ? activeNavColor : ""}`}
            >
              Home
              {pathname === "/" && (
                <motion.div layoutId="nav-underline" className={`absolute bottom-0 left-0 right-0 h-[1px] ${underlineBg}`} />
              )}
            </Link>
            
            <Link href="/products?category=1" className={`py-2 transition-colors ${navLinkColor} ${pathname === "/products" && searchParams.get("category") === "1" ? activeNavColor : ""}`}>Women</Link>
            <Link href="/products?category=2" className={`py-2 transition-colors ${navLinkColor} ${pathname === "/products" && searchParams.get("category") === "2" ? activeNavColor : ""}`}>Kids</Link>
            
            <Link
              href="/customize"
              className={`relative py-2 transition-colors ${navLinkColor} ${pathname === "/customize" ? activeNavColor : ""}`}
            >
              Custom Studio
              {pathname === "/customize" && (
                <motion.div layoutId="nav-underline" className={`absolute bottom-0 left-0 right-0 h-[1px] ${underlineBg}`} />
              )}
            </Link>

            <Link
              href="/visual-search"
              className={`relative py-2 transition-colors ${navLinkColor} ${pathname === "/visual-search" ? activeNavColor : ""}`}
            >
              Visual Search
              {pathname === "/visual-search" && (
                <motion.div layoutId="nav-underline" className={`absolute bottom-0 left-0 right-0 h-[1px] ${underlineBg}`} />
              )}
            </Link>

            <Link href="/#lookbook" className={`py-2 transition-colors ${navLinkColor}`}>Lookbook</Link>
            <Link href="/contact" className={`py-2 transition-colors ${navLinkColor}`}>Contact</Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4 md:space-x-5">
            <Link href="/products" className={`transition-colors ${iconColor}`} aria-label="Search Products">
              <Search size={18} />
            </Link>
            <Link href="/favorites" className={`transition-colors ${iconColor}`} aria-label="Wishlist">
              <Heart size={18} />
            </Link>
            <Link href="/cart" className={`transition-colors ${iconColor}`} aria-label="Shopping Cart">
              <ShoppingBag size={18} />
            </Link>
            <Link href={isLoggedIn ? "/profile" : "/auth"} className={`transition-colors ${iconColor}`} aria-label="My Account">
              <User size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-2xl flex flex-col justify-center items-center space-y-6 pt-16"
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Home</Link>
            <Link href="/products?category=1" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Women</Link>
            <Link href="/products?category=2" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Kids</Link>
            <Link href="/customize" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Custom Studio</Link>
            <Link href="/visual-search" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Visual Search</Link>
            <Link href="/#lookbook" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Lookbook</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-lg uppercase tracking-[2px] font-serif text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors">Contact</Link>

            <div className="flex items-center gap-6 pt-6 border-t border-[#D6B370]/20 w-48 justify-center">
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" aria-label="Search"><Search size={20} /></Link>
              <Link href="/favorites" onClick={() => setMobileMenuOpen(false)} className="text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" aria-label="Favorites"><Heart size={20} /></Link>
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" aria-label="Cart"><ShoppingBag size={20} /></Link>
              <Link href={isLoggedIn ? "/profile" : "/auth"} onClick={() => setMobileMenuOpen(false)} className="text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors" aria-label="Profile"><User size={20} /></Link>
            </div>

            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors cursor-pointer">
              <X size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
