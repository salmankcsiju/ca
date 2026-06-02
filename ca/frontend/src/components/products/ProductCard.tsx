"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("casa_amora_cart") || "[]");
    const existing = cart.find((item: any) => item.id === product.id && item.size === "M");
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: "M",
        quantity: 1,
        custom_measurements: null
      });
    }
    localStorage.setItem("casa_amora_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    alert(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col space-y-3 bg-white/70 backdrop-blur-xs border border-[#D6B370]/18 p-3 rounded-2xl hover:border-[#D8A7B1]/40 transition-colors shadow-xs overflow-hidden"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F2] rounded-xl">
        {product.badge && (
          <span className="absolute top-2 left-2 z-10 bg-[#D8A7B1] text-white text-[0.6rem] uppercase tracking-[1.5px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
            {product.badge}
          </span>
        )}
        
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full h-full">
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        </Link>

        {/* Hover Action Buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button 
            className={`p-3 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isFavorite ? "bg-[#D8A7B1] text-white shadow-xs" : "bg-white/80 text-[#3B2F2F] hover:text-[#D8A7B1]"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            aria-label="Add to Favorites"
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          
          <button 
            className="p-3 rounded-full bg-white/80 text-[#3B2F2F] hover:text-[#D8A7B1] backdrop-blur-md transition-all cursor-pointer" 
            onClick={handleAddToCart}
            aria-label="Add to Cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col space-y-1 px-1">
        <span className="text-[0.65rem] uppercase tracking-[2px] text-slate-400">{product.category}</span>
        
        <Link href={`/product/${product.id}`} className="font-serif text-sm md:text-base text-[#3B2F2F] hover:text-[#D8A7B1] transition-colors truncate">
          {product.name}
        </Link>
        
        <p className="text-xs md:text-sm text-[#D8A7B1] font-bold">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </motion.div>
  );
}
