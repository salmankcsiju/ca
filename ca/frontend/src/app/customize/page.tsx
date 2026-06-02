"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Heart, Sparkles, Check, Clipboard, Upload, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

function CustomizerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  // Selection states
  const [selectedSleeve, setSelectedSleeve] = useState("puff");
  const [selectedNeck, setSelectedNeck] = useState("vneck");
  const [selectedLength, setSelectedLength] = useState("midi");
  const [selectedFabric, setSelectedFabric] = useState("silk");
  const [selectedColor, setSelectedColor] = useState("rose");

  // Custom typing specifications/notes for each option
  const [sleeveNote, setSleeveNote] = useState("");
  const [neckNote, setNeckNote] = useState("");
  const [lengthNote, setLengthNote] = useState("");
  const [fabricNote, setFabricNote] = useState("");
  const [colorNote, setColorNote] = useState("");

  // Inspiration image state (for direct customization)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Direct Order Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSize, setOrderSize] = useState("Custom");
  const [orderMeasurements, setOrderMeasurements] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Options fetched from backend
  const [sleeves, setSleeves] = useState<any[]>([]);
  const [necks, setNecks] = useState<any[]>([]);
  const [lengths, setLengths] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);

  const [parentProduct, setParentProduct] = useState<any>(null);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load options from Django backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await fetchApi("/customization-options/");
        if (data && data.length > 0) {
          const sleeveOpts = data.filter((item: any) => item.option_type === "sleeve");
          const neckOpts = data.filter((item: any) => item.option_type === "neck");
          const lengthOpts = data.filter((item: any) => item.option_type === "length");
          const fabricOpts = data.filter((item: any) => item.option_type === "fabric");
          const colorOpts = data.filter((item: any) => item.option_type === "color");

          setSleeves(sleeveOpts);
          setNecks(neckOpts);
          setLengths(lengthOpts);
          setFabrics(fabricOpts);
          setColors(colorOpts);

          // Apply initial selections
          if (sleeveOpts.length > 0) setSelectedSleeve(sleeveOpts[0].code);
          if (neckOpts.length > 0) setSelectedNeck(neckOpts[0].code);
          if (lengthOpts.length > 0) setSelectedLength(lengthOpts[0].code);
          if (fabricOpts.length > 0) setSelectedFabric(fabricOpts[0].code);
          if (colorOpts.length > 0) setSelectedColor(colorOpts[0].code);
        } else {
          loadFallbacks();
        }
      } catch (err) {
        console.error("Failed to load options from backend, using fallbacks: ", err);
        loadFallbacks();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbacks = () => {
      setSleeves([
        { id: 1, option_type: "sleeve", code: "sleeveless", name: "Sleeveless" },
        { id: 2, option_type: "sleeve", code: "puff", name: "Puff Sleeve" },
        { id: 3, option_type: "sleeve", code: "full", name: "Full Sleeve" },
        { id: 4, option_type: "sleeve", code: "balloon", name: "Balloon Sleeve" }
      ]);
      setNecks([
        { id: 5, option_type: "neck", code: "round", name: "Round Neck" },
        { id: 6, option_type: "neck", code: "vneck", name: "V-Neck" },
        { id: 7, option_type: "neck", code: "square", name: "Square Neck" }
      ]);
      setLengths([
        { id: 8, option_type: "length", code: "short", name: "Short Dress" },
        { id: 9, option_type: "length", code: "midi", name: "Midi Dress" },
        { id: 10, option_type: "length", code: "maxi", name: "Maxi Dress" }
      ]);
      setFabrics([
        { id: 11, option_type: "fabric", code: "silk", name: "Premium Silk", description: "Glossy and luxurious" },
        { id: 12, option_type: "fabric", code: "satin", name: "Lustrous Satin", description: "Smooth drape, high sheen" },
        { id: 13, option_type: "fabric", code: "linen", name: "Pure Linen", description: "Lightweight, breathable" },
        { id: 14, option_type: "fabric", code: "cotton", name: "Soft Cotton", description: "Comfortable everyday wear" }
      ]);
      setColors([
        { id: 15, option_type: "color", code: "rose", name: "Blush Rose", description: "#E8C5C8" },
        { id: 16, option_type: "color", code: "lavender", name: "Lavender Glow", description: "#E2D9F3" },
        { id: 17, option_type: "color", code: "beige", name: "Oatmeal Beige", description: "#E8DFD3" },
        { id: 18, option_type: "color", code: "cream", name: "Soft Cream", description: "#FAF6EE" },
        { id: 19, option_type: "color", code: "wine", name: "Cabernet Wine", description: "#5C1D24" }
      ]);
    };

    fetchOptions();
  }, []);

  // Fetch parent product details if parameterized
  useEffect(() => {
    if (productId) {
      const loadProduct = async () => {
        try {
          const prod = await fetchApi(`/products/${productId}/`);
          setParentProduct(prod);
        } catch (e) {
          console.error("Failed to load parent product: ", e);
        }
      };
      loadProduct();
    }
  }, [productId]);

  // Load Saved Closet Designs & Check for redirected temporary spec
  useEffect(() => {
    const saved = localStorage.getItem("casa_amora_saved_designs");
    if (saved) {
      try {
        setMyDesigns(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const temp = localStorage.getItem("casa_amora_temp_customize");
    if (temp) {
      try {
        const spec = JSON.parse(temp);
        setSelectedSleeve(spec.sleeve);
        setSleeveNote(spec.sleeveNote);
        setSelectedNeck(spec.neck);
        setNeckNote(spec.neckNote);
        setSelectedLength(spec.length);
        setLengthNote(spec.lengthNote);
        setSelectedFabric(spec.fabric);
        setFabricNote(spec.fabricNote);
        setSelectedColor(spec.color);
        setColorNote(spec.colorNote);
        setSelectedImage(spec.image);
        localStorage.removeItem("casa_amora_temp_customize");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDesign = () => {
    const newDesign = {
      id: Date.now(),
      sleeve: selectedSleeve,
      sleeveNote,
      neck: selectedNeck,
      neckNote,
      length: selectedLength,
      lengthNote,
      fabric: selectedFabric,
      fabricNote,
      color: selectedColor,
      colorNote,
      parentName: parentProduct?.name || null,
      parentProductImage: parentProduct?.images?.[0]?.image_url || null,
      inspirationImage: selectedImage,
      date: new Date().toLocaleDateString()
    };
    const updated = [newDesign, ...myDesigns];
    setMyDesigns(updated);
    localStorage.setItem("casa_amora_saved_designs", JSON.stringify(updated));
    alert("Couture design saved to your closet successfully!");
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("casa_amora_cart") || "[]");
    
    // Create specs summary
    const specsSummary = [
      `Sleeve: ${sleeves.find(s => s.code === selectedSleeve)?.name || selectedSleeve}${sleeveNote ? ` (${sleeveNote})` : ""}`,
      `Neckline: ${necks.find(n => n.code === selectedNeck)?.name || selectedNeck}${neckNote ? ` (${neckNote})` : ""}`,
      `Hemline: ${lengths.find(l => l.code === selectedLength)?.name || selectedLength}${lengthNote ? ` (${lengthNote})` : ""}`,
      `Fabric: ${fabrics.find(f => f.code === selectedFabric)?.name || selectedFabric}${fabricNote ? ` (${fabricNote})` : ""}`,
      `Color: ${colors.find(c => c.code === selectedColor)?.name || selectedColor}${colorNote ? ` (${colorNote})` : ""}`
    ].join(" | ");

    const finalName = parentProduct 
      ? `Bespoke Customized ${parentProduct.name}`
      : `Bespoke Custom Atelier Dress`;

    const finalImage = selectedImage || parentProduct?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600";

    cart.push({
      id: `custom-${Date.now()}`,
      name: finalName,
      price: parentProduct ? parseFloat(parentProduct.price) : 2499,
      parent_id: parentProduct?.id || 1,
      size: "Custom",
      quantity: 1,
      image: finalImage,
      custom_details: {
        sleeve: selectedSleeve,
        sleeve_note: sleeveNote,
        neck: selectedNeck,
        neck_note: neckNote,
        length: selectedLength,
        length_note: lengthNote,
        fabric: selectedFabric,
        fabric_note: fabricNote,
        color: selectedColor,
        color_note: colorNote,
        inspiration_image: selectedImage,
        summary: specsSummary
      }
    });

    localStorage.setItem("casa_amora_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    alert("Bespoke custom dress added to cart!");
  };

  const handleOrderNowClick = () => {
    const token = localStorage.getItem("casa_amora_token");
    if (!token) {
      // Save current customization specs to reload after logging in
      const tempSpec = {
        sleeve: selectedSleeve,
        sleeveNote,
        neck: selectedNeck,
        neckNote,
        length: selectedLength,
        lengthNote,
        fabric: selectedFabric,
        fabricNote,
        color: selectedColor,
        colorNote,
        image: selectedImage,
        productId
      };
      localStorage.setItem("casa_amora_temp_customize", JSON.stringify(tempSpec));
      router.push(`/auth?redirect=/customize${productId ? `?product=${productId}` : ""}`);
      return;
    }
    setShowOrderModal(true);
  };

  const handlePlaceOrderDirect = async () => {
    setSubmittingOrder(true);
    try {
      const specsSummary = [
        `Sleeve: ${sleeves.find(s => s.code === selectedSleeve)?.name || selectedSleeve}${sleeveNote ? ` (${sleeveNote})` : ""}`,
        `Neckline: ${necks.find(n => n.code === selectedNeck)?.name || selectedNeck}${neckNote ? ` (${neckNote})` : ""}`,
        `Hemline: ${lengths.find(l => l.code === selectedLength)?.name || selectedLength}${lengthNote ? ` (${lengthNote})` : ""}`,
        `Fabric: ${fabrics.find(f => f.code === selectedFabric)?.name || selectedFabric}${fabricNote ? ` (${fabricNote})` : ""}`,
        `Color: ${colors.find(c => c.code === selectedColor)?.name || selectedColor}${colorNote ? ` (${colorNote})` : ""}`,
        selectedImage ? "Custom Inspiration Image Selected" : ""
      ].filter(Boolean).join(" | ");

      const finalName = parentProduct 
        ? `Bespoke Customized ${parentProduct.name}`
        : `Bespoke Custom Atelier Dress`;

      const payload = {
        items: [{
          product: parentProduct?.id || 1,
          size: orderSize,
          quantity: 1,
          custom_measurements: {
            sleeve: selectedSleeve,
            sleeve_note: sleeveNote,
            neck: selectedNeck,
            neck_note: neckNote,
            length: selectedLength,
            length_note: lengthNote,
            fabric: selectedFabric,
            fabric_note: fabricNote,
            color: selectedColor,
            color_note: colorNote,
            inspiration_image: selectedImage,
            sizing: orderSize,
            customer_measurements: orderMeasurements,
            summary: `${finalName} - Specs: ${specsSummary}`
          }
        }]
      };

      await fetchApi("/orders/", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert("Couture Atelier reservation order directly placed!");
      setShowOrderModal(false);
      router.push("/profile");
    } catch (err: any) {
      alert(err.message || "Failed to place order reservation. Please try again.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleDeleteDesign = (id: number) => {
    const updated = myDesigns.filter(d => d.id !== id);
    setMyDesigns(updated);
    localStorage.setItem("casa_amora_saved_designs", JSON.stringify(updated));
  };

  const getAiTip = () => {
    if (selectedSleeve === "puff" && selectedNeck === "vneck") {
      return "Puff Sleeves add romantic volume, beautifully balanced by a V-Neckline ✨";
    }
    if (selectedSleeve === "sleeveless" && selectedNeck === "square") {
      return "Sleeveless square neck styles look modern and highlight the collarbone beautifully ✨";
    }
    if (selectedSleeve === "balloon" && selectedLength === "short") {
      return "Pairing dramatic Balloon Sleeves with a shorter hemline keeps the look light and playful ✨";
    }
    if (selectedFabric === "silk" && selectedColor === "rose") {
      return "Premium Silk reflects light beautifully, enhancing the soft tones of Blush Rose ✨";
    }
    return "This custom silhouette is perfectly balanced for a feminine, luxury fit ✨";
  };

  const activeColorHex = colors.find(c => c.code === selectedColor)?.description || "#E8C5C8";

  if (loading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32">
        <p className="text-slate-400/60 tracking-[2.5px] text-xs uppercase animate-pulse font-serif">
          Synchronizing Atelier Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-28 pb-24 px-6 md:px-12 text-[#3B2F2F]">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#3B2F2F]/65 hover:text-[#D8A7B1] transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-[#3B2F2F]">Atelier Custom Studio</h1>
          {parentProduct && (
            <p className="text-xs text-[#D8A7B1] mt-1 font-light tracking-wider">
              Customizing: <strong className="font-semibold">{parentProduct.name}</strong>
            </p>
          )}
        </div>
        
        {/* Top Control Options: Closet, Add to Cart, Direct Order Now */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={handleSaveDesign} className="btn-secondary py-3 text-xs flex items-center gap-2">
            <Heart size={14} /> Save Design
          </button>
          <button onClick={handleAddToCart} className="btn-secondary py-3 text-xs flex items-center gap-2">
            <ShoppingBag size={14} /> Add to Cart
          </button>
          <button onClick={handleOrderNowClick} className="btn-primary py-3 text-xs flex items-center gap-2">
            <Sparkles size={14} /> Order Now
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Interactive SVG Preview + Product/Inspiration image selector (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Dress Live Preview */}
          <div className="bg-white/60 border border-[#D6B370]/20 rounded-3xl p-8 flex flex-col justify-center items-center shadow-lg relative h-[480px]">
            <span className="absolute top-4 left-4 text-[10px] uppercase tracking-wider text-slate-400 font-semibold bg-white/80 px-3 py-1 rounded-full luxury-border">
              Live Preview
            </span>

            {/* Interactive Dynamic SVG Dress Visualizer */}
            <div className="w-56 h-80 relative flex justify-center items-center">
              <svg 
                viewBox="0 0 200 300" 
                className="w-full h-full drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={activeColorHex} />
                    <stop offset="100%" stopColor={selectedColor === "cream" ? "#EADBC8" : `${activeColorHex}dd`} />
                  </linearGradient>
                </defs>

                {/* DRESS SKIRT / LENGTH */}
                {selectedLength === "short" && (
                  <path 
                    d="M60 140 L140 140 L155 200 L45 200 Z" 
                    fill="url(#dressGrad)" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}
                {selectedLength === "midi" && (
                  <path 
                    d="M60 140 L140 140 L165 240 L35 240 Z" 
                    fill="url(#dressGrad)" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}
                {selectedLength === "maxi" && (
                  <path 
                    d="M60 140 L140 140 L175 285 L25 285 Z" 
                    fill="url(#dressGrad)" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}

                {/* DRESS BODICE / TORSO */}
                <path 
                  d="M60 70 L140 70 L140 140 L60 140 Z" 
                  fill="url(#dressGrad)" 
                  stroke="#3B2F2F" 
                  strokeWidth="1.5" 
                />

                {/* NECK DESIGN CUTOUT */}
                {selectedNeck === "round" && (
                  <path 
                    d="M80 70 Q100 95 120 70 Z" 
                    fill="#FAF7F2" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}
                {selectedNeck === "vneck" && (
                  <path 
                    d="M80 70 L100 98 L120 70 Z" 
                    fill="#FAF7F2" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}
                {selectedNeck === "square" && (
                  <path 
                    d="M80 70 L80 92 L120 92 L120 70 Z" 
                    fill="#FAF7F2" 
                    stroke="#3B2F2F" 
                    strokeWidth="1.5" 
                  />
                )}

                {/* SLEEVE TYPE */}
                {selectedSleeve === "puff" && (
                  <>
                    <path d="M42 68 Q50 50 60 70 Q55 85 45 80 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                    <path d="M158 68 Q150 50 140 70 Q145 85 155 80 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                  </>
                )}
                {selectedSleeve === "full" && (
                  <>
                    <path d="M60 70 L40 150 L50 152 L60 85 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                    <path d="M140 70 L160 150 L150 152 L140 85 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                  </>
                )}
                {selectedSleeve === "balloon" && (
                  <>
                    <path d="M60 70 Q30 110 42 145 L50 145 Q42 110 60 85 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                    <path d="M140 70 Q170 110 158 145 L150 145 Q158 110 140 85 Z" fill="url(#dressGrad)" stroke="#3B2F2F" strokeWidth="1.5" />
                  </>
                )}
                {selectedSleeve === "sleeveless" && (
                  <>
                    <line x1="68" y1="70" x2="68" y2="55" stroke="#3B2F2F" strokeWidth="2" />
                    <line x1="132" y1="70" x2="132" y2="55" stroke="#3B2F2F" strokeWidth="2" />
                  </>
                )}

                {/* Waist Band */}
                <line x1="60" y1="140" x2="140" y2="140" stroke="#3B2F2F" strokeWidth="3" />
              </svg>
            </div>

            {/* AI Helper match tag */}
            <div className="mt-4 px-4 py-2 bg-[#FAF7F2] rounded-full border border-[#D8A7B1]/30 flex items-center gap-2 max-w-sm text-center">
              <Sparkles size={12} className="text-[#D8A7B1] shrink-0" />
              <p className="text-[10px] text-slate-500 font-light leading-relaxed select-none">{getAiTip()}</p>
            </div>
          </div>

          {/* Conditional Product display vs Inspiration upload */}
          {parentProduct ? (
            // Show parent product details card (no price)
            <div className="bg-[#F3E9DC]/60 border border-[#D6B370]/20 rounded-3xl p-5 flex items-center gap-4 shadow-sm animate-fadeIn">
              <div className="relative w-20 h-24 rounded-2xl overflow-hidden border border-[#D6B370]/15 bg-white shrink-0 shadow-2xs">
                <img 
                  src={parentProduct.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600"} 
                  alt={parentProduct.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#D8A7B1] font-bold block">Active base layout</span>
                <h3 className="font-serif text-base font-semibold text-[#3B2F2F]">{parentProduct.name}</h3>
                <p className="text-[10px] text-slate-500 font-light line-clamp-2 leading-relaxed">{parentProduct.description}</p>
              </div>
            </div>
          ) : (
            // Show inspiration upload option
            <div className="bg-[#FAF7F2] border border-[#D6B370]/20 rounded-3xl p-5 space-y-3 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Inspiration Reference</span>
              
              {selectedImage ? (
                <div className="flex items-center justify-between gap-4 bg-white/50 border border-[#D6B370]/15 rounded-2xl p-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden border border-[#D6B370]/15 bg-white shrink-0 shadow-2xs">
                      <img src={selectedImage} alt="Inspiration preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#3B2F2F]">Custom Reference Selected</p>
                      <p className="text-[9px] text-slate-400 font-light mt-0.5">Will be saved to atelier file</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    aria-label="Remove Image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-[#D6B370]/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer bg-white/35 hover:bg-white/70 hover:border-[#D8A7B1]/40 transition-colors">
                  <Upload size={20} className="text-[#D8A7B1] mb-2" />
                  <span className="text-xs font-serif font-semibold text-[#3B2F2F]">Upload Reference Image</span>
                  <span className="text-[9px] text-slate-400 font-light mt-1 max-w-[200px]">Send design sketch or outfit screenshot to our tailors</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Options Controls (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customizer panels */}
          <div className="space-y-8 bg-white/40 border border-[#D6B370]/20 rounded-3xl p-8 shadow-sm">
            
            {/* Color Palette */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#3B2F2F]/60 font-semibold">Select Color Shade</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="flex items-center gap-3 flex-wrap">
                  {colors.map((color) => (
                    <button 
                      key={color.id || color.code}
                      onClick={() => setSelectedColor(color.code)}
                      className={`w-9 h-9 rounded-full border shadow-2xs relative flex items-center justify-center transition-all ${
                        selectedColor === color.code ? "scale-110 border-[#3B2F2F] ring-2 ring-[#D8A7B1]/35" : "border-[#D6B370]/30 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.description || "#E8C5C8" }}
                      aria-label={`Color shade ${color.name}`}
                    >
                      {selectedColor === color.code && (
                        <Check size={14} className={color.code === "cream" ? "text-slate-800" : "text-white"} />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={colorNote}
                    onChange={(e) => setColorNote(e.target.value)}
                    placeholder="Custom color note (e.g. Hot Pink, Lilac tone)"
                    className="w-full px-4 py-2.5 text-xs border border-[#D6B370]/20 bg-white/50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Neck Design */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#3B2F2F]/60 font-semibold">Neckline Configuration</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="grid grid-cols-3 gap-2 w-full sm:w-[60%]">
                  {necks.map((n) => (
                    <button 
                      key={n.id || n.code}
                      onClick={() => setSelectedNeck(n.code)}
                      className={`py-3 text-xs tracking-wider border rounded-xl transition-all cursor-pointer ${
                        selectedNeck === n.code 
                          ? "border-[#D8A7B1] bg-[#D8A7B1] text-white font-medium shadow-xs" 
                          : "border-[#D6B370]/30 text-[#3B2F2F] bg-white/40 hover:bg-white/90"
                      }`}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={neckNote}
                    onChange={(e) => setNeckNote(e.target.value)}
                    placeholder="Custom neckline specifications..."
                    className="w-full px-4 py-3 text-xs border border-[#D6B370]/20 bg-white/50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Sleeve Type */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#3B2F2F]/60 font-semibold">Sleeve Cut</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-[60%]">
                  {sleeves.map((s) => (
                    <button 
                      key={s.id || s.code}
                      onClick={() => setSelectedSleeve(s.code)}
                      className={`py-3 text-xs tracking-wider border rounded-xl transition-all cursor-pointer ${
                        selectedSleeve === s.code 
                          ? "border-[#D8A7B1] bg-[#D8A7B1] text-white font-medium shadow-xs" 
                          : "border-[#D6B370]/30 text-[#3B2F2F] bg-white/40 hover:bg-white/90"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={sleeveNote}
                    onChange={(e) => setSleeveNote(e.target.value)}
                    placeholder="Custom sleeve requirements (e.g. 3/4 length, cuff detail)..."
                    className="w-full px-4 py-3 text-xs border border-[#D6B370]/20 bg-white/50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Dress Length */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#3B2F2F]/60 font-semibold">Hemline Length</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="grid grid-cols-3 gap-2 w-full sm:w-[60%]">
                  {lengths.map((l) => (
                    <button 
                      key={l.id || l.code}
                      onClick={() => setSelectedLength(l.code)}
                      className={`py-3 text-xs tracking-wider border rounded-xl transition-all cursor-pointer ${
                        selectedLength === l.code 
                          ? "border-[#D8A7B1] bg-[#D8A7B1] text-white font-medium shadow-xs" 
                          : "border-[#D6B370]/30 text-[#3B2F2F] bg-white/40 hover:bg-white/90"
                      }`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={lengthNote}
                    onChange={(e) => setLengthNote(e.target.value)}
                    placeholder="Custom length specs (e.g. 110cm, tea-length)..."
                    className="w-full px-4 py-3 text-xs border border-[#D6B370]/20 bg-white/50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Fabric Material */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#3B2F2F]/60 font-semibold">Luxury Fabric</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                <div className="grid grid-cols-2 gap-2 w-full sm:w-[60%]">
                  {fabrics.map((f) => (
                    <button 
                      key={f.id || f.code}
                      onClick={() => setSelectedFabric(f.code)}
                      className={`p-3 border rounded-xl transition-all text-left flex flex-col justify-center cursor-pointer ${
                        selectedFabric === f.code 
                          ? "border-[#D8A7B1] bg-[#D8A7B1] text-white shadow-xs" 
                          : "border-[#D6B370]/30 text-[#3B2F2F] bg-white/40 hover:bg-white/90"
                      }`}
                    >
                      <span className="text-xs font-semibold">{f.name}</span>
                      <span className={`text-[9px] ${selectedFabric === f.code ? "text-white/70" : "text-slate-500"} font-light mt-0.5`}>
                        {f.description}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={fabricNote}
                    onChange={(e) => setFabricNote(e.target.value)}
                    placeholder="Custom fabric notes (e.g. Mulberry Silk, lace linings)..."
                    className="w-full px-4 py-3 text-xs border border-[#D6B370]/20 bg-white/50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all shadow-2xs placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Direct Order Sizing Selection Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#D6B370]/30 w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-[#3B2F2F]"
            >
              <div className="flex justify-between items-center border-b border-[#D6B370]/15 pb-4">
                <h3 className="font-serif text-lg font-semibold flex items-center gap-2 text-[#3B2F2F]">
                  <Sparkles size={18} className="text-[#D8A7B1]" /> Couture Reservation
                </h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-slate-400 hover:text-slate-700 transition-all p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Sizing choice */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atelier Fitting Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["XS", "S", "M", "L", "XL", "Custom"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setOrderSize(size)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                          orderSize === size 
                            ? "bg-[#D8A7B1] border-[#D8A7B1] text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Measurements input */}
                <div className="space-y-1.5">
                  <label htmlFor="measurements" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sizing Measurements / Fit Comments
                  </label>
                  <textarea
                    id="measurements"
                    value={orderMeasurements}
                    onChange={(e) => setOrderMeasurements(e.target.value)}
                    rows={3}
                    placeholder={
                      orderSize === "Custom" 
                        ? "Submit bust, shoulder, hip, height or sleeve length (e.g. Bust: 34', Shoulder: 15')..." 
                        : "Add comments for the tailoring team (e.g. standard M with extra length)..."
                    }
                    className="w-full p-3 border border-slate-200 text-xs bg-slate-50 text-[#3B2F2F] rounded-xl outline-none focus:border-[#D8A7B1] transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                <div className="bg-[#FAF7F2] border border-[#D6B370]/15 rounded-2xl p-4 text-[10px] text-slate-500 font-light leading-relaxed">
                  📢 **Direct Atelier Booking**: You are initiating a tailoring order slot. We will contact you on WhatsApp to verify specifications before finalizing your sewing slot.
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="btn-secondary flex-1 py-3 text-xs"
                >
                  Modify Style
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrderDirect}
                  disabled={submittingOrder}
                  className="btn-primary flex-1 py-3 text-xs flex justify-center items-center gap-1.5"
                >
                  {submittingOrder ? "Confirming..." : "Submit Reservation"}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Designs Gallery */}
      {myDesigns.length > 0 && (
        <div className="max-w-7xl mx-auto mt-24 border-t border-[#D6B370]/20 pt-16">
          <h2 className="font-serif text-2xl text-[#3B2F2F] mb-8">My Custom Studio Closet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myDesigns.map((design) => (
              <div key={design.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Saved: {design.date}</span>
                    <span className="px-2 py-0.5 bg-[#D8A7B1]/10 text-[#D8A7B1] rounded-full uppercase tracking-wider font-semibold">Custom</span>
                  </div>
                  
                  {/* If the saved design has an inspiration or parent image */}
                  {(design.inspirationImage || design.parentProductImage) && (
                    <div className="relative aspect-[4/3] w-full rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img 
                        src={design.inspirationImage || design.parentProductImage} 
                        alt="Saved Reference" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  <h4 className="font-serif text-base text-[#3B2F2F] capitalize">
                    {design.parentName ? `Custom ${design.parentName}` : `${design.fabric} ${lengths.find(l => l.code === design.length)?.name || design.length}`}
                  </h4>
                  <ul className="text-[10px] text-slate-500 space-y-1 font-light pl-1 capitalize">
                    <li>• Neck: {design.neck} {design.neckNote && <span className="text-[#D8A7B1] font-normal">({design.neckNote})</span>}</li>
                    <li>• Sleeve: {design.sleeve} {design.sleeveNote && <span className="text-[#D8A7B1] font-normal">({design.sleeveNote})</span>}</li>
                    <li>• Shade: {design.color} {design.colorNote && <span className="text-[#D8A7B1] font-normal">({design.colorNote})</span>}</li>
                    <li>• Fabric: {design.fabric} {design.fabricNote && <span className="text-[#D8A7B1] font-normal">({design.fabricNote})</span>}</li>
                  </ul>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#D6B370]/10">
                  <span className="text-xs font-semibold text-[#D6B370] uppercase tracking-wider flex items-center gap-1">
                    <Clipboard size={12} /> Custom Fit
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setSelectedSleeve(design.sleeve);
                        setSelectedNeck(design.neck);
                        setSelectedLength(design.length);
                        setSelectedFabric(design.fabric);
                        setSelectedColor(design.color);
                        setSleeveNote(design.sleeveNote || "");
                        setNeckNote(design.neckNote || "");
                        setLengthNote(design.lengthNote || "");
                        setFabricNote(design.fabricNote || "");
                        setColorNote(design.colorNote || "");
                        setSelectedImage(design.inspirationImage || null);
                      }}
                      className="text-[10px] font-semibold text-[#3B2F2F] hover:text-[#D8A7B1] underline cursor-pointer"
                    >
                      Load
                    </button>
                    <button 
                      onClick={() => handleDeleteDesign(design.id)}
                      className="text-[10px] font-semibold text-red-500 hover:text-red-700 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={
      <div className="bg-[#FAF7F2] min-h-screen flex items-center justify-center pt-32">
        <p className="text-slate-400/60 tracking-[2.5px] text-xs uppercase animate-pulse font-serif">
          Initializing Atelier Studio...
        </p>
      </div>
    }>
      <CustomizerContent />
    </Suspense>
  );
}
