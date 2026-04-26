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
    // Add to localstorage cart
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
    // Trigger storage event to notify other components if any
    window.dispatchEvent(new Event("storage"));
    alert(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col space-y-3 bg-dark-950 luxury-border p-3 overflow-hidden"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-dark-900">
        {product.badge && (
          <span className="absolute top-2 left-2 z-10 bg-gold-600 text-dark-900 text-[0.6rem] uppercase tracking-[1.5px] font-bold px-2 py-1">
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
            <div className="absolute inset-0 bg-dark-900/10 group-hover:bg-dark-900/0 transition-colors duration-500" />
          </div>
        </Link>

        {/* Hover Action Buttons */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button 
            className={`p-3 rounded-full backdrop-blur-md transition-colors ${
              isFavorite ? "bg-gold-500 text-dark-900" : "bg-dark-950/80 text-white hover:text-gold-500"
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
            className="p-3 rounded-full bg-dark-950/80 text-white hover:text-gold-500 backdrop-blur-md transition-colors" 
            onClick={handleAddToCart}
            aria-label="Add to Cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col space-y-1">
        <span className="text-[0.65rem] uppercase tracking-[2px] text-white/40">{product.category}</span>
        
        <Link href={`/product/${product.id}`} className="font-serif text-sm md:text-base text-white hover:text-gold-500 transition-colors truncate">
          {product.name}
        </Link>
        
        <p className="text-xs md:text-sm text-gold-500 font-semibold">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
      </div>
    </motion.div>
  );
}
