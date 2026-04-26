"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import Image from "next/image";
import { 
  X, Plus, Check, Trash2, FolderPlus, RefreshCw, 
  ShoppingBag, Shirt, FolderOpen, Image as ImageIcon, User, LogOut,
  ShieldCheck, BarChart3, Settings, ShieldAlert, KeyRound, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "orders" | "products" | "categories" | "diaries" | "staff_mgmt" | "analytics" | "settings" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("analytics");

  // Staff User Information
  const [staffInfo, setStaffInfo] = useState<any>(null);

  // Global lists
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [diaries, setDiaries] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Loadings
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals / Details
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Forms states
  // 1. Add Product Form
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodMaterial, setProdMaterial] = useState("");
  const [prodWashing, setProdWashing] = useState("");
  const [prodImages, setProdImages] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Add Category Form
  const [catName, setCatName] = useState("");

  // 3. Register Staff Form
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffWhatsApp, setStaffWhatsApp] = useState("");
  const [staffIsSuper, setStaffIsSuper] = useState(false);

  // 4. Settings Form
  const [settingsBrand, setSettingsBrand] = useState("Casa Amora");
  const [settingsName, setSettingsName] = useState("Salman");
  const [settingsPhone, setSettingsPhone] = useState("7356198300");

  // Check auth status on mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("casa_amora_token");
      if (!token) {
        router.push("/dashboard/login");
        return;
      }
      try {
        const profile = await fetchApi("/auth/me/");
        if (profile.is_staff) {
          setStaffInfo(profile);
          setIsReady(true);
          loadAllData();
        } else {
          localStorage.removeItem("casa_amora_token");
          router.push("/dashboard/login");
        }
      } catch (err) {
        localStorage.removeItem("casa_amora_token");
        router.push("/dashboard/login");
      }
    };
    verifyUser();
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, categoriesData, diariesData, staffData, logsData, analyticsData] = await Promise.all([
        fetchApi("/orders/"),
        fetchApi("/products/"),
        fetchApi("/categories/"),
        fetchApi("/diaries/"),
        fetchApi("/staff/").catch(() => []),
        fetchApi("/logs/").catch(() => []),
        fetchApi("/analytics/").catch(() => null)
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setDiaries(diariesData);
      setStaffList(staffData);
      setActivityLogs(logsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Add Product Submission
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodCategory) {
      alert("Please select a category");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("casa_amora_token");
      const formData = new FormData();
      formData.append("name", prodName);
      formData.append("price", prodPrice);
      formData.append("category", prodCategory);
      formData.append("description", prodDesc);
      formData.append("material", prodMaterial);
      formData.append("washing_instructions", prodWashing);
      formData.append("in_stock", "true");

      if (prodImages) {
        for (let i = 0; i < prodImages.length; i++) {
          formData.append("images", prodImages[i]);
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/products/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to add product");
      }

      const newProduct = await response.json();
      setProducts([newProduct, ...products]);

      // Reset form
      setProdName("");
      setProdPrice("");
      setProdCategory("");
      setProdDesc("");
      setProdMaterial("");
      setProdWashing("");
      setProdImages(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Product added successfully!");
      loadAllData(); // reload log activity feed
    } catch (err: any) {
      alert(err.message || "Failed to add product");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Add Category Submission
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newCat = await fetchApi("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: catName })
      });
      setCategories([...categories, newCat]);
      setCatName("");
      alert("Category created successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Update Order Status
  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await fetchApi(`/orders/${orderId}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      loadAllData(); // reload stats/logs
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // 4. Approve Client Diary
  const handleApproveDiary = async (diaryId: number) => {
    try {
      await fetchApi(`/diaries/${diaryId}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_approved: true })
      });
      setDiaries(diaries.map(d => d.id === diaryId ? { ...d, is_approved: true } : d));
      alert("Diary entry approved!");
      loadAllData();
    } catch (err) {
      alert("Failed to approve diary entry.");
    }
  };

  // 5. Delete/Reject Client Diary
  const handleRejectDiary = async (diaryId: number) => {
    if (!confirm("Are you sure you want to reject and delete this diary entry?")) return;
    try {
      await fetchApi(`/diaries/${diaryId}/`, {
        method: "DELETE"
      });
      setDiaries(diaries.filter(d => d.id !== diaryId));
      alert("Diary entry deleted.");
      loadAllData();
    } catch (err) {
      alert("Failed to delete diary entry.");
    }
  };

  // 6. Create Staff Account
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        username: staffUsername,
        password: staffPassword,
        name: staffName,
        phone_number: staffPhone,
        whatsapp_number: staffWhatsApp,
        is_superuser: staffIsSuper
      };
      const newStaff = await fetchApi("/staff/", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setStaffList([newStaff, ...staffList]);
      setStaffUsername("");
      setStaffPassword("");
      setStaffName("");
      setStaffPhone("");
      setStaffWhatsApp("");
      setStaffIsSuper(false);
      alert("Staff account registered successfully!");
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to create staff account.");
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Toggle Staff Status
  const handleToggleStaffActive = async (staffId: number, currentActive: boolean) => {
    try {
      const updated = await fetchApi(`/staff/${staffId}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentActive })
      });
      setStaffList(staffList.map(s => s.id === staffId ? updated : s));
      alert(`Staff account ${!currentActive ? 'activated' : 'deactivated'} successfully.`);
      loadAllData();
    } catch (err) {
      alert("Failed to toggle staff active state.");
    }
  };

  // 8. Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("casa_amora_settings_brand", settingsBrand);
    localStorage.setItem("casa_amora_settings_name", settingsName);
    localStorage.setItem("casa_amora_settings_phone", settingsPhone);
    alert("Atelier details saved successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem("casa_amora_token");
    localStorage.removeItem("casa_amora_user");
    router.push("/dashboard/login");
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <p className="text-white/40 tracking-[2px] text-xs uppercase animate-pulse">Authenticating staff session...</p>
      </div>
    );
  }

  // Fallback calculation for metrics
  const totalRevenueVal = analytics?.metrics?.total_revenue || orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrdersVal = analytics?.metrics?.total_orders || orders.length;
  const totalProductsVal = analytics?.metrics?.total_products || products.length;
  const unapprovedDiariesCount = diaries.filter(d => !d.is_approved).length;

  return (
    <div className="flex min-h-screen bg-dark-900 text-white font-sans">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-[280px] bg-dark-950 border-r border-dark-800 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          <div className="space-y-1">
            <span className="text-[0.65rem] uppercase tracking-[4px] text-gold-500 font-semibold">Atelier ERP</span>
            <h2 className="font-serif text-lg tracking-[2px] text-white">CASA AMORA</h2>
          </div>

          <nav className="flex flex-col space-y-1">
            {[
              { id: "analytics", label: "Analytics Overview", icon: <BarChart3 size={16} /> },
              { id: "orders", label: "Client Orders", icon: <ShoppingBag size={16} /> },
              { id: "products", label: "Product Catalog", icon: <Shirt size={16} /> },
              { id: "categories", label: "Manage Categories", icon: <FolderOpen size={16} /> },
              { id: "diaries", label: "Client Diaries", icon: <ImageIcon size={16} /> },
              { id: "staff_mgmt", label: "Staff Management", icon: <ShieldCheck size={16} /> },
              { id: "settings", label: "Atelier Settings", icon: <Settings size={16} /> },
              { id: "profile", label: "My Profile", icon: <User size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all ${
                  activeTab === tab.id 
                    ? "bg-gold-500 text-dark-900 font-semibold" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-xs font-semibold text-gold-500">
              {staffInfo.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-xs font-semibold text-white">{staffInfo.name || staffInfo.username}</p>
              <p className="text-[0.6rem] text-white/40 tracking-[1px] uppercase">
                {staffInfo.is_superuser ? "Superadmin" : "Atelier Staff"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-white/40 hover:text-red-400 transition-colors p-2"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-grow p-10 overflow-y-auto max-w-7xl">
        
        {/* HEADER SECTION */}
        <header className="flex justify-between items-center mb-8 border-b border-dark-800 pb-6">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl tracking-wide text-white capitalize">{activeTab.replace("_", " ")}</h1>
            <p className="text-xs text-white/50 font-light">Casa Amora Luxury Atelier Management Command Panel</p>
          </div>
          <button 
            onClick={loadAllData} 
            className="p-3 border border-white/10 hover:border-gold-500 text-white/50 hover:text-white transition-all bg-dark-950 flex items-center gap-2 text-xs uppercase tracking-[1px]"
          >
            <RefreshCw size={12} /> Sync Data
          </button>
        </header>

        {/* Loading overlay if sync is occurring */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-white/30 text-xs tracking-[2px] uppercase animate-pulse">Loading Atelier workspace data...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            
            {/* 1. TAB CONTENT: ANALYTICS OVERVIEW */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Analytics Metrics cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", val: `₹${totalRevenueVal.toLocaleString("en-IN")}`, desc: "From completed bookings" },
                    { label: "Client Orders", val: totalOrdersVal, desc: "Pending & fulfilled custom slots" },
                    { label: "Active Products", val: totalProductsVal, desc: "Couture designs in catalog" },
                    { label: "Unapproved Diaries", val: unapprovedDiariesCount, desc: "Pending lookbook entries" }
                  ].map((metric, i) => (
                    <div key={i} className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-2">
                      <p className="text-xs text-white/40 uppercase tracking-[1.5px]">{metric.label}</p>
                      <h3 className="text-3xl font-serif font-medium text-gold-500">{metric.val}</h3>
                      <p className="text-[0.65rem] text-white/30">{metric.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Custom SVG Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Sales trend line chart */}
                  <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-4">
                    <h3 className="font-serif text-base tracking-wide text-white">7-Day Sales Trend</h3>
                    <div className="aspect-[16/9] w-full flex items-center justify-center">
                      {analytics?.chart_data ? (
                        <svg className="w-full h-full" viewBox="0 0 500 250">
                          {/* Grid lines */}
                          <line x1="40" y1="30" x2="480" y2="30" stroke="#1f1f1f" strokeWidth="1" />
                          <line x1="40" y1="80" x2="480" y2="80" stroke="#1f1f1f" strokeWidth="1" />
                          <line x1="40" y1="130" x2="480" y2="130" stroke="#1f1f1f" strokeWidth="1" />
                          <line x1="40" y1="180" x2="480" y2="180" stroke="#1f1f1f" strokeWidth="1" />
                          <line x1="40" y1="210" x2="480" y2="210" stroke="#3f3f3f" strokeWidth="1.5" />

                          {/* Data points projection */}
                          {(() => {
                            const data = analytics.chart_data;
                            const maxVal = Math.max(...data.map((d: any) => d.sales), 5000);
                            const points = data.map((d: any, idx: number) => {
                              const x = 40 + idx * 70;
                              const y = 210 - (d.sales / maxVal) * 160;
                              return { x, y, val: d.sales, label: d.date };
                            });
                            
                            const pathD = points.reduce((acc: string, p: any, idx: number) => {
                              return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                            }, "");

                            return (
                              <>
                                {/* Area fill */}
                                <path
                                  d={`${pathD} L ${points[points.length - 1].x} 210 L ${points[0].x} 210 Z`}
                                  fill="url(#goldGradientArea)"
                                  opacity="0.1"
                                />
                                {/* Trend Line */}
                                <path d={pathD} fill="none" stroke="#c5a880" strokeWidth="2.5" />
                                
                                {/* Points & values */}
                                {points.map((p: any, idx: number) => (
                                  <g key={idx}>
                                    <circle cx={p.x} cy={p.y} r="4" fill="#050505" stroke="#c5a880" strokeWidth="2" />
                                    <text x={p.x} y={p.y - 10} fill="#c5a880" fontSize="8" textAnchor="middle" fontWeight="bold">
                                      ₹{Math.round(p.val)}
                                    </text>
                                    <text x={p.x} y="230" fill="#a3a3a3" fontSize="8" textAnchor="middle">
                                      {p.label}
                                    </text>
                                  </g>
                                ))}
                              </>
                            );
                          })()}
                          <defs>
                            <linearGradient id="goldGradientArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#c5a880" />
                              <stop offset="100%" stopColor="#050505" />
                            </linearGradient>
                          </defs>
                        </svg>
                      ) : (
                        <p className="text-white/30 text-xs">No trend chart data loaded.</p>
                      )}
                    </div>
                  </div>

                  {/* Category distributions bar chart */}
                  <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-4">
                    <h3 className="font-serif text-base tracking-wide text-white">Sales by Category</h3>
                    <div className="aspect-[16/9] w-full flex items-center justify-center">
                      {analytics?.category_revenue ? (
                        <svg className="w-full h-full" viewBox="0 0 500 250">
                          {(() => {
                            const data = Object.entries(analytics.category_revenue);
                            const maxVal = Math.max(...data.map(([, val]: any) => val), 1000);
                            
                            return (
                              <>
                                <line x1="40" y1="30" x2="480" y2="30" stroke="#1f1f1f" strokeWidth="1" />
                                <line x1="40" y1="115" x2="480" y2="115" stroke="#1f1f1f" strokeWidth="1" />
                                <line x1="40" y1="200" x2="480" y2="200" stroke="#3f3f3f" strokeWidth="1.5" />

                                {data.map(([catName, val]: any, idx: number) => {
                                  const width = 45;
                                  const spacing = 60;
                                  const x = 60 + idx * (width + spacing);
                                  const height = (val / maxVal) * 160;
                                  const y = 200 - height;
                                  return (
                                    <g key={catName}>
                                      {/* Bar */}
                                      <rect
                                        x={x}
                                        y={y}
                                        width={width}
                                        height={height}
                                        fill="#aa885a"
                                        opacity="0.8"
                                      />
                                      {/* Hover border */}
                                      <rect
                                        x={x}
                                        y={y}
                                        width={width}
                                        height={height}
                                        fill="none"
                                        stroke="#c5a880"
                                        strokeWidth="1.5"
                                        className="hover:opacity-100 transition-opacity"
                                      />
                                      <text x={x + width / 2} y={y - 8} fill="#c5a880" fontSize="9" textAnchor="middle" fontWeight="semibold">
                                        ₹{Math.round(val).toLocaleString()}
                                      </text>
                                      <text x={x + width / 2} y="220" fill="#a3a3a3" fontSize="9" textAnchor="middle">
                                        {catName}
                                      </text>
                                    </g>
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      ) : (
                        <p className="text-white/30 text-xs">No category revenue data loaded.</p>
                      )}
                    </div>
                  </div>

                  {/* Donut chart for status */}
                  <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-4">
                    <h3 className="font-serif text-base tracking-wide text-white">Order Status Distribution</h3>
                    <div className="aspect-[16/9] w-full flex flex-col md:flex-row items-center justify-around">
                      {analytics?.status_distribution ? (
                        <>
                          <svg width="150" height="150" viewBox="0 0 100 100">
                            {(() => {
                              const stats = analytics.status_distribution;
                              const total = Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number;
                              
                              let currentOffset = 0;
                              const segments = Object.entries(stats).map(([status, count]: any) => {
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const strokeDash = `${percentage} ${100 - percentage}`;
                                const dashOffset = 100 - currentOffset + 25; // start from top (90deg)
                                currentOffset += percentage;
                                
                                let color = "#e8dbb0"; // Pending
                                if (status === "Processing") color = "#3b82f6";
                                if (status === "Shipped") color = "#10b981";
                                if (status === "Delivered") color = "#14b8a6";
                                if (status === "Cancelled") color = "#ef4444";

                                return { strokeDash, dashOffset, color, status };
                              });

                              return (
                                <>
                                  {segments.map((seg, i) => (
                                    <circle
                                      key={i}
                                      cx="50"
                                      cy="50"
                                      r="15.915"
                                      fill="transparent"
                                      stroke={seg.color}
                                      strokeWidth="8"
                                      strokeDasharray={seg.strokeDash}
                                      strokeDashoffset={seg.dashOffset}
                                    />
                                  ))}
                                  {/* Center circle */}
                                  <circle cx="50" cy="50" r="10" fill="#050505" />
                                  <text x="50" y="52" fill="#fff" fontSize="5" textAnchor="middle" fontWeight="bold">
                                    {total}
                                  </text>
                                </>
                              );
                            })()}
                          </svg>
                          
                          {/* Color indicators */}
                          <div className="space-y-2 mt-4 md:mt-0">
                            {Object.entries(analytics.status_distribution).map(([status, count]: any) => {
                              let bg = "bg-gold-400";
                              if (status === "Processing") bg = "bg-blue-500";
                              if (status === "Shipped") bg = "bg-emerald-500";
                              if (status === "Delivered") bg = "bg-teal-500";
                              if (status === "Cancelled") bg = "bg-red-500";
                              return (
                                <div key={status} className="flex items-center space-x-3 text-xs">
                                  <div className={`h-3 w-3 rounded-full ${bg}`} />
                                  <span className="text-white/60 font-light w-20">{status}</span>
                                  <span className="font-semibold text-white">{count} ({Math.round((count / totalOrdersVal) * 100)}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-white/30 text-xs">No status distributions.</p>
                      )}
                    </div>
                  </div>

                  {/* Audit trail activity log feed */}
                  <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-4">
                    <h3 className="font-serif text-base tracking-wide text-white">Recent Atelier Activity Logs</h3>
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {activityLogs.length === 0 ? (
                        <p className="text-xs text-white/30 py-8 text-center">No system actions registered yet.</p>
                      ) : (
                        activityLogs.slice(0, 8).map((log) => (
                          <div key={log.id} className="text-xs border-b border-dark-800 pb-3 flex justify-between items-start space-x-4">
                            <div className="space-y-1">
                              <span className="text-gold-500 font-semibold uppercase tracking-[1px]">{log.action}</span>
                              <p className="text-white/70 font-light">{log.details}</p>
                              <span className="text-[0.6rem] text-white/30 block">Actor: @{log.user_name}</span>
                            </div>
                            <span className="text-[0.6rem] text-white/40 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2. TAB CONTENT: ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-lg tracking-wide">Client Stitching Orders</h2>
                </div>

                <div className="overflow-x-auto">
                  {orders.length === 0 ? (
                    <p className="text-center py-16 text-xs text-white/30 font-light">No client orders logged at this atelier.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-dark-800 uppercase tracking-[1px] text-white/40">
                          <th className="pb-4">Order ID</th>
                          <th className="pb-4">Client Name</th>
                          <th className="pb-4">Contact Phone</th>
                          <th className="pb-4">Reservation Date</th>
                          <th className="pb-4">Slot Amount</th>
                          <th className="pb-4">Stitching Status</th>
                          <th className="pb-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-800/60">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/2 transition-colors">
                            <td className="py-4">#{order.id}</td>
                            <td className="py-4 font-medium text-white">{order.user_name}</td>
                            <td className="py-4">{order.user_phone}</td>
                            <td className="py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-gold-500 font-semibold">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[0.65rem] uppercase font-bold tracking-[1px] ${
                                order.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                order.status === "Processing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                order.status === "Shipped" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-gold-500 hover:text-gold-600 font-semibold cursor-pointer"
                              >
                                View Details & Sizes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* 3. TAB CONTENT: PRODUCT CATALOG */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to publish a design */}
                <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow h-fit space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Publish Atelier Outfit</h2>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Design Name</label>
                      <input 
                        type="text" 
                        value={prodName} 
                        onChange={(e) => setProdName(e.target.value)} 
                        required 
                        placeholder="e.g. Velvet Maxi Dress"
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Price (₹)</label>
                      <input 
                        type="number" 
                        value={prodPrice} 
                        onChange={(e) => setProdPrice(e.target.value)} 
                        required 
                        placeholder="e.g. 3499"
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Design Category</label>
                      <select 
                        value={prodCategory} 
                        onChange={(e) => setProdCategory(e.target.value)} 
                        required
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Material & Embroidery Details</label>
                      <input 
                        type="text" 
                        value={prodMaterial} 
                        onChange={(e) => setProdMaterial(e.target.value)} 
                        placeholder="e.g. Premium Silk and Velvet"
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Washing & Care</label>
                      <input 
                        type="text" 
                        value={prodWashing} 
                        onChange={(e) => setProdWashing(e.target.value)} 
                        placeholder="e.g. Dry Clean Only"
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Description</label>
                      <textarea 
                        value={prodDesc} 
                        onChange={(e) => setProdDesc(e.target.value)} 
                        placeholder="Fit parameters, patterns, custom designs..."
                        rows={3}
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Upload Design Images</label>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={(e) => setProdImages(e.target.files)}
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs text-white/50 outline-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs"
                    >
                      <Plus size={16} /> {actionLoading ? "Saving outfit..." : "Publish Design"}
                    </button>
                  </form>
                </div>

                {/* Products List */}
                <div className="lg:col-span-2 bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Atelier Catalog ({products.length} Items)</h2>
                  
                  <div className="overflow-x-auto">
                    {products.length === 0 ? (
                      <p className="text-center py-16 text-xs text-white/30">No outfits registered.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-dark-800 uppercase tracking-[1px] text-white/40">
                            <th className="pb-4">Thumbnail</th>
                            <th className="pb-4">Design Name</th>
                            <th className="pb-4">Category</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800/60">
                          {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-3">
                                <div className="relative h-12 w-10 overflow-hidden bg-dark-900 border border-white/5">
                                  <Image 
                                    src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983"} 
                                    alt={prod.name} 
                                    fill 
                                    className="object-cover" 
                                  />
                                </div>
                              </td>
                              <td className="py-3 font-medium text-white">{prod.name}</td>
                              <td className="py-3">{prod.category_name}</td>
                              <td className="py-3 text-gold-500 font-semibold">₹{parseFloat(prod.price).toLocaleString("en-IN")}</td>
                              <td className="py-3">
                                <span className={`font-semibold ${prod.in_stock ? "text-emerald-400" : "text-amber-400"}`}>
                                  {prod.in_stock ? "Active" : "Disabled"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 4. TAB CONTENT: MANAGE CATEGORIES */}
            {activeTab === "categories" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to create a category */}
                <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow h-fit space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Add Design Category</h2>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Category Name</label>
                      <input 
                        type="text" 
                        value={catName} 
                        onChange={(e) => setCatName(e.target.value)} 
                        required 
                        placeholder="e.g. Maxi Dresses"
                        className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs"
                    >
                      <FolderPlus size={16} /> {actionLoading ? "Registering..." : "Add Category"}
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Design Segments ({categories.length} Categories)</h2>
                  
                  <div className="overflow-x-auto">
                    {categories.length === 0 ? (
                      <p className="text-center py-16 text-xs text-white/30">No categories found.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-dark-800 uppercase tracking-[1px] text-white/40">
                            <th className="pb-4">Category ID</th>
                            <th className="pb-4">Segment Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800/60">
                          {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-4">#{cat.id}</td>
                              <td className="py-4 font-semibold text-white">{cat.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 5. TAB CONTENT: CLIENT DIARIES */}
            {activeTab === "diaries" && (
              <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-6">
                <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Client Lookbook & Testimonials</h2>

                {diaries.length === 0 ? (
                  <p className="text-center py-16 text-xs text-white/30">No lookbook diaries registered.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {diaries.map((diary) => (
                      <div key={diary.id} className="bg-dark-900 border border-dark-800/60 p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{diary.user_name}</h4>
                            <p className="text-[0.65rem] text-white/40">Product: {diary.product_name}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[0.6rem] uppercase tracking-[1px] font-bold ${
                            diary.is_approved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {diary.is_approved ? "Approved" : "Pending Review"}
                          </span>
                        </div>

                        <p className="text-xs text-white/70 italic leading-relaxed">"{diary.review_text}"</p>

                        <div className="flex space-x-3 pt-2">
                          {!diary.is_approved && (
                            <button 
                              onClick={() => handleApproveDiary(diary.id)}
                              className="px-3 py-1.5 bg-emerald-500 text-dark-900 text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleRejectDiary(diary.id)}
                            className="px-3 py-1.5 border border-white/10 hover:border-red-500 hover:text-red-400 text-white/60 text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. TAB CONTENT: STAFF MANAGEMENT */}
            {activeTab === "staff_mgmt" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to create staff - only for superusers */}
                <div className="bg-dark-950 p-6 border border-dark-800 luxury-glow h-fit relative space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Register Staff Account</h2>
                  
                  {staffInfo.is_superuser ? (
                    <form onSubmit={handleCreateStaff} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Username</label>
                        <input 
                          type="text" 
                          value={staffUsername} 
                          onChange={(e) => setStaffUsername(e.target.value)} 
                          required 
                          placeholder="e.g. anut"
                          className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Password</label>
                        <input 
                          type="password" 
                          value={staffPassword} 
                          onChange={(e) => setStaffPassword(e.target.value)} 
                          required 
                          placeholder="••••••••"
                          className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Display Name</label>
                        <input 
                          type="text" 
                          value={staffName} 
                          onChange={(e) => setStaffName(e.target.value)} 
                          required 
                          placeholder="e.g. Anu Thomas"
                          className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">Phone Number</label>
                        <input 
                          type="text" 
                          value={staffPhone} 
                          onChange={(e) => setStaffPhone(e.target.value)} 
                          placeholder="e.g. 9876543201"
                          className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-white/50">WhatsApp Number</label>
                        <input 
                          type="text" 
                          value={staffWhatsApp} 
                          onChange={(e) => setStaffWhatsApp(e.target.value)} 
                          placeholder="e.g. 9876543201"
                          className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                        />
                      </div>

                      <label className="flex items-center space-x-3 text-xs cursor-pointer pt-2">
                        <input 
                          type="checkbox" 
                          checked={staffIsSuper} 
                          onChange={(e) => setStaffIsSuper(e.target.checked)} 
                          className="accent-gold-500 h-4 w-4"
                        />
                        <span className="text-white/70 font-light">Grant Superadmin Privileges</span>
                      </label>

                      <button 
                        type="submit" 
                        disabled={actionLoading}
                        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs"
                      >
                        <Plus size={16} /> {actionLoading ? "Registering..." : "Create Account"}
                      </button>
                    </form>
                  ) : (
                    <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 space-y-4 z-10">
                      <ShieldAlert size={40} className="text-amber-500" />
                      <h4 className="font-serif text-base text-white">Privilege Required</h4>
                      <p className="text-xs text-white/50 max-w-[200px] leading-relaxed">
                        Only Superadmins can register new staff accounts or modify permissions.
                      </p>
                    </div>
                  )}
                </div>

                {/* Staff Accounts List */}
                <div className="lg:col-span-2 bg-dark-950 p-6 border border-dark-800 luxury-glow space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Staff Registry ({staffList.length} Accounts)</h2>
                  
                  <div className="overflow-x-auto">
                    {staffList.length === 0 ? (
                      <p className="text-center py-16 text-xs text-white/30">No staff members registered.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-dark-800 uppercase tracking-[1px] text-white/40">
                            <th className="pb-4">Name</th>
                            <th className="pb-4">Username</th>
                            <th className="pb-4">Role</th>
                            <th className="pb-4">Status</th>
                            {staffInfo.is_superuser && <th className="pb-4">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800/60">
                          {staffList.map((staff) => (
                            <tr key={staff.id} className="hover:bg-white/2 transition-colors">
                              <td className="py-4 font-semibold text-white">{staff.name || "Atelier Staff"}</td>
                              <td className="py-4">@{staff.username}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-[0.6rem] font-bold ${
                                  staff.is_superuser ? "text-gold-500 bg-gold-500/10 border border-gold-500/20" : "text-white/60 bg-white/5 border border-white/10"
                                }`}>
                                  {staff.is_superuser ? "Superadmin" : "Staff"}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`font-semibold ${staff.is_active ? "text-emerald-400" : "text-red-400"}`}>
                                  {staff.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              {staffInfo.is_superuser && (
                                <td className="py-4">
                                  <button
                                    onClick={() => handleToggleStaffActive(staff.id, staff.is_active)}
                                    className={`text-[0.65rem] uppercase font-bold tracking-[0.5px] cursor-pointer ${
                                      staff.is_active ? "text-red-400 hover:text-red-500" : "text-emerald-400 hover:text-emerald-500"
                                    }`}
                                  >
                                    {staff.is_active ? "Deactivate" : "Activate"}
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 7. TAB CONTENT: ATELIER SETTINGS */}
            {activeTab === "settings" && (
              <div className="max-w-2xl bg-dark-950 p-8 border border-dark-800 luxury-glow space-y-6">
                <h2 className="font-serif text-lg tracking-wide border-b border-dark-800 pb-4">Atelier Contact Configurations</h2>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div className="space-y-1">
                    <label className="text-[0.65rem] uppercase tracking-[1.5px] text-white/50">Brand Name</label>
                    <input 
                      type="text" 
                      value={settingsBrand} 
                      onChange={(e) => setSettingsBrand(e.target.value)} 
                      required
                      className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[0.65rem] uppercase tracking-[1.5px] text-white/50">Atelier Supervisor / Owner</label>
                    <input 
                      type="text" 
                      value={settingsName} 
                      onChange={(e) => setSettingsName(e.target.value)} 
                      required
                      className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[0.65rem] uppercase tracking-[1.5px] text-white/50">WhatsApp Contact Number (No leading zeros/plus)</label>
                    <input 
                      type="text" 
                      value={settingsPhone} 
                      onChange={(e) => setSettingsPhone(e.target.value)} 
                      required
                      className="w-full bg-dark-900 border border-white/10 p-3 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                    />
                  </div>

                  <button type="submit" className="btn-primary py-3.5 px-8 text-xs uppercase tracking-[2px]">
                    Save Atelier Settings
                  </button>

                </form>
              </div>
            )}

            {/* 8. TAB CONTENT: STAFF PROFILE */}
            {activeTab === "profile" && staffInfo && (
              <div className="max-w-xl bg-dark-950 p-8 border border-dark-800 luxury-glow space-y-6 text-center">
                <div className="relative h-20 w-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl font-bold text-gold-500 mx-auto">
                  {staffInfo.username.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl text-white">{staffInfo.name || staffInfo.first_name || "N/A"}</h2>
                  <p className="text-xs text-gold-500 uppercase tracking-[2px]">
                    {staffInfo.is_superuser ? "Superadmin" : "Atelier Staff Member"}
                  </p>
                </div>

                <div className="border-t border-b border-dark-800 py-6 text-left text-xs font-light text-white/70 space-y-4">
                  <div className="flex justify-between">
                    <span>Atelier Username</span>
                    <span className="text-white font-medium">@{staffInfo.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Status</span>
                    <span className="text-emerald-400 font-medium">Authorized</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Line</span>
                    <span className="text-white font-medium">{staffInfo.phone_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp Line</span>
                    <span className="text-white font-medium">{staffInfo.whatsapp_number || "N/A"}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-red-500/20 hover:bg-red-500/5 text-red-400 uppercase tracking-[2px] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Sign Out of Atelier Panel
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* DETAILED ORDER OVERLAY DIALOG */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-dark-950 border border-dark-800 p-8 space-y-6 overflow-y-auto max-h-[90vh] luxury-glow text-white"
            >
              
              <div className="flex justify-between items-center border-b border-dark-800 pb-4">
                <h3 className="font-serif text-xl tracking-wide">Client Order Details #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-white/40 hover:text-white" aria-label="Close modal">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 text-xs font-light text-white/70">
                <div className="grid grid-cols-2 gap-4 bg-dark-900 p-4 border border-dark-800/60">
                  <div>
                    <span className="text-white/40 block mb-1">CLIENT NAME</span>
                    <p className="text-white font-medium text-sm">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">CONTACT PHONE</span>
                    <p className="text-white font-medium text-sm">{selectedOrder.user_phone}</p>
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">ORDER RESERVATION DATE</span>
                    <p className="text-white font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40 block">STITCHING STATUS</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}
                      className="bg-dark-950 border border-white/10 p-2 text-xs outline-none text-white focus:border-gold-500 transition-colors"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Items grid */}
                <div className="space-y-3">
                  <h4 className="font-serif text-sm text-white border-b border-dark-800 pb-2">Ordered Outfits</h4>
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start py-3 border-b border-dark-800/40">
                      <div>
                        <h5 className="font-medium text-white text-sm">{item.product_name}</h5>
                        <p className="text-white/40 pt-1">Size requested: <strong className="text-gold-500">{item.size}</strong> | Qty: {item.quantity}</p>
                        
                        {item.size === "Custom" && (
                          <div className="mt-3 p-3 bg-gold-500/5 border border-gold-500/20 text-gold-400 leading-relaxed font-light">
                            <strong>Custom Stitching Request:</strong>
                            <p className="pt-1">Customer selected tailor custom measurements. Contact Salman / Client directly at {selectedOrder.user_phone} to record shoulder, bust, waist, and length measurements.</p>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-white">₹{(parseFloat(item.product_price) * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-semibold text-white pt-4">
                  <span>Slot Total Amount</span>
                  <span className="text-gold-500 text-lg">₹{parseFloat(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
