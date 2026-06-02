"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Check, ArrowRight, ArrowLeft, Heart, RefreshCw, ShoppingBag, Upload, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

const matchedProducts = [
  { id: 1, name: "Velvet Maxi Dress", price: 3499, match: 96, category: "Women - Maxi", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600" },
  { id: 2, name: "Premium Linen Abaya", price: 4199, match: 91, category: "Women - Abaya", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600" },
  { id: 4, name: "Organza Floral Saree", price: 5499, match: 84, category: "Women - Saree", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600" }
];

const completeLookItems = [
  { name: "Metallic Gold Heels", price: "2,499", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200" },
  { name: "Aesthetic Rose Clutch", price: "1,899", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a7a5?q=80&w=200" },
  { name: "Baroque Pearl Earrings", price: "899", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200" }
];

function VisualSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHome = searchParams.get("image");

  // State configurations
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Auto trigger if redirected with upload context from homepage
  useEffect(() => {
    if (fromHome === "user_upload") {
      setUploadedImage("https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600");
      setScanning(true);
      setScanStep(0);
      
      const timer1 = setTimeout(() => setScanStep(1), 1200);
      const timer2 = setTimeout(() => {
        setScanning(false);
        setShowResults(true);
      }, 2800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [fromHome]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      triggerScanning();
    };
    reader.readAsDataURL(file);
  };

  const triggerScanning = () => {
    setScanning(true);
    setScanStep(0);
    setShowResults(false);

    setTimeout(() => {
      setScanStep(1);
    }, 1200);

    setTimeout(() => {
      setScanning(false);
      setShowResults(true);
    }, 2800);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setScanning(false);
    setShowResults(false);
    setScanStep(0);
    // Clear search param
    router.push("/visual-search");
  };

  // 1. SCANNING STATE SCREEN
  if (scanning) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 pt-24 text-[#3B2F2F]">
        <div className="max-w-md w-full text-center space-y-8 relative">
          
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {/* Outer dotted spinning ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#D6B370]/40"
            />
            {/* Inner pulse */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-40 h-40 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/30 flex flex-col items-center justify-center"
            />
            {/* Laser Line */}
            <motion.div 
              animate={{ y: [-70, 70, -70] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-36 h-[2px] bg-gradient-to-r from-transparent via-[#D8A7B1] to-transparent shadow-[0_0_8px_#D8A7B1] pointer-events-none"
            />
            <Sparkles size={36} className="text-[#D8A7B1] relative z-10 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold">
              {scanStep === 0 ? "Uploading inspiration matrix..." : "Scanning silhouettes & textures..."}
            </h2>
            <p className="text-xs text-slate-500 font-light max-w-xs mx-auto leading-relaxed">
              Our fashion AI is matching pattern tags, fabrics, and custom collar drapes to Casa Amora templates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. SEARCH RESULTS STATE SCREEN
  if (showResults && uploadedImage) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-28 pb-24 px-6 md:px-12 text-[#3B2F2F]">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              onClick={handleReset} 
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 hover:text-[#D8A7B1] transition-colors mb-2"
            >
              <ArrowLeft size={14} /> Back to Search
            </button>
            <h1 className="font-serif text-3xl md:text-4xl text-[#3B2F2F]">Visual Match Results</h1>
          </div>
          <button 
            onClick={handleReset}
            className="btn-secondary py-3 text-xs flex items-center gap-2"
          >
            <RefreshCw size={14} /> Scan Another Outfit
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Panel: Preview image */}
          <div className="lg:col-span-4 bg-white/60 border border-[#D6B370]/20 rounded-3xl p-6 shadow-lg space-y-6">
            <h3 className="font-serif text-lg font-semibold border-b border-[#D6B370]/20 pb-3">Your Inspiration Reference</h3>
            
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#D6B370]/15 bg-[#FAF7F2] shadow-xs">
              <img 
                src={uploadedImage} 
                alt="Reference Inspiration" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AI Detected Tags</p>
              <div className="flex flex-wrap gap-2">
                {["Elegant Fit", "Velvet / Organza", "Soft Pastel", "Atelier Template", "Feminine Silhouette"].map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 text-[9px] font-semibold bg-[#D8A7B1]/10 text-[#D8A7B1] border border-[#D8A7B1]/20 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Matches Grid */}
          <div className="lg:col-span-8 space-y-12">
            
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-semibold border-b border-[#D6B370]/20 pb-3 flex items-center gap-2">
                Similar Styles Available <Sparkles size={16} className="text-[#D6B370]" />
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {matchedProducts.map((prod) => (
                  <div key={prod.id} className="bg-white/40 border border-[#D6B370]/20 hover:border-[#D8A7B1]/50 rounded-2xl p-4 shadow-sm group transition-all duration-300 relative flex flex-col justify-between">
                    
                    <span className="absolute top-6 left-6 z-10 bg-gradient-to-r from-[#D8A7B1] to-[#D6B370] text-white text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {prod.match}% Match
                    </span>

                    <div className="space-y-4">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#FAF7F2] border border-[#D6B370]/10">
                        <Image 
                          src={prod.image} 
                          alt={prod.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-103" 
                        />
                      </div>
                      
                      <div className="space-y-1 px-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400">{prod.category}</span>
                        <h4 className="font-serif text-sm font-semibold text-[#3B2F2F] group-hover:text-[#D8A7B1] transition-colors truncate">
                          {prod.name}
                        </h4>
                        <p className="text-xs font-bold text-[#D8A7B1]">₹{prod.price.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D6B370]/10">
                      <Link href={`/product/${prod.id}`} className="btn-secondary py-2 px-3 text-[10px] w-full text-center block">
                        View Details
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Complete look recommendation */}
            <div className="bg-[#F3E9DC]/60 border border-[#D6B370]/20 rounded-3xl p-8 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[#D8A7B1] font-bold">Atelier Recommendation</p>
                <h3 className="font-serif text-xl text-[#3B2F2F]">Style Complete Look</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {completeLookItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/40 border border-[#D6B370]/10 rounded-xl p-3 shadow-2xs">
                    <div className="relative h-16 w-16 aspect-square rounded-lg overflow-hidden border border-[#D6B370]/10 bg-white shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-semibold text-[#3B2F2F] leading-snug">{item.name}</h4>
                      <p className="text-[10px] text-[#D8A7B1] font-bold">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    );
  }

  // 3. INITIAL UPLOAD REFERENCE SCREEN (Default direct navigation)
  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-28 pb-24 px-6 md:px-12 text-[#3B2F2F] flex flex-col items-center justify-center">
      
      <div className="max-w-3xl w-full text-center space-y-4 mb-12">
        <span className="text-xs uppercase tracking-[4px] text-[#D8A7B1] font-semibold">Visual Search Atelier</span>
        <h1 className="font-serif text-4xl md:text-5xl tracking-wide text-[#3B2F2F]">Smart Outfit Finder</h1>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#D6B370] to-transparent mx-auto mt-4" />
        <p className="text-sm text-slate-500 font-light max-w-lg mx-auto leading-relaxed pt-2">
          Upload any fashion inspiration screenshot from Pinterest, Instagram, or a personal folder, and our AI will search the catalog for similar premium custom designs.
        </p>
      </div>

      <div className="max-w-2xl w-full">
        {/* Upload Container */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-12 flex flex-col justify-center items-center text-center transition-all duration-300 min-h-[340px] bg-white/40 ${
            dragActive 
              ? "border-[#D8A7B1] bg-white shadow-xl scale-[1.01]" 
              : "border-[#D6B370]/40 hover:border-[#D8A7B1]/60 hover:bg-white/60 shadow-md"
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#D6B370]/20 flex items-center justify-center mb-6 text-[#D8A7B1] shadow-xs">
            <Upload size={32} />
          </div>
          
          <h3 className="font-serif text-xl text-[#3B2F2F] mb-2 font-medium">
            Drag & Drop outfit reference here
          </h3>
          <p className="text-xs text-slate-400 font-light max-w-sm mb-6 leading-relaxed">
            Drop your screenshot, photo, or sketch image here to detect similar sleeves, neck cuts, and materials.
          </p>

          <label 
            htmlFor="visual-page-upload" 
            className="btn-primary cursor-pointer inline-flex items-center gap-2 py-3 px-8 text-xs uppercase tracking-wider font-semibold"
          >
            <ImageIcon size={16} /> Choose Image File
          </label>
          <input 
            id="visual-page-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />

          <div className="absolute inset-0 -z-10 bg-radial-gradient from-[#D8A7B1]/10 to-transparent blur-3xl opacity-50 pointer-events-none" />
        </div>
      </div>

    </div>
  );
}

export default function VisualSearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32">
        <p className="text-slate-400/60 tracking-[2.5px] text-xs uppercase animate-pulse font-serif">
          Loading Visual Search...
        </p>
      </div>
    }>
      <VisualSearchContent />
    </Suspense>
  );
}
