"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Minus, Plus, Star, Truck, RefreshCw, Info, Upload } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32">
        <p className="text-slate-400/70 tracking-[2px] text-xs uppercase animate-pulse font-serif">Loading Atelier Details...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32 text-center space-y-4">
        <p className="text-[#3B2F2F]/60 font-serif text-lg">Outfit Not Found</p>
        <button onClick={() => router.push("/products")} className="btn-secondary text-[0.7rem]">Return to Catalog</button>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images.map((img: any) => img.image_url) 
    : ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983"];

  const handleAddToCart = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("casa_amora_token") : null;
    if (!token) {
      router.push(`/auth?redirect=/product/${product.id}`);
      return;
    }
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
    const token = typeof window !== "undefined" ? localStorage.getItem("casa_amora_token") : null;
    if (!token) {
      router.push(`/auth?redirect=/product/${product.id}`);
      return;
    }
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
    <div className="bg-[#FAF7F2] min-h-screen pt-32 pb-24 px-6 md:px-12 text-[#3B2F2F]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Side: Images Gallery */}
        <div className="w-full lg:w-[60%] flex flex-col md:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="order-2 md:order-1 flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto hide-scrollbar">
            {images.map((img: string, idx: number) => (
              <button 
                key={idx} 
                className={`relative h-20 w-20 aspect-square overflow-hidden bg-[#FAF7F2] border rounded-lg transition-all cursor-pointer ${
                  activeImage === idx ? "border-[#D8A7B1] scale-95" : "border-[#D6B370]/20 hover:border-[#D8A7B1]/40"
                }`}
                onClick={() => setActiveImage(idx)}
              >
                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Zoom Display */}
          <div 
            className="order-1 md:order-2 relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#D6B370]/20 bg-[#FAF7F2] cursor-zoom-in shadow-xs"
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
            <div 
              className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 border border-[#D6B370]/10" 
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
        <div className="w-full lg:w-[40%] space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[3px] text-[#D8A7B1] font-semibold">
              {product.category_name || "Haute Couture"}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl tracking-wide text-[#3B2F2F]">{product.name}</h1>
            
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-2xl font-bold text-[#D8A7B1]">
                ₹{parseFloat(product.price).toLocaleString("en-IN")}
              </span>
              {product.in_stock ? (
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[0.65rem] uppercase tracking-[1.5px] font-bold px-2.5 py-1 rounded-full">
                  Ready to sew
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[0.65rem] uppercase tracking-[1.5px] font-bold px-2.5 py-1 rounded-full">
                  Tailored Only
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 font-light leading-relaxed">{product.description}</p>

          {/* Size grid */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[2px] text-[#3B2F2F]/60 font-semibold">Select Size</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {sizes.map((size) => (
                <button 
                  key={size}
                  className={`py-3 text-xs tracking-wider border rounded-xl transition-all cursor-pointer ${
                    selectedSize === size 
                      ? "border-[#D8A7B1] bg-[#D8A7B1] text-white font-medium" 
                      : "border-[#D6B370]/20 text-[#3B2F2F] hover:border-[#D8A7B1] hover:bg-[#D8A7B1]/5"
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
                className="text-xs text-[#D8A7B1] leading-relaxed font-light italic"
              >
                * An expert tailor from Salman's team will contact you to collect bespoke measurements.
              </motion.p>
            )}
          </div>

          {/* Quantity counter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-[2px] text-[#3B2F2F]/60 font-semibold">Quantity</h3>
            <div className="inline-flex items-center border border-[#D6B370]/20 bg-white/40 rounded-full overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-slate-500 hover:text-[#D8A7B1] transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-6 text-sm font-semibold">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-slate-500 hover:text-[#D8A7B1] transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <button onClick={handleAddToCart} className="btn-primary flex-grow py-4">
                Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-secondary flex-grow py-4">
                Buy Now
              </button>
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-4 border transition-all rounded-full cursor-pointer ${
                  isFavorite 
                    ? "border-[#D8A7B1] text-[#D8A7B1] bg-[#D8A7B1]/5 shadow-2xs" 
                    : "border-[#D6B370]/25 text-[#3B2F2F] hover:border-[#D8A7B1]"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Interactive Customizer Studio Route Button */}
            <Link 
              href={`/customize?product=${product.id}`} 
              className="btn-secondary w-full py-4 text-center justify-center flex items-center gap-2 border-2 border-dashed border-[#D6B370]/50 hover:border-solid shadow-xs font-semibold"
            >
              👗 Customize Design in Studio
            </Link>
          </div>

          {/* Couture Accordion Sheets */}
          <div className="border-t border-[#D6B370]/20 pt-6 space-y-4 text-xs text-slate-500 font-light">
            <div className="flex items-center space-x-3">
              <Info size={16} className="text-[#D6B370]" />
              <span>Material: {product.material || "Premium Silk / Cotton Velvet"}</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={16} className="text-[#D6B370]" />
              <span>Care: {product.washing_instructions || "Dry clean only for bespoke stitching."}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Truck size={16} className="text-[#D6B370]" />
              <span>Shipment: Standard Delivery in 5-7 Days. Bespoke pieces take 10-12 Days.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Review list */}
      <section className="max-w-7xl mx-auto mt-24 border-t border-[#D6B370]/20 pt-16">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[3px] text-[#D8A7B1]">Shared Diaries</p>
            <h2 className="font-serif text-2xl md:text-3xl text-[#3B2F2F]">Client Showcases</h2>
          </div>
          <button className="btn-secondary text-[0.7rem] px-5 py-2.5 flex items-center gap-2">
            <Upload size={14} /> Submit Photo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#D6B370]/20 p-6 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-[#3B2F2F] text-sm">Aiswarya R.</h4>
                <p className="text-[0.65rem] text-slate-400">Verified Couture Owner</p>
              </div>
              <div className="flex text-[#D6B370] space-x-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-light italic leading-relaxed">
              "Absolutely gorgeous dress! The velvet felt premium and the custom stitching fits like a dream."
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
