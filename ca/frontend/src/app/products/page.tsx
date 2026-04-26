"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SidebarFilter from "@/components/products/SidebarFilter";
import ProductCard from "@/components/products/ProductCard";
import { fetchApi } from "@/lib/api";

function ProductsList() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("category"); // e.g. "1" for Women, "2" for Kids

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // Load category param from URL
  useEffect(() => {
    if (catParam === "1") {
      setSelectedCategory("all");
    } else if (catParam === "2") {
      setSelectedCategory("all");
    }
  }, [catParam]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let url = "/products/";
        if (catParam) {
          url += `?category=${catParam}`;
        }
        const data = await fetchApi(url);
        
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: item.category_name || "Couture",
          image: item.images && item.images.length > 0 ? item.images[0].image_url : "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983",
          badge: item.in_stock ? "" : "Custom Only",
          created_at: item.created_at,
          description: item.description || ""
        }));
        
        setProducts(formatted);
        setFilteredProducts(formatted);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [catParam]);

  // Apply filters and sorting dynamically
  useEffect(() => {
    let result = [...products];

    // 1. Search Filter
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Price Filter
    if (priceRange !== "all") {
      if (priceRange === "under1000") {
        result = result.filter((p) => p.price < 1000);
      } else if (priceRange === "1000to3000") {
        result = result.filter((p) => p.price >= 1000 && p.price <= 3000);
      } else if (priceRange === "3000to5000") {
        result = result.filter((p) => p.price >= 3000 && p.price <= 5000);
      } else if (priceRange === "above5000") {
        result = result.filter((p) => p.price > 5000);
      }
    }

    // 4. Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "priceLow") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [search, selectedCategory, priceRange, sortBy, products]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
      {/* Sidebar Filters */}
      <div className="w-full md:w-[260px] shrink-0">
        <SidebarFilter
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Product Cards Grid */}
      <div className="flex-grow">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-dark-950/80 animate-pulse border border-dark-800" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 space-y-4 border border-dark-800 luxury-glow">
            <p className="font-serif text-lg text-white/60">No Outfits Found</p>
            <p className="text-xs text-white/30 max-w-xs mx-auto leading-relaxed">
              We couldn't find any designs matching your filter combinations. Try resetting filters.
            </p>
            <button
              className="btn-secondary text-[0.7rem] px-6 py-2.5"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setPriceRange("all");
                setSortBy("recommended");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="bg-dark-900 min-h-screen pt-32 pb-24 px-6 md:px-12">
      {/* Catalog Header */}
      <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
        <span className="text-xs uppercase tracking-[4px] text-gold-500 font-semibold">Atelier Collections</span>
        <h1 className="font-serif text-4xl md:text-6xl text-white tracking-wide">All Designs</h1>
        <p className="text-sm text-white/50 max-w-xl mx-auto font-light leading-relaxed">
          Browse our selection of ready-to-order couture. Use standard sizing or request tailor-made fits.
        </p>
        <div className="w-12 h-[1px] bg-gold-500/20 mx-auto mt-4" />
      </div>

      <Suspense fallback={
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-white/30 text-xs tracking-[2.5px] uppercase animate-pulse">Loading collections...</p>
        </div>
      }>
        <ProductsList />
      </Suspense>
    </div>
  );
}
