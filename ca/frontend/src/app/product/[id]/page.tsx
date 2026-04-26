"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, Star, Truck, RefreshCw, Info, Upload, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const sizes = ["XS", "S", "M", "L", "XL", "Custom"];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchApi(`/products/${params.id}/`);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  if (loading) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center pt-32">
        <p className="text-white/40 tracking-[2px] text-xs uppercase animate-pulse">Loading Atelier Details...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="bg-dark-900 min-h-screen flex items-center justify-center pt-32 text-center space-y-4">
        <p className="text-white/60 font-serif text-lg">Outfit Not Found</p>
        <button onClick={() => router.push("/products")} className="btn-secondary text-[0.7rem]">Return to Catalog</button>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images.map((img: any) => img.image_url) 
    : ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983"];

  const handleAddToCart = () => {
    if (typeof window !== "undefined") {
      const currentCart = JSON.parse(localStorage.getItem("casa_amora_cart") || "[]");
      const newItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        size: selectedSize,
        quantity: quantity,
        image: images[0],
      };
      
      const existingIdx = currentCart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
      if (existingIdx > -1) {
        currentCart[existingIdx].quantity += quantity;
      } else {
        currentCart.push(newItem);
      }
      
      localStorage.setItem("casa_amora_cart", JSON.stringify(currentCart));
      alert("Added to cart!");
    }
  };

  const handleBuyNow = () => {
    if (typeof window !== "undefined") {
      const currentCart = JSON.parse(localStorage.getItem("casa_amora_cart") || "[]");
      const newItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        size: selectedSize,
        quantity: quantity,
        image: images[0],
      };
      
      const existingIdx = currentCart.findIndex((item: any) => item.id === product.id && item.size === selectedSize);
      if (existingIdx > -1) {
        currentCart[existingIdx].quantity += quantity;
      } else {
        currentCart.push(newItem);
      }
      
      localStorage.setItem("casa_amora_cart", JSON.stringify(currentCart));
      router.push("/cart");
    }
  };

  return (
    <div className="bg-dark-900 min-h-screen pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Side: Images Gallery */}
        <div className="w-full lg:w-[60%] flex flex-col md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="order-2 md:order-1 flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto hide-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                className={`relative h-20 w-20 aspect-square overflow-hidden bg-dark-950 border transition-all ${
                  activeImage === idx ? "border-gold-500 scale-95" : "border-white/10 hover:border-white/30"
                }`}
                onClick={() => setActiveImage(idx)}
              >
                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Zoom Display */}
          <div 
            className="order-1 md:order-2 relative aspect-[3/4] w-full overflow-hidden luxury-border bg-dark-950 cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' })}
          >
            <Image 
              src={images[activeImage]} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
            />
            {/* Magnifying Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 border border-gold-500/20" 
              style={{
                ...zoomStyle,
                backgroundImage: `url(${images[activeImage]})`,
                backgroundSize: "200%",
                backgroundRepeat: "no-repeat"
              }}
            />
          </div>
        </div>

        {/* Right Side: Product Configuration */}
        <div className="w-full lg:w-[40%] space-y-8 text-white">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[3px] text-gold-500 font-semibold">
              {product.category_name || "Haute Couture"}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl tracking-wide">{product.name}</h1>
            
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-2xl font-semibold text-gold-500">
                ₹{parseFloat(product.price).toLocaleString("en-IN")}
              </span>
              {product.in_stock ? (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.65rem] uppercase tracking-[1.5px] font-bold px-2 py-0.5">
                  Ready to sew
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[0.65rem] uppercase tracking-[1.5px] font-bold px-2 py-0.5">
                  Tailored Only
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-white/70 font-light leading-relaxed">{product.description}</p>

          {/* Size grid */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[2px] text-white/50 font-medium">Select Size</h3>
            <div className="grid grid-cols-6 gap-2">
              {sizes.map((size) => (
                <button 
                  key={size}
                  className={`py-3 text-xs tracking-wider border transition-all ${
                    selectedSize === size 
                      ? "border-gold-500 bg-gold-500 text-dark-900 font-semibold" 
                      : "border-white/10 text-white hover:border-white/30 hover:bg-white/5"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSize === "Custom" && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gold-500/80 leading-relaxed font-light italic"
              >
                * An expert tailor from Salman's team will contact you to collect bespoke measurements.
              </motion.p>
            )}
          </div>

          {/* Quantity counter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[2px] text-white/50 font-medium">Quantity</h3>
            <div className="inline-flex items-center border border-white/10">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-white/50 hover:text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-6 text-sm font-semibold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-white/50 hover:text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={handleAddToCart} className="btn-primary flex-grow py-4">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn-secondary flex-grow py-4">
              Buy Now
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-4 border transition-all ${
                isFavorite 
                  ? "border-gold-500 text-gold-500 bg-gold-500/5" 
                  : "border-white/10 text-white hover:border-white/30"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Couture Accordion Sheets */}
          <div className="border-t border-dark-800 pt-6 space-y-4 text-xs text-white/60 font-light">
            <div className="flex items-center space-x-3">
              <Info size={16} className="text-gold-500/70" />
              <span>Material: {product.material || "Premium Silk / Cotton Velvet"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={16} className="text-gold-500/70" />
              <span>Care: {product.washing_instructions || "Dry clean only for bespoke stitching."}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck size={16} className="text-gold-500/70" />
              <span>Shipment: Standard Delivery in 5-7 Days. Bespoke pieces take 10-12 Days.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Review list */}
      <section className="max-w-7xl mx-auto mt-24 border-t border-dark-800 pt-16">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[3px] text-gold-500">Shared Diaries</p>
            <h2 className="font-serif text-2xl md:text-3xl text-white">Client Showcases</h2>
          </div>
          <button className="btn-secondary text-[0.7rem] px-5 py-2.5 flex items-center gap-2">
            <Upload size={14} /> Submit Photo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-950 p-6 border border-dark-800/80 luxury-glow flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-white text-sm">Aiswarya R.</h4>
                <p className="text-[0.65rem] text-white/30">Verified Couture Owner</p>
              </div>
              <div className="flex text-gold-500 space-x-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-sm text-white/70 font-light italic leading-relaxed">
              "Absolutely gorgeous dress! The velvet felt premium and the custom stitching fits like a dream."
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
