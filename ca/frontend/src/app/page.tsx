"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";

const placeholderFeatured = [
  { id: 1, name: "Velvet Maxi Dress", price: "3,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983" },
  { id: 2, name: "Silk Churidhar Set", price: "2,899", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974" },
  { id: 3, name: "Premium Linen Abaya", price: "4,199", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1974" },
  { id: 4, name: "Organza Floral Saree", price: "5,499", image: "https://images.unsplash.com/photo-1583391265517-35bbdba0122a?q=80&w=1974" }
];

const testimonials = [
  { quote: "The customized velvet maxi fits absolutely like a dream. The craftsmanship is pure royalty.", author: "Aishwarya R.", location: "Kochi" },
  { quote: "An elegant experience. The online custom measurement form was simple and the fit is incredibly precise.", author: "Meera Nair", location: "Trivandrum" },
  { quote: "I ordered standard kids ethnic wear and standard delivery was super fast. Highly recommended!", author: "Shruti Suresh", location: "Calicut" }
];

export default function Home() {
  const [products, setProducts] = useState<any[]>(placeholderFeatured);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { scrollY } = useScroll();

  // Parallax effects for Hero
  const yHeroBg = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi("/products/");
        if (data && data.length > 0) {
          // Map to match structure
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
    loadData();
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative overflow-hidden bg-dark-900 min-h-screen">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yHeroBg, opacity: opacityHero }} className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
            alt="Luxury Atelier Modeling"
            fill
            priority
            className="object-cover object-center brightness-[0.4]"
          />
        </motion.div>

        {/* Floating Typography Animations */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8 mt-16">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs md:text-sm uppercase tracking-[6px] text-gold-500 font-semibold"
          >
            Bespoke Haute Couture
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl md:text-8xl tracking-[3px] text-white font-medium"
          >
            CASA AMORA
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[1px] bg-gold-500/50 mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
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

        {/* Cinematic Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center space-y-2 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <span className="text-[0.65rem] uppercase tracking-[3px] text-white/40">Scroll Down</span>
          <div className="w-[1px] h-10 bg-white/20" />
        </motion.div>
      </section>

      {/* 2. Brand Marquee */}
      <section className="bg-dark-950 py-8 border-y border-dark-800 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex space-x-16 text-xs uppercase tracking-[4px] text-gold-500/70 font-semibold font-serif">
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

      {/* 3. Auto-Moving Featured Products */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <p className="text-xs uppercase tracking-[4px] text-gold-500">The Editorial Selection</p>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Trending Styles</h2>
          <div className="w-12 h-[1px] bg-gold-500/30 mx-auto mt-4" />
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
                <div className="relative aspect-[3/4] w-full overflow-hidden luxury-border bg-dark-950">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-dark-900/10 group-hover:bg-dark-900/0 transition-colors duration-500" />
                </div>
                
                <div className="flex justify-between items-start pt-2">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg text-white group-hover:text-gold-500 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-sm text-gold-500/80 font-medium">₹{prod.price}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/30 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Categories Card Grid */}
      <section className="bg-dark-950 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Women Category Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="group relative aspect-[16/10] w-full overflow-hidden luxury-border cursor-pointer flex items-center justify-center"
          >
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1974"
              alt="Women's Couture"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.4] group-hover:brightness-[0.3]"
            />
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[0.7rem] uppercase tracking-[4px] text-gold-500 font-semibold block">Exclusive Collection</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white">WOMEN'S COUTURE</h2>
              <Link href="/products?category=1" className="inline-flex items-center space-x-2 text-xs uppercase tracking-[2px] text-white group-hover:text-gold-500 transition-colors pt-2">
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
            className="group relative aspect-[16/10] w-full overflow-hidden luxury-border cursor-pointer flex items-center justify-center"
          >
            <Image
              src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070"
              alt="Kids Festive Wear"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.4] group-hover:brightness-[0.3]"
            />
            <div className="relative z-10 text-center space-y-4">
              <span className="text-[0.7rem] uppercase tracking-[4px] text-gold-500 font-semibold block">Festive Outfits</span>
              <h2 className="font-serif text-3xl md:text-5xl text-white">KIDS' EDITIONS</h2>
              <Link href="/products?category=2" className="inline-flex items-center space-x-2 text-xs uppercase tracking-[2px] text-white group-hover:text-gold-500 transition-colors pt-2">
                <span>View Range</span> <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. Client Testimonial Auto-Slider */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center relative">
        <div className="space-y-3 mb-10">
          <div className="flex justify-center text-gold-500 space-x-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
        </div>

        <div className="min-h-[160px] flex items-center justify-center overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="font-serif text-lg md:text-2xl text-white/90 italic font-light leading-relaxed">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <div>
                <h4 className="text-white font-medium text-sm tracking-[2px] uppercase">
                  {testimonials[activeTestimonial].author}
                </h4>
                <p className="text-xs text-gold-500/80 mt-1">{testimonials[activeTestimonial].location}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel buttons */}
        <div className="flex justify-center items-center space-x-6 mt-8">
          <button onClick={prevTestimonial} className="p-2 border border-white/10 hover:border-gold-500 text-white/50 hover:text-white transition-colors" aria-label="Previous Testimonial">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextTestimonial} className="p-2 border border-white/10 hover:border-gold-500 text-white/50 hover:text-white transition-colors" aria-label="Next Testimonial">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* 6. Newsletter Section */}
      <section className="bg-dark-950 py-20 px-6 border-t border-dark-800">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h3 className="font-serif text-2xl md:text-4xl text-white">Join The Atelier Circle</h3>
          <p className="text-sm text-white/60 font-light leading-relaxed max-w-md mx-auto">
            Enjoy priority reservations for custom tailoring slots and receive invitations to private seasonal collection reveals.
          </p>
          <div className="flex flex-col sm:flex-row border border-white/10 overflow-hidden max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent text-xs p-4 flex-grow outline-none border-none text-white"
            />
            <button className="bg-gold-500 text-dark-900 text-xs px-6 py-4 uppercase font-semibold tracking-[2px] hover:bg-gold-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-dark-950/90 backdrop-blur-md border-t border-dark-800 md:hidden flex justify-center">
        <Link href="/products" className="btn-primary w-full text-center py-3">
          Explore Couture Outfits
        </Link>
      </div>

    </div>
  );
}
