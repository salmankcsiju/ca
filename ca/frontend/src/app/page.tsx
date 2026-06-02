"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ChevronLeft, ChevronRight, ShoppingBag, CreditCard, Scissors, Upload, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const placeholderFeatured = [
  { id: 1, name: "Velvet Maxi Dress", price: "3,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983" },
  { id: 2, name: "Silk Churidhar Set", price: "2,899", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974" },
  { id: 3, name: "Premium Linen Abaya", price: "4,199", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1974" },
  { id: 4, name: "Organza Floral Saree", price: "5,499", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1974" }
];

const placeholderLookbook = [
  { id: 1, user_name: "Aishwarya R.", product_name: "Velvet Maxi Dress", review_text: "The Velvet Maxi Dress fits like an absolute dream! The gold custom embroidery is stunning and received so many compliments.", client_image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600" },
  { id: 2, user_name: "Anjali Krishna", product_name: "Premium Linen Abaya", review_text: "This Linen Abaya is lightweight and perfect for warm weather. The black piping looks so elegant and premium.", client_image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600" },
  { id: 3, user_name: "Aishwarya R.", product_name: "Casual Cotton Kurthy", review_text: "Everyday comfort at its best. Indigo block print color is deep and didn't fade after washing. Love it!", client_image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600" }
];

const placeholderTestimonials = [
  { id: 1, user_name: "Meera Nair", product_name: "Silk Churidhar Set", review_text: "Superb custom tailoring. The Royal Blue tussar silk is incredibly soft and standard sizes are perfectly accurate." },
  { id: 2, user_name: "Shruti Suresh", product_name: "Organza Floral Saree", review_text: "Absolutely lovely pastel pink organza. The floral motifs are subtle and gorgeous. Excellent customer service!" },
  { id: 3, user_name: "Meera Nair", product_name: "Embroidered Frock", review_text: "Perfect birthday frock for my little girl! She looked like a princess in the pearl white A-line dress." }
];

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>(placeholderFeatured);
  const [lookbookDiaries, setLookbookDiaries] = useState<any[]>(placeholderLookbook);
  const [textTestimonials, setTextTestimonials] = useState<any[]>(placeholderTestimonials);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effects for Hero
  const yHeroBg = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi("/products/");
        if (data && data.length > 0) {
          const formatted = data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price).toLocaleString("en-IN"),
            image: p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983"
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.error("Failed to load products: ", err);
      }
    };

    const loadDiaries = async () => {
      try {
        const data = await fetchApi("/diaries/");
        if (data && data.length > 0) {
          const withPhotos = data.filter((d: any) => d.client_image_url);
          const withoutPhotos = data.filter((d: any) => !d.client_image_url);
          if (withPhotos.length > 0) {
            setLookbookDiaries(withPhotos);
          }
          if (withoutPhotos.length > 0) {
            setTextTestimonials(withoutPhotos);
          }
        }
      } catch (err) {
        console.error("Failed to load diaries: ", err);
      }
    };

    loadData();
    loadDiaries();
  }, []);

  const nextTestimonial = () => {
    if (textTestimonials.length === 0) return;
    setActiveTestimonial((prev) => (prev + 1) % textTestimonials.length);
  };

  const prevTestimonial = () => {
    if (textTestimonials.length === 0) return;
    setActiveTestimonial((prev) => (prev - 1 + textTestimonials.length) % textTestimonials.length);
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      router.push("/visual-search?image=user_upload");
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      router.push("/visual-search?image=user_upload");
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#FAF7F2] min-h-screen text-[#3B2F2F]">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yHeroBg, opacity: opacityHero }} className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
            alt="Soft Luxury Feminine Model Backdrop"
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover object-center brightness-[0.75]"
          />
          {/* Light elegant overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#FAF7F2]" />
        </motion.div>

        {/* Floating Typography Animations */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8 mt-16">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs md:text-sm uppercase tracking-[6px] text-white font-semibold drop-shadow-sm"
          >
            Bespoke Haute Couture
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl md:text-8xl tracking-[4px] text-white font-medium drop-shadow-md"
          >
            CASA AMORA
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[1px] bg-white/70 mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-lg text-white max-w-2xl mx-auto font-light leading-relaxed tracking-wide drop-shadow-xs"
          >
            Indulge in a premium tailoring experience. Vows of beauty, bespoke stitching, and timeless silhouettes made precisely for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="pt-6"
          >
            <Link href="/products" className="btn-primary">
              Discover Collections <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <span className="text-[0.65rem] uppercase tracking-[3px] text-white/60">Scroll Down</span>
          <div className="w-[1px] h-10 bg-white/30" />
        </motion.div>
      </section>

      {/* 2. Brand Marquee */}
      <section className="bg-[#F3E9DC] py-8 border-y border-[#D6B370]/20 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex space-x-16 text-xs uppercase tracking-[4px] text-[#3B2F2F]/70 font-semibold font-serif">
          <span>HAUTE COUTURE</span>
          <span>•</span>
          <span>BESPOKE STITCHING</span>
          <span>•</span>
          <span>LUXURY FIT</span>
          <span>•</span>
          <span>PREMIUM EMBROIDERY</span>
          <span>•</span>
          <span>CLIENT LOOKBOOK</span>
          <span>•</span>
          <span>HAUTE COUTURE</span>
          <span>•</span>
          <span>BESPOKE STITCHING</span>
          <span>•</span>
          <span>LUXURY FIT</span>
          <span>•</span>
          <span>PREMIUM EMBROIDERY</span>
          <span>•</span>
          <span>CLIENT LOOKBOOK</span>
        </div>
      </section>

      {/* Bespoke Crafting Process Section (Spacious layout) */}
      <section className="py-32 bg-[#FAF7F2] border-b border-[#D6B370]/15">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-3 mb-20">
            <p className="text-xs uppercase tracking-[4px] text-[#D8A7B1]">The Atelier Experience</p>
            <h2 className="text-3xl md:text-5xl font-serif text-[#3B2F2F]">Our Bespoke Journey</h2>
            <div className="w-12 h-[1px] bg-[#D6B370]/30 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[43%] left-[15%] right-[15%] h-[1px] bg-[#D6B370]/20 z-0" />
            
            {[
              {
                step: "01",
                title: "Browse & Design Sizing",
                desc: "Choose an elegant outfit from our collection. Select from standard sizing or submit custom shoulder, bust, and height measurements directly online.",
                icon: <ShoppingBag size={24} className="text-[#D6B370]" />
              },
              {
                step: "02",
                title: "1/3 Advance Deposit",
                desc: "Pay a 1/3 advance cash payment to secure your customized booking slot. This confirms the order and procures high-grade fabrics.",
                icon: <CreditCard size={24} className="text-[#D6B370]" />
              },
              {
                step: "03",
                title: "Bespoke Craft & Delivery",
                desc: "Our master artisans cut and sew the outfit to your exact measurements. Your flawless couture item is then delivered straight to you.",
                icon: <Scissors size={24} className="text-[#D6B370]" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative z-10 glass-card p-10 hover:shadow-xl hover:border-[#D8A7B1]/60 transition-all duration-500 group flex flex-col items-center text-center rounded-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D6B370]/20 flex items-center justify-center mb-6 group-hover:bg-[#D8A7B1]/5 group-hover:border-[#D8A7B1]/40 transition-colors duration-500">
                  {item.icon}
                </div>
                <span className="font-serif text-3xl text-[#D6B370]/40 group-hover:text-[#D8A7B1]/75 transition-colors duration-500 font-semibold mb-2 block">{item.step}</span>
                <h3 className="font-serif text-xl text-[#3B2F2F] group-hover:text-[#D8A7B1] transition-colors mb-3">{item.title}</h3>
                <p className="text-xs text-[#3B2F2F]/70 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Custom Design Studio Showcase Section */}
      <section className="py-32 bg-[#F3E9DC]/40 border-b border-[#D6B370]/15 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left: SVG representation of dress customization */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm aspect-[4/5] bg-white border border-[#D6B370]/25 rounded-3xl p-8 flex flex-col justify-center items-center shadow-lg group hover:border-[#D8A7B1]/60 transition-all duration-500">
              <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest text-[#D8A7B1] font-semibold bg-[#D8A7B1]/10 px-3 py-1 rounded-full">
                Interactive Atelier
              </span>
              
              <div className="w-56 h-80 relative flex justify-center items-center opacity-85 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xs" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 140 L140 140 L165 240 L35 240 Z" fill="#E8C5C8" stroke="#3B2F2F" strokeWidth="1.5" />
                  <path d="M60 70 L140 70 L140 140 L60 140 Z" fill="#E8C5C8" stroke="#3B2F2F" strokeWidth="1.5" />
                  <path d="M80 70 L100 98 L120 70 Z" fill="#FAF7F2" stroke="#3B2F2F" strokeWidth="1.5" />
                  <path d="M42 68 Q50 50 60 70 Q55 85 45 80 Z" fill="#E8C5C8" stroke="#3B2F2F" strokeWidth="1.5" />
                  <path d="M158 68 Q150 50 140 70 Q145 85 155 80 Z" fill="#E8C5C8" stroke="#3B2F2F" strokeWidth="1.5" />
                  <line x1="60" y1="140" x2="140" y2="140" stroke="#3B2F2F" strokeWidth="3" />
                  
                  {/* Dotted lines pointing to customization parts */}
                  <line x1="45" y1="65" x2="15" y2="55" stroke="#D6B370" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="5" y="48" fill="#3B2F2F" fontSize="8" fontFamily="serif" letterSpacing="0.5">Sleeve Cut</text>
                  
                  <line x1="100" y1="85" x2="100" y2="40" stroke="#D6B370" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="80" y="33" fill="#3B2F2F" fontSize="8" fontFamily="serif" letterSpacing="0.5">Neckline</text>

                  <line x1="155" y1="180" x2="185" y2="170" stroke="#D6B370" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="160" y="162" fill="#3B2F2F" fontSize="8" fontFamily="serif" letterSpacing="0.5">Hemline</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: Content details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D6B370]/10 text-[#D6B370] text-xs font-semibold uppercase tracking-wider rounded-full">
              <Scissors size={12} /> Custom Design Studio
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#3B2F2F] leading-tight">
              Design Your Perfect Silhouette
            </h2>
            <p className="text-slate-600 font-light leading-relaxed max-w-xl">
              Step into our virtual atelier and configure your outfit precisely to your liking. Choose from an array of sleeve cuts, necklines, lengths, and luxurious fabrics. Leave custom requests for unique shades and details, and our master tailors will craft it to perfection.
            </p>
            <div className="pt-2">
              <Link href="/customize" className="btn-primary inline-flex items-center gap-2">
                Open Custom Studio <Sparkles size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Find Your Style (Visual Search Interactive Upload Component) */}
      <section className="py-32 bg-[#F3E9DC]/60 border-y border-[#D6B370]/15 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D8A7B1]/10 text-[#D8A7B1] text-xs font-semibold uppercase tracking-wider rounded-full">
              <Sparkles size={12} /> Smart Search
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#3B2F2F] leading-tight">Find Your Style</h2>
            <p className="text-slate-600 font-light leading-relaxed max-w-md">
              Upload or drag any outfit inspiration screenshot (e.g. from Pinterest or Instagram), and our fashion AI will find similar custom styles in our collections!
            </p>
            <div className="pt-2">
              <label 
                htmlFor="visual-search-upload" 
                className="btn-primary cursor-pointer inline-flex items-center gap-2"
              >
                <Upload size={16} /> Upload Outfit Image
              </label>
              <input 
                id="visual-search-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          {/* Aesthetic Drag & Drop Area */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative h-80 rounded-3xl border-2 border-dashed flex flex-col justify-center items-center text-center p-8 transition-all duration-300 ${
              dragActive 
                ? "border-[#D8A7B1] bg-[#FAF7F2] shadow-xl scale-[1.02]" 
                : "border-[#D6B370]/40 bg-white/40 hover:border-[#D8A7B1]/60 hover:bg-white/60 shadow-xs"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#D6B370]/20 flex items-center justify-center mb-4 text-[#D8A7B1] shadow-2xs">
              <Upload size={24} />
            </div>
            <h3 className="font-serif text-lg text-[#3B2F2F] mb-2 font-medium">Drag & Drop inspiration here</h3>
            <p className="text-xs text-slate-500 font-light max-w-xs">
              Drop screenshot, photo, or click file selector to search styles.
            </p>
            {/* Subtle floating glow effect */}
            <div className="absolute inset-0 -z-10 bg-radial-gradient from-[#D8A7B1]/10 to-transparent blur-2xl opacity-50 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-20">
          <p className="text-xs uppercase tracking-[4px] text-[#D8A7B1]">The Editorial Selection</p>
          <h2 className="text-3xl md:text-5xl font-serif text-[#3B2F2F]">Trending Styles</h2>
          <div className="w-12 h-[1px] bg-[#D6B370]/30 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.map((prod, index) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group relative flex flex-col space-y-4 cursor-pointer"
            >
              <Link href={`/product/${prod.id}`}>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#D6B370]/20 bg-[#F3E9DC] shadow-xs">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                
                <div className="flex justify-between items-start pt-2 px-1">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg text-[#3B2F2F] group-hover:text-[#D8A7B1] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-[#D8A7B1] font-medium">₹{prod.price}</p>
                  </div>
                  <ChevronRight size={18} className="text-[#3B2F2F]/30 group-hover:text-[#D8A7B1] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Interactive Categories Card Grid */}
      <section className="bg-[#FAF7F2] py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Women Category Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-[#D6B370]/25 cursor-pointer flex items-center justify-center shadow-md"
          >
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974"
              alt="Women's Couture"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.8] group-hover:brightness-[0.7]"
            />
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[0.7rem] uppercase tracking-[4px] text-white font-semibold block drop-shadow-sm">Exclusive Collection</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white drop-shadow-md">WOMEN'S COUTURE</h2>
              <Link href="/products?category=1" className="inline-flex items-center space-x-2 text-xs uppercase tracking-[2px] text-white group-hover:text-[#D8A7B1] transition-colors pt-2 drop-shadow-sm">
                <span>View Range</span> <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Kids Category Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-[#D6B370]/25 cursor-pointer flex items-center justify-center shadow-md"
          >
            <Image
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070"
              alt="Kids Festive Wear"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.8] group-hover:brightness-[0.7]"
            />
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[0.7rem] uppercase tracking-[4px] text-white font-semibold block drop-shadow-sm">Festive Outfits</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white drop-shadow-md">KIDS' EDITIONS</h2>
              <Link href="/products?category=2" className="inline-flex items-center space-x-2 text-xs uppercase tracking-[2px] text-white group-hover:text-[#D8A7B1] transition-colors pt-2 drop-shadow-sm">
                <span>View Range</span> <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 6. Client Lookbook & Diaries */}
      <section id="lookbook" className="py-32 px-6 max-w-7xl mx-auto bg-[#FAF7F2] border-t border-[#D6B370]/15">
        <div className="text-center space-y-3 mb-20">
          <p className="text-xs uppercase tracking-[4px] text-[#D8A7B1]">Atelier Real Clients</p>
          <h2 className="text-3xl md:text-5xl font-serif text-[#3B2F2F]">Client Lookbooks</h2>
          <div className="w-12 h-[1px] bg-[#D6B370]/30 mx-auto mt-4" />
          <p className="text-xs text-slate-500 max-w-lg mx-auto font-light leading-relaxed pt-2">
            Moments of grace and timeless silhouettes captured by our lovely customers wearing their custom-tailored Casa Amora pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {lookbookDiaries.map((diary, index) => (
            <motion.div
              key={diary.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="glass-card p-6 flex flex-col justify-between rounded-2xl"
            >
              <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#D6B370]/20 bg-[#FAF7F2] rounded-xl shadow-2xs">
                  <Image
                    src={diary.client_image_url}
                    alt={`${diary.user_name || "Client"} lookbook`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 hover:scale-103"
                  />
                </div>
                <p className="font-light text-xs text-[#3B2F2F]/80 italic leading-relaxed">
                  "{diary.review_text}"
                </p>
              </div>

              <div className="border-t border-[#D6B370]/20 pt-4 mt-4 flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-[#3B2F2F]">
                <span>{diary.user_name}</span>
                <span className="text-[#D6B370] font-normal font-serif lowercase italic">{diary.product_name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. Client Testimonial Auto-Slider */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center relative border-t border-[#D6B370]/15">
        <div className="space-y-3 mb-10">
          <p className="text-xs uppercase tracking-[4px] text-[#D8A7B1]">Client Reviews</p>
          <div className="flex justify-center text-[#D6B370] space-x-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
        </div>

        <div className="min-h-[160px] flex items-center justify-center overflow-hidden relative">
          <AnimatePresence mode="wait">
            {textTestimonials.length > 0 && (
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <p className="font-serif text-lg md:text-2xl text-[#3B2F2F]/80 italic font-light leading-relaxed">
                  "{textTestimonials[activeTestimonial].review_text || textTestimonials[activeTestimonial].quote}"
                </p>
                <div>
                  <h4 className="text-[#3B2F2F] font-medium text-sm tracking-[2px] uppercase">
                    {textTestimonials[activeTestimonial].user_name || textTestimonials[activeTestimonial].author}
                  </h4>
                  <p className="text-xs text-[#D8A7B1] mt-1 font-serif italic lowercase">
                    {textTestimonials[activeTestimonial].product_name || textTestimonials[activeTestimonial].location}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Carousel buttons */}
        <div className="flex justify-center items-center space-x-6 mt-8">
          <button onClick={prevTestimonial} className="p-3 rounded-full border border-[#D6B370]/30 hover:border-[#D8A7B1] text-[#3B2F2F]/40 hover:text-[#D8A7B1] transition-colors cursor-pointer" aria-label="Previous Testimonial">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextTestimonial} className="p-3 rounded-full border border-[#D6B370]/30 hover:border-[#D8A7B1] text-[#3B2F2F]/40 hover:text-[#D8A7B1] transition-colors cursor-pointer" aria-label="Next Testimonial">
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* 8. Newsletter Section */}
      <section className="bg-[#F3E9DC] py-24 px-6 border-t border-[#D6B370]/20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="font-serif text-2xl md:text-4xl text-[#3B2F2F]">Join The Atelier Circle</h3>
          <p className="text-sm text-[#3B2F2F]/70 font-light leading-relaxed max-w-md mx-auto">
            Enjoy priority reservations for custom tailoring slots and receive invitations to private seasonal collection reveals.
          </p>
          <div className="flex flex-col sm:flex-row border border-[#D6B370]/20 bg-white/50 backdrop-blur-xs rounded-full overflow-hidden max-w-md mx-auto p-1 shadow-2xs">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent text-xs px-6 py-4 flex-grow outline-none border-none text-[#3B2F2F] placeholder-[#3B2F2F]/40"
            />
            <button className="bg-[#D8A7B1] text-white text-xs px-6 py-4 uppercase font-semibold tracking-[2px] hover:bg-[#D6B370] transition-colors rounded-full cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#D6B370]/20 md:hidden flex justify-center">
        <Link href="/products" className="btn-primary w-full text-center py-3.5">
          Explore Couture Outfits
        </Link>
      </div>

    </div>
  );
}
