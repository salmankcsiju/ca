"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import Image from "next/image";
import { 
  X, Plus, Check, Trash2, FolderPlus, RefreshCw, 
  ShoppingBag, Shirt, FolderOpen, Image as ImageIcon, User, LogOut,
  ShieldCheck, BarChart3, Settings, ShieldAlert, KeyRound, Calendar,
  Users, MessageCircle, ChevronLeft, ChevronRight, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isNewOrder = (createdAt: string) => {
  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - orderDate.getTime());
  const diffHours = diffTime / (1000 * 60 * 60);
  return diffHours <= 24;
};


type TabType = "orders" | "products" | "categories" | "diaries" | "staff_mgmt" | "analytics" | "settings" | "profile" | "customers" | "chats";

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
  const [customers, setCustomers] = useState<any[]>([]);

  // Support Chats State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedChatCustomerId, setSelectedChatCustomerId] = useState<number | null>(null);
  const [chatReplyInput, setChatReplyInput] = useState("");
  const [sendingChatReply, setSendingChatReply] = useState(false);

  // Loadings
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals / Details
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // To-Do Notepad State
  const [todos, setTodos] = useState<any[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const [todoDetails, setTodoDetails] = useState("");
  const [todoPriority, setTodoPriority] = useState<"low" | "medium" | "high">("medium");
  const [todoCategory, setTodoCategory] = useState<"tailoring" | "fabric" | "delivery" | "general">("general");
  const [todoFilter, setTodoFilter] = useState<string>("All");

  // Calendar Widget State
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);

  // Custom Stitching Dates & Notes
  const [stitchingDates, setStitchingDates] = useState<Record<number, string>>({});
  const [stitchingNotes, setStitchingNotes] = useState<Record<number, string>>({});
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const savedTodos = localStorage.getItem("casa_amora_staff_todo");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        console.error("Failed to parse todos", e);
      }
    }
    const savedStitchingDates = localStorage.getItem("casa_amora_stitching_dates");
    if (savedStitchingDates) {
      try {
        setStitchingDates(JSON.parse(savedStitchingDates));
      } catch (e) {
        console.error("Failed to parse stitching dates", e);
      }
    }
    const savedStitchingNotes = localStorage.getItem("casa_amora_stitching_notes");
    if (savedStitchingNotes) {
      try {
        setStitchingNotes(JSON.parse(savedStitchingNotes));
      } catch (e) {
        console.error("Failed to parse stitching notes", e);
      }
    }
  }, []);

  const saveTodos = (updatedTodos: any[]) => {
    setTodos(updatedTodos);
    localStorage.setItem("casa_amora_staff_todo", JSON.stringify(updatedTodos));
  };

  const saveStitchingDate = (orderId: number, dateStr: string) => {
    const updated = { ...stitchingDates, [orderId]: dateStr };
    setStitchingDates(updated);
    localStorage.setItem("casa_amora_stitching_dates", JSON.stringify(updated));
  };

  const saveStitchingNote = (orderId: number, noteStr: string) => {
    const updated = { ...stitchingNotes, [orderId]: noteStr };
    setStitchingNotes(updated);
    localStorage.setItem("casa_amora_stitching_notes", JSON.stringify(updated));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: todoInput.trim(),
      details: todoDetails.trim(),
      priority: todoPriority,
      category: todoCategory,
      completed: false
    };
    saveTodos([...todos, newTodo]);
    setTodoInput("");
    setTodoDetails("");
    setTodoPriority("medium");
    setTodoCategory("general");
  };

  const handleToggleTodo = (id: number) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: number) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
    setSelectedCalDate(null);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
    setSelectedCalDate(null);
  };

  const getOrdersScheduledForDate = (dateStr: string) => {
    return orders.filter(order => {
      const scheduledDate = stitchingDates[order.id];
      if (scheduledDate) {
        return scheduledDate === dateStr;
      }
      const orderDate = new Date(order.created_at);
      const y = orderDate.getFullYear();
      const m = orderDate.getMonth();
      const d = orderDate.getDate();
      const formattedOrderDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return formattedOrderDate === dateStr;
    });
  };

  const getNotificationsList = () => {
    const list: any[] = [];
    
    // 1. New Orders in last 24h
    orders.filter(o => isNewOrder(o.created_at)).forEach(o => {
      list.push({
        id: `order-new-${o.id}`,
        type: "order-new",
        title: "New Stitching Order Received",
        message: `Order #${o.id} for ${o.user_name} (₹${parseFloat(o.total_amount).toLocaleString("en-IN")}) is waiting for verification.`,
        data: o,
        timestamp: o.created_at
      });
    });

    // 2. Pending lookbook reviews
    diaries.filter(d => !d.is_approved).forEach(d => {
      list.push({
        id: `diary-${d.id}`,
        type: "diary-pending",
        title: "Lookbook Review Awaiting Approval",
        message: `Lookbook review by ${d.user_name} for ${d.product_name} needs moderation.`,
        data: d,
        timestamp: d.created_at
      });
    });

    // 3. Stitching deadlines in 4 days or overdue
    orders.forEach(o => {
      if (o.status === "Delivered" || o.status === "Cancelled" || o.status === "Shipped") return;
      
      const sDateStr = stitchingDates[o.id];
      if (!sDateStr) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const targetDate = new Date(sDateStr);
      targetDate.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 4) {
        list.push({
          id: `deadline-${o.id}`,
          type: "deadline-soon",
          title: `Stitching Deadline: ${diffDays === 0 ? "TODAY" : `In ${diffDays} Days`}`,
          message: `Order #${o.id} (${o.user_name}) is scheduled for ${sDateStr}. Start sewing process.`,
          data: o,
          timestamp: sDateStr
        });
      } else if (diffDays < 0) {
        list.push({
          id: `deadline-overdue-${o.id}`,
          type: "deadline-overdue",
          title: "⚠️ Overdue Stitching Alert",
          message: `Order #${o.id} (${o.user_name}) was scheduled for ${sDateStr} (${Math.abs(diffDays)} days ago) but is not shipped.`,
          data: o,
          timestamp: sDateStr
        });
      }
    });

    return list;
  };


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
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsAddress, setSettingsAddress] = useState("");
  const [settingsHelpline, setSettingsHelpline] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsHours, setSettingsHours] = useState("");

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

  // Poll chat messages for dashboard if active tab is chats
  useEffect(() => {
    if (activeTab !== "chats" || !isReady) return;

    const pollChats = async () => {
      try {
        const chatsData = await fetchApi("/messages/");
        setChatMessages(chatsData);
      } catch (err) {
        console.error("Failed to poll chat messages", err);
      }
    };

    const interval = setInterval(pollChats, 4000);
    return () => clearInterval(interval);
  }, [activeTab, isReady]);

  // Group chatMessages by customer
  const getConversations = () => {
    const groups: Record<number, { customerName: string; customerUsername: string; phone: string; latestMsg: any; unreadCount: number }> = {};
    
    const sorted = [...chatMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sorted.forEach((msg) => {
      const custId = msg.customer;
      
      let cName = msg.sender_name || "Customer";
      let cUsername = msg.sender_username || "guest";
      
      const customerObj = customers.find(c => c.id === custId);
      let phone = "";
      if (customerObj) {
        cName = customerObj.name || customerObj.username;
        cUsername = customerObj.username;
        phone = customerObj.phone_number;
      } else {
        phone = msg.sender_username || "";
      }

      if (!groups[custId]) {
        groups[custId] = {
          customerName: cName,
          customerUsername: cUsername,
          phone: phone,
          latestMsg: msg,
          unreadCount: 0
        };
      } else {
        groups[custId].latestMsg = msg;
        if (customerObj) {
          groups[custId].customerName = cName;
          groups[custId].customerUsername = cUsername;
          groups[custId].phone = phone;
        }
      }

      if (!msg.is_staff_sender && !msg.is_read) {
        groups[custId].unreadCount += 1;
      }
    });

    return Object.entries(groups).map(([id, info]) => ({
      customerId: parseInt(id),
      ...info
    })).sort((a, b) => new Date(b.latestMsg.timestamp).getTime() - new Date(a.latestMsg.timestamp).getTime());
  };

  const handleSelectChatCustomer = async (customerId: number) => {
    setSelectedChatCustomerId(customerId);
    
    try {
      await fetchApi("/messages/mark_read/", {
        method: "POST",
        body: JSON.stringify({ customer: customerId })
      });
      
      setChatMessages(prev => prev.map(msg => {
        if (msg.customer === customerId && !msg.is_staff_sender) {
          return { ...msg, is_read: true };
        }
        return msg;
      }));
    } catch (err) {
      console.error("Error marking messages as read", err);
    }
  };

  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyInput.trim() || !selectedChatCustomerId || sendingChatReply) return;

    const text = chatReplyInput.trim();
    setChatReplyInput("");
    setSendingChatReply(true);

    try {
      const response = await fetchApi("/messages/", {
        method: "POST",
        body: JSON.stringify({
          customer: selectedChatCustomerId,
          message: text
        })
      });
      setChatMessages(prev => [...prev, response]);
    } catch (err: any) {
      alert(err.message || "Failed to send reply");
    } finally {
      setSendingChatReply(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ordersData, productsData, categoriesData, diariesData, staffData, logsData, analyticsData, customersData, chatsData, settingsData] = await Promise.all([
        fetchApi("/orders/"),
        fetchApi("/products/"),
        fetchApi("/categories/"),
        fetchApi("/diaries/"),
        fetchApi("/staff/").catch(() => []),
        fetchApi("/logs/").catch(() => []),
        fetchApi("/analytics/").catch(() => null),
        fetchApi("/customers/").catch(() => []),
        fetchApi("/messages/").catch(() => []),
        fetchApi("/settings/").catch(() => [])
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCategories(categoriesData);
      setDiaries(diariesData);
      setStaffList(staffData);
      setActivityLogs(logsData);
      setAnalytics(analyticsData);
      setCustomers(customersData);
      setChatMessages(chatsData);

      if (settingsData && settingsData.length > 0) {
        const brand = settingsData.find((s: any) => s.key === "brand_name")?.value;
        if (brand) setSettingsBrand(brand);
        
        const desc = settingsData.find((s: any) => s.key === "description")?.value;
        if (desc) setSettingsDescription(desc);
        
        const addr = settingsData.find((s: any) => s.key === "address")?.value;
        if (addr) setSettingsAddress(addr);
        
        const phone = settingsData.find((s: any) => s.key === "helpline")?.value;
        if (phone) setSettingsHelpline(phone);
        
        const mail = settingsData.find((s: any) => s.key === "email")?.value;
        if (mail) setSettingsEmail(mail);
        
        const hrs = settingsData.find((s: any) => s.key === "hours")?.value;
        if (hrs) setSettingsHours(hrs);
        
        const wa = settingsData.find((s: any) => s.key === "whatsapp")?.value;
        if (wa) setSettingsPhone(wa);
      }
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

      const response = await fetch(`${API_BASE_URL}/products/`, {
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
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi("/settings/update_batch/", {
        method: "POST",
        body: JSON.stringify({
          brand_name: settingsBrand,
          description: settingsDescription,
          address: settingsAddress,
          helpline: settingsHelpline,
          email: settingsEmail,
          hours: settingsHours,
          whatsapp: settingsPhone
        })
      });
      localStorage.setItem("casa_amora_settings_brand", settingsBrand);
      localStorage.setItem("casa_amora_settings_name", settingsName);
      localStorage.setItem("casa_amora_settings_phone", settingsPhone);
      alert("Atelier details saved successfully!");
      loadAllData();
    } catch (err: any) {
      alert("Failed to save atelier settings: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("casa_amora_token");
    localStorage.removeItem("casa_amora_user");
    router.push("/dashboard/login");
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-[#6B5A5B] tracking-[2px] text-xs uppercase animate-pulse">Authenticating staff session...</p>
      </div>
    );
  }

  // Fallback calculation for metrics
  const totalRevenueVal = analytics?.metrics?.total_revenue || orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrdersVal = analytics?.metrics?.total_orders || orders.length;
  const totalProductsVal = analytics?.metrics?.total_products || products.length;
  const unapprovedDiariesCount = diaries.filter(d => !d.is_approved).length;
  const newOrdersCount = orders.filter(order => isNewOrder(order.created_at)).length;
  const unreadChatsCount = chatMessages.filter(msg => !msg.is_staff_sender && !msg.is_read).length;


  return (
    <div className="flex h-screen bg-[#FAF8F5] text-[#3A2A2B] font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR PANEL */}
      <aside className="w-[280px] h-full bg-[#F3EDE2] border-r border-[#E5DAC6] flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div className="space-y-1">
            <span className="text-[0.65rem] uppercase tracking-[4px] text-[#A8854A] font-semibold">Atelier ERP</span>
            <h2 className="font-serif text-lg tracking-[2px] text-[#722F37] font-semibold">CASA AMORA</h2>
          </div>

          <nav className="flex flex-col space-y-1">
            {[
              { id: "analytics", label: "Analytics Overview", icon: <BarChart3 size={16} /> },
              { id: "orders", label: "Client Orders", icon: <ShoppingBag size={16} />, badge: newOrdersCount > 0 ? (
                <span className="ml-auto px-2 py-0.5 text-[0.65rem] font-bold bg-[#722F37] text-white rounded-full animate-bounce">
                  {newOrdersCount}
                </span>
              ) : null },
              { id: "customers", label: "Customers", icon: <Users size={16} /> },
              { id: "chats", label: "Support Chats", icon: <MessageCircle size={16} />, badge: unreadChatsCount > 0 ? (
                <span className="ml-auto px-2 py-0.5 text-[0.65rem] font-bold bg-[#722F37] text-white rounded-full">
                  {unreadChatsCount}
                </span>
              ) : null },
              { id: "products", label: "Product Catalog", icon: <Shirt size={16} /> },
              { id: "categories", label: "Manage Categories", icon: <FolderOpen size={16} /> },
              { id: "diaries", label: "Client Diaries", icon: <ImageIcon size={16} />, badge: unapprovedDiariesCount > 0 ? (
                <span className="ml-auto px-2 py-0.5 text-[0.65rem] font-bold bg-[#A8854A] text-white rounded-full">
                  {unapprovedDiariesCount}
                </span>
              ) : null },
              { id: "staff_mgmt", label: "Staff Management", icon: <ShieldCheck size={16} /> },
              { id: "settings", label: "Atelier Settings", icon: <Settings size={16} /> },
              { id: "profile", label: "My Profile", icon: <User size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-[#722F37] text-white font-semibold shadow-xs" 
                    : "text-[#5C4A4B] hover:text-[#2C1A1B] hover:bg-[#E5DAC6]/45"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-[#E5DAC6] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#722F37]/10 border border-[#722F37]/25 flex items-center justify-center text-xs font-semibold text-[#722F37]">
              {staffInfo.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate max-w-[120px]">
              <p className="text-xs font-semibold text-[#2C1A1B]">{staffInfo.name || staffInfo.username}</p>
              <p className="text-[0.6rem] text-[#6B5A5B] tracking-[1px] uppercase">
                {staffInfo.is_superuser ? "Superadmin" : "Atelier Staff"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[#6B5A5B] hover:text-red-600 transition-colors p-2 cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-grow h-full p-10 overflow-y-auto max-w-7xl">
        
        {/* HEADER SECTION */}
        <header className="flex justify-between items-center mb-8 border-b border-[#E5DAC6] pb-6">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl tracking-wide text-[#2C1A1B] capitalize">{activeTab.replace("_", " ")}</h1>
            <p className="text-xs text-[#6B5A5B] font-light">Casa Amora Luxury Atelier Management Command Panel</p>
          </div>
          <div className="flex items-center gap-4 relative">
            
            <button
              onClick={() => router.push("/dashboard/live-orders")}
              className="px-4 py-2.5 bg-[#722F37] text-white hover:bg-[#592228] text-xs font-bold uppercase tracking-[1.5px] rounded-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Bell size={13} className="animate-pulse" /> Live Orders Board
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 border border-[#E5DAC6] hover:border-[#722F37] text-[#6B5A5B] hover:text-[#722F37] transition-all bg-[#F3EDE2] rounded-xs flex items-center justify-center cursor-pointer relative"
                aria-label="Toggle notifications"
              >
                <Bell size={16} />
                {getNotificationsList().length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#FAF8F5]">
                    {getNotificationsList().length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-[#FCFAF7] border border-[#EBE2D5] shadow-lg rounded-xs z-50 p-4 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center border-b border-[#E5DAC6] pb-2">
                      <span className="font-serif font-semibold text-[#2C1A1B]">Atelier Notifications</span>
                      <button 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-[10px] text-[#6B5A5B] hover:underline cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {getNotificationsList().length === 0 ? (
                        <p className="text-center text-[#6B5A5B] italic py-6">No new notifications.</p>
                      ) : (
                        getNotificationsList().map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              if (notif.type === "order-new" || notif.type === "deadline-soon" || notif.type === "deadline-overdue") {
                                setSelectedOrder(notif.data);
                              } else if (notif.type === "diary-pending") {
                                setActiveTab("diaries");
                              }
                            }}
                            className={`p-2.5 border rounded-xs cursor-pointer transition-colors text-left ${
                              notif.type === "deadline-overdue" 
                                ? "bg-red-500/5 border-red-500/25 hover:bg-red-500/10" 
                                : notif.type === "deadline-soon"
                                  ? "bg-amber-500/5 border-amber-500/25 hover:bg-amber-500/10"
                                  : "bg-[#FAF8F5] border-[#E5DAC6] hover:bg-[#F3EDE2]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-[10px] uppercase ${
                                notif.type === "deadline-overdue" ? "text-red-700" :
                                notif.type === "deadline-soon" ? "text-amber-700" :
                                "text-[#722F37]"
                              }`}>
                                {notif.title}
                              </span>
                            </div>
                            <p className="text-[#3A2A2B] text-[11px] leading-tight font-light">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={loadAllData} 
              className="p-3 border border-[#E5DAC6] hover:border-[#722F37] text-[#6B5A5B] hover:text-[#722F37] transition-all bg-[#F3EDE2] flex items-center gap-2 text-xs uppercase tracking-[1px] cursor-pointer"
            >
              <RefreshCw size={12} /> Sync Data
            </button>
          </div>
        </header>

        {/* Loading overlay if sync is occurring */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-[#6B5A5B]/80 text-xs tracking-[2px] uppercase animate-pulse">Loading Atelier workspace data...</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            
            {/* 1. TAB CONTENT: ANALYTICS OVERVIEW */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                
                {/* Stitching Deadlines Alert Banner */}
                {(() => {
                  const deadlineAlerts = getNotificationsList().filter(n => n.type === "deadline-soon" || n.type === "deadline-overdue");
                  if (deadlineAlerts.length === 0) return null;
                  return (
                    <div className="space-y-2">
                      {deadlineAlerts.map((alert) => {
                        const isOverdue = alert.type === "deadline-overdue";
                        return (
                          <div 
                            key={alert.id}
                            className={`p-4 border flex items-center justify-between text-xs rounded-xs shadow-xs transition-colors ${
                              isOverdue 
                                ? "bg-red-50 text-red-800 border-red-200" 
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-white border">
                                {isOverdue ? "⚠️ Overdue" : "⏰ Alert"}
                              </span>
                              <p className="font-medium text-[#2C1A1B]">
                                {alert.message}
                              </p>
                            </div>
                            <button 
                              onClick={() => setSelectedOrder(alert.data)}
                              className="text-[10px] font-bold uppercase tracking-wider text-[#722F37] hover:underline cursor-pointer"
                            >
                              Manage Stitching
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Analytics Metrics cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", val: `₹${totalRevenueVal.toLocaleString("en-IN")}`, desc: "From completed bookings" },
                    { label: "Client Orders", val: totalOrdersVal, desc: "Pending & fulfilled custom slots" },
                    { label: "Active Products", val: totalProductsVal, desc: "Couture designs in catalog" },
                    { label: "Unapproved Diaries", val: unapprovedDiariesCount, desc: "Pending lookbook entries" }
                  ].map((metric, i) => (
                    <div key={i} className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-2">
                      <p className="text-xs text-[#6B5A5B] uppercase tracking-[1.5px] font-semibold">{metric.label}</p>
                      <h3 className="text-3xl font-serif font-medium text-[#722F37]">{metric.val}</h3>
                      <p className="text-[0.65rem] text-[#6B5A5B]/80">{metric.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Custom Interactive Row: Calendar, Alerts & Staff Notepad */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* 1. Interactive Calendar Widget (Takes 2 Columns) */}
                  <div className="lg:col-span-2 bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-[#E5DAC6] pb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-[#722F37]" />
                          <h3 className="font-serif text-base tracking-wide text-[#2C1A1B] font-semibold">Stitching Reservation Calendar</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handlePrevMonth} 
                            className="p-1.5 border border-[#E5DAC6] hover:border-[#722F37] hover:text-[#722F37] rounded-xs transition-colors cursor-pointer"
                            aria-label="Previous month"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-semibold text-[#2C1A1B] w-28 text-center uppercase tracking-wider">
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][calMonth]} {calYear}
                          </span>
                          <button 
                            onClick={handleNextMonth} 
                            className="p-1.5 border border-[#E5DAC6] hover:border-[#722F37] hover:text-[#722F37] rounded-xs transition-colors cursor-pointer"
                            aria-label="Next month"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="mt-6">
                        <div className="grid grid-cols-7 gap-2 text-center text-[0.65rem] font-bold uppercase tracking-wider text-[#6B5A5B] mb-2">
                          <span>Sun</span>
                          <span>Mon</span>
                          <span>Tue</span>
                          <span>Wed</span>
                          <span>Thu</span>
                          <span>Fri</span>
                          <span>Sat</span>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {(() => {
                            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                            const startDay = new Date(calYear, calMonth, 1).getDay();
                            
                            const cells = [];
                            
                            // Padding empty days before the first day of the month
                            for (let i = 0; i < startDay; i++) {
                              cells.push(<div key={`empty-${i}`} className="aspect-square" />);
                            }

                            // Days of the month
                            for (let day = 1; day <= daysInMonth; day++) {
                              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                              const dateOrders = getOrdersScheduledForDate(dateStr);
                              const hasOrders = dateOrders.length > 0;
                              const isSelected = selectedCalDate === dateStr;

                              cells.push(
                                <button
                                  key={`day-${day}`}
                                  onClick={() => setSelectedCalDate(isSelected ? null : dateStr)}
                                  className={`aspect-square relative flex flex-col items-center justify-center text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                                    isSelected 
                                      ? "bg-[#722F37] text-white shadow-xs" 
                                      : hasOrders 
                                        ? "bg-[#A8854A]/10 border border-[#A8854A]/40 text-[#722F37] hover:bg-[#A8854A]/25" 
                                        : "hover:bg-[#F3EDE2] text-[#3A2A2B]"
                                  }`}
                                >
                                  <span>{day}</span>
                                  {hasOrders && !isSelected && (
                                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-[#722F37]" />
                                  )}
                                </button>
                              );
                            }

                            return cells;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Selected Date Reservations details list */}
                    <div className="border-t border-[#E5DAC6] pt-4 mt-6">
                      {selectedCalDate ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-xs text-[#2C1A1B] font-semibold uppercase tracking-wider">
                            <span>Reservations for {new Date(selectedCalDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[#722F37]">{getOrdersScheduledForDate(selectedCalDate).length} Bookings</span>
                          </div>
                          
                          {getOrdersScheduledForDate(selectedCalDate).length > 0 ? (
                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                              {getOrdersScheduledForDate(selectedCalDate).map((order) => (
                                <div key={order.id} className="bg-[#FAF8F5] border border-[#E5DAC6] p-3 rounded-xs space-y-3 text-xs">
                                  <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                      <p className="font-semibold text-[#2C1A1B]">#{order.id} - {order.user_name}</p>
                                      <p className="text-[0.65rem] text-[#6B5A5B]">Total: ₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</p>
                                    </div>
                                    <button 
                                      onClick={() => setSelectedOrder(order)}
                                      className="text-[0.65rem] font-bold uppercase tracking-wider text-[#722F37] hover:underline cursor-pointer"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                  
                                  {/* Stitching Settings */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-[#E5DAC6]/50">
                                    <div className="flex flex-col gap-0.5">
                                      <label className="font-semibold text-[#6B5A5B]">Stitching Status</label>
                                      <select
                                        value={order.status}
                                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                        className="bg-[#FCFAF7] border border-[#E5DAC6] p-1 text-[10px] outline-none text-[#2C1A1B] rounded-xs"
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="font-semibold text-[#6B5A5B]">Stitching Date</label>
                                      <input 
                                        type="date"
                                        value={stitchingDates[order.id] || ""}
                                        onChange={(e) => saveStitchingDate(order.id, e.target.value)}
                                        className="bg-[#FCFAF7] border border-[#E5DAC6] p-0.5 text-[10px] outline-none text-[#2C1A1B] rounded-xs"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-0.5 text-[10px]">
                                    <label className="font-semibold text-[#6B5A5B]">Tailor/Stitching Note</label>
                                    <input 
                                      type="text"
                                      value={stitchingNotes[order.id] || ""}
                                      onChange={(e) => saveStitchingNote(order.id, e.target.value)}
                                      placeholder="Add tailor notes (e.g. Master Babu, 3/4 sleeve)..."
                                      className="w-full bg-[#FCFAF7] border border-[#E5DAC6] p-1 text-[10px] outline-none text-[#3A2A2B] rounded-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#6B5A5B]/70 italic">No stitching slots scheduled on this date.</p>
                          )}

                          {/* Quick Schedule Assigner Dropdown */}
                          <div className="pt-3 border-t border-[#E5DAC6] space-y-1.5 text-xs">
                            <label className="font-semibold text-[#2C1A1B] uppercase tracking-wider block text-[10px]">Schedule Stitching on this Date</label>
                            <div className="flex gap-2">
                              <select 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val) {
                                    saveStitchingDate(parseInt(val), selectedCalDate);
                                    e.target.value = "";
                                  }
                                }}
                                className="flex-grow bg-[#FAF8F5] border border-[#E5DAC6] p-2 text-xs outline-none text-[#3A2A2B] rounded-xs"
                              >
                                <option value="">Select an order to schedule...</option>
                                {orders
                                  .filter(o => o.status !== "Delivered" && o.status !== "Cancelled" && stitchingDates[o.id] !== selectedCalDate)
                                  .map(o => (
                                    <option key={o.id} value={o.id}>
                                      Order #{o.id} - {o.user_name} ({stitchingDates[o.id] ? `Was: ${stitchingDates[o.id]}` : "Unscheduled"})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#6B5A5B]/70 italic flex items-center justify-center py-4 bg-[#FAF8F5] border border-[#E5DAC6]/60 border-dashed">
                          Click a highlighted date on the calendar to inspect or schedule customized stitching slot reservations.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Right Side Column: Alerts & Staff Notepad */}
                  <div className="flex flex-col gap-8">
                    
                    {/* Alerts Panel */}
                    <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#E5DAC6] pb-3">
                        <Bell size={18} className="text-[#722F37]" />
                        <h3 className="font-serif text-base tracking-wide text-[#2C1A1B] font-semibold">Atelier Alerts & Messages</h3>
                      </div>
                      
                      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                        {(() => {
                          const newOrdersList = orders.filter(o => isNewOrder(o.created_at));
                          const pendingDiaries = diaries.filter(d => !d.is_approved);
                          const totalAlerts = newOrdersList.length + pendingDiaries.length;

                          if (totalAlerts === 0) {
                            return <p className="text-xs text-[#6B5A5B]/70 italic py-4 text-center">No new notifications or messages.</p>;
                          }

                          return (
                            <>
                              {newOrdersList.map(o => (
                                <div 
                                  key={`alert-ord-${o.id}`}
                                  onClick={() => setSelectedOrder(o)}
                                  className="bg-gold-500/5 hover:bg-[#F3EDE2] border border-[#C5A880]/30 hover:border-[#722F37]/30 p-2.5 rounded-xs flex items-start gap-2.5 cursor-pointer transition-colors"
                                >
                                  <span className="mt-0.5 px-1 py-0.5 text-[0.5rem] font-bold bg-[#722F37] text-white rounded uppercase tracking-wider animate-pulse">New</span>
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-[#2C1A1B]">Order #{o.id} Received</p>
                                    <p className="text-[0.65rem] text-[#6B5A5B]">{o.user_name} reserved custom slot (₹{parseFloat(o.total_amount).toLocaleString("en-IN")})</p>
                                  </div>
                                </div>
                              ))}

                              {pendingDiaries.map(d => (
                                <div 
                                  key={`alert-diary-${d.id}`}
                                  onClick={() => setActiveTab("diaries")}
                                  className="bg-amber-500/5 hover:bg-[#F3EDE2] border border-amber-500/25 hover:border-[#722F37]/30 p-2.5 rounded-xs flex items-start gap-2.5 cursor-pointer transition-colors"
                                >
                                  <span className="mt-0.5 px-1 py-0.5 text-[0.5rem] font-bold bg-[#A8854A] text-white rounded uppercase tracking-wider">Review</span>
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-[#2C1A1B]">Client Lookbook Entry</p>
                                    <p className="text-[0.65rem] text-[#6B5A5B]">New testimonial from {d.user_name} is awaiting moderation approval.</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Staff To-Do Notepad Widget */}
                    <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Plus size={18} className="text-[#722F37]" />
                            <h3 className="font-serif text-base tracking-wide text-[#2C1A1B] font-semibold">Staff Notepad & Tasks</h3>
                          </div>
                          <span className="text-[0.65rem] bg-[#E5DAC6] text-[#3A2A2B] font-semibold px-2 py-0.5 rounded-full">
                            {todos.filter(t => !t.completed).length} Pending
                          </span>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-1.5 border-b border-[#E5DAC6] pb-2 mb-4 overflow-x-auto text-[10px] font-semibold uppercase tracking-wider">
                          {["All", "Tailoring", "Fabric", "Delivery", "General"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setTodoFilter(cat)}
                              className={`pb-1 px-1 transition-all cursor-pointer ${
                                todoFilter === cat 
                                  ? "border-b-2 border-[#722F37] text-[#722F37]" 
                                  : "text-[#6B5A5B] hover:text-[#3A2A2B]"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Add Task Form */}
                        <form onSubmit={handleAddTodo} className="space-y-2 bg-[#FAF8F5] p-3 border border-[#E5DAC6] rounded-xs mb-4">
                          <input 
                            type="text"
                            value={todoInput}
                            onChange={(e) => setTodoInput(e.target.value)}
                            required
                            placeholder="Add task title (e.g. Cut Velvet fabric)..."
                            className="w-full bg-[#FCFAF7] border border-[#E5DAC6] p-2 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-all rounded-xs font-medium"
                          />
                          <textarea
                            value={todoDetails}
                            onChange={(e) => setTodoDetails(e.target.value)}
                            placeholder="Add details (e.g. 4 meters needed for Maxi)..."
                            rows={1}
                            className="w-full bg-[#FCFAF7] border border-[#E5DAC6] p-2 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-all rounded-xs font-light"
                          />
                          <div className="flex gap-2 text-[10px]">
                            <div className="flex-1 flex flex-col gap-0.5">
                              <label className="font-semibold text-[#6B5A5B]">Priority</label>
                              <select 
                                value={todoPriority}
                                onChange={(e: any) => setTodoPriority(e.target.value)}
                                className="bg-[#FCFAF7] border border-[#E5DAC6] p-1 text-[10px] outline-none text-[#3A2A2B] rounded-xs"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5">
                              <label className="font-semibold text-[#6B5A5B]">Category</label>
                              <select 
                                value={todoCategory}
                                onChange={(e: any) => setTodoCategory(e.target.value)}
                                className="bg-[#FCFAF7] border border-[#E5DAC6] p-1 text-[10px] outline-none text-[#3A2A2B] rounded-xs"
                              >
                                <option value="tailoring">Tailoring</option>
                                <option value="fabric">Fabric</option>
                                <option value="delivery">Delivery</option>
                                <option value="general">General</option>
                              </select>
                            </div>
                            <button 
                              type="submit" 
                              className="bg-[#722F37] hover:bg-[#8B3A43] text-white px-3 py-1 self-end rounded-xs transition-colors cursor-pointer flex items-center justify-center font-bold text-xs"
                            >
                              Add
                            </button>
                          </div>
                        </form>

                        {/* To-Do Checklist items list */}
                        <div className="mt-4 space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                          {(() => {
                            const filtered = todos.filter(t => todoFilter === "All" || (t.category || "general") === todoFilter.toLowerCase());
                            if (filtered.length === 0) {
                              return (
                                <p className="text-xs text-[#6B5A5B]/70 italic py-6 text-center bg-[#FAF8F5] border border-[#E5DAC6]/60 border-dashed">
                                  No {todoFilter === "All" ? "" : todoFilter.toLowerCase()} tasks found.
                                </p>
                              );
                            }
                            return filtered.map((todo) => {
                              const priorityLabel = todo.priority || "medium";
                              const priorityColor = 
                                priorityLabel === "high" ? "bg-red-500/10 text-red-700 border-red-500/25" :
                                priorityLabel === "medium" ? "bg-amber-500/10 text-amber-700 border-amber-500/25" :
                                "bg-slate-500/10 text-slate-700 border-slate-500/25";
                              
                              return (
                                <div key={todo.id} className="p-2.5 bg-[#FAF8F5] border border-[#E5DAC6] rounded-xs hover:border-[#722F37]/35 transition-colors flex flex-col gap-1.5">
                                  <div className="flex items-start justify-between">
                                    <label className="flex items-start gap-2.5 cursor-pointer select-none pr-3 flex-grow">
                                      <input 
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => handleToggleTodo(todo.id)}
                                        className="mt-0.5 accent-[#722F37] h-3.5 w-3.5"
                                      />
                                      <div className="flex flex-col gap-0.5">
                                        <span className={`text-[#3A2A2B] leading-tight break-all font-medium ${todo.completed ? "line-through text-[#6B5A5B]/65 font-light" : ""}`}>
                                          {todo.text}
                                        </span>
                                        {todo.details && (
                                          <p className={`text-[10px] leading-snug font-light text-[#6B5A5B] ${todo.completed ? "line-through opacity-50" : ""}`}>
                                            {todo.details}
                                          </p>
                                        )}
                                      </div>
                                    </label>
                                    <button 
                                      onClick={() => handleDeleteTodo(todo.id)}
                                      className="text-[#6B5A5B]/80 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                      aria-label="Delete note"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider pl-6">
                                    <span className={`px-1.5 py-0.5 border rounded-full ${priorityColor}`}>
                                      {priorityLabel}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-[#E5DAC6] text-[#5C4A4B] rounded-full">
                                      {todo.category || "general"}
                                    </span>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* 2. TAB CONTENT: ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-lg tracking-wide">Client Stitching Orders</h2>
                </div>

                <div className="overflow-x-auto">
                  {orders.length === 0 ? (
                    <p className="text-center py-16 text-xs text-[#6B5A5B]/70 font-light">No client orders logged at this atelier.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5DAC6] uppercase tracking-[1px] text-[#5C4A4B] font-semibold">
                          <th className="pb-4">Order ID</th>
                          <th className="pb-4">Client Name</th>
                          <th className="pb-4">Contact Phone</th>
                          <th className="pb-4">Reservation Date</th>
                          <th className="pb-4">Slot Amount</th>
                          <th className="pb-4">Stitching Status</th>
                          <th className="pb-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DAC6]/70">
                        {orders.map((order) => {
                          const isNew = isNewOrder(order.created_at);
                          return (
                            <tr 
                              key={order.id} 
                              className={`hover:bg-[#FDFCFB] transition-all relative ${
                                isNew ? "animate-pulse-gold bg-[#C8A96A]/5" : ""
                              }`}
                            >
                              <td className="py-4">
                                <span className="flex items-center gap-2">
                                  {isNew && (
                                    <span className="px-1.5 py-0.5 text-[0.55rem] font-bold tracking-[0.5px] bg-[#722F37] text-white rounded">
                                      ✨ NEW
                                    </span>
                                  )}
                                  #{order.id}
                                </span>
                              </td>
                              <td className="py-4 font-medium text-[#2C1A1B]">{order.user_name}</td>
                              <td className="py-4">{order.user_phone}</td>
                              <td className="py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="py-4 text-[#722F37] font-semibold">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-[0.65rem] uppercase font-bold tracking-[1px] ${
                                  order.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                  order.status === "Processing" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                  order.status === "Shipped" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                  "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-[#722F37] hover:text-[#8B3A43] font-semibold cursor-pointer"
                                  >
                                    View Details & Sizes
                                  </button>
                                  {(() => {
                                    const phone = order.user_phone || "";
                                    const cleanPhone = phone.replace(/[+\s\-()]/g, "");
                                    const itemsDesc = order.items?.map((i: any) => `${i.product_name} (${i.size})`).join(", ") || "";
                                    const message = `Hi ${order.user_name || "Customer"},\n\nThis is Casa Amora Luxury Atelier. We are contacting you regarding your stitching Order #${order.id} (Status: ${order.status}).\n\nItems: ${itemsDesc}\n\nPlease let us know if you need any adjustments or custom sizing details!`;
                                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                                    return (
                                      <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                                      >
                                        <MessageCircle size={14} /> WhatsApp
                                      </a>
                                    );
                                  })()}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
                <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs h-fit space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Publish Atelier Outfit</h2>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Design Name</label>
                      <input 
                        type="text" 
                        value={prodName} 
                        onChange={(e) => setProdName(e.target.value)} 
                        required 
                        placeholder="e.g. Velvet Maxi Dress"
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Price (₹)</label>
                      <input 
                        type="number" 
                        value={prodPrice} 
                        onChange={(e) => setProdPrice(e.target.value)} 
                        required 
                        placeholder="e.g. 3499"
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Design Category</label>
                      <select 
                        value={prodCategory} 
                        onChange={(e) => setProdCategory(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Material & Embroidery Details</label>
                      <input 
                        type="text" 
                        value={prodMaterial} 
                        onChange={(e) => setProdMaterial(e.target.value)} 
                        placeholder="e.g. Premium Silk and Velvet"
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Washing & Care</label>
                      <input 
                        type="text" 
                        value={prodWashing} 
                        onChange={(e) => setProdWashing(e.target.value)} 
                        placeholder="e.g. Dry Clean Only"
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Description</label>
                      <textarea 
                        value={prodDesc} 
                        onChange={(e) => setProdDesc(e.target.value)} 
                        placeholder="Fit parameters, patterns, custom designs..."
                        rows={3}
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Upload Design Images</label>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={(e) => setProdImages(e.target.files)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs text-[#6B5A5B] outline-none rounded-xs"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Plus size={16} /> {actionLoading ? "Saving outfit..." : "Publish Design"}
                    </button>
                  </form>
                </div>

                {/* Products List */}
                <div className="lg:col-span-2 bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Atelier Catalog ({products.length} Items)</h2>
                  
                  <div className="overflow-x-auto">
                    {products.length === 0 ? (
                      <p className="text-center py-16 text-xs text-[#6B5A5B]/70">No outfits registered.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC6] uppercase tracking-[1px] text-[#5C4A4B] font-semibold">
                            <th className="pb-4">Thumbnail</th>
                            <th className="pb-4">Design Name</th>
                            <th className="pb-4">Category</th>
                            <th className="pb-4">Price</th>
                            <th className="pb-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAC6]/70">
                          {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-[#FDFCFB] transition-colors">
                              <td className="py-3">
                                <div className="relative h-12 w-10 overflow-hidden bg-[#FAF8F5] border border-[#E5DAC6]/40">
                                  <Image 
                                    src={prod.images?.[0]?.image_url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983"} 
                                    alt={prod.name} 
                                    fill 
                                    className="object-cover" 
                                  />
                                </div>
                              </td>
                              <td className="py-3 font-medium text-[#2C1A1B]">{prod.name}</td>
                              <td className="py-3">{prod.category_name}</td>
                              <td className="py-3 text-[#722F37] font-semibold">₹{parseFloat(prod.price).toLocaleString("en-IN")}</td>
                              <td className="py-3">
                                <span className={`font-semibold ${prod.in_stock ? "text-emerald-600" : "text-amber-600"}`}>
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
                <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs h-fit space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Add Design Category</h2>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Category Name</label>
                      <input 
                        type="text" 
                        value={catName} 
                        onChange={(e) => setCatName(e.target.value)} 
                        required 
                        placeholder="e.g. Maxi Dresses"
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <FolderPlus size={16} /> {actionLoading ? "Registering..." : "Add Category"}
                    </button>
                  </form>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2 bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Design Segments ({categories.length} Categories)</h2>
                  
                  <div className="overflow-x-auto">
                    {categories.length === 0 ? (
                      <p className="text-center py-16 text-xs text-[#6B5A5B]/70">No categories found.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC6] uppercase tracking-[1px] text-[#5C4A4B] font-semibold">
                            <th className="pb-4">Category ID</th>
                            <th className="pb-4">Segment Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAC6]/70">
                          {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-[#FDFCFB] transition-colors">
                              <td className="py-4">#{cat.id}</td>
                              <td className="py-4 font-semibold text-[#2C1A1B]">{cat.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 5. TAB CONTENT: CLIENT DIARIES & TESTIMONIALS */}
            {activeTab === "diaries" && (
              <div className="space-y-8">
                
                {/* 1. Client Diaries Section */}
                <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Client Diaries (With Photos)</h2>
                  
                  {diaries.filter(d => d.client_image_url).length === 0 ? (
                    <p className="text-center py-12 text-xs text-[#6B5A5B]/70 italic">No client diaries with photos registered.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {diaries.filter(d => d.client_image_url).map((diary) => (
                        <div key={diary.id} className="bg-[#FAF8F5] border border-[#E5DAC6] p-5 space-y-4 rounded-xs flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-semibold text-[#2C1A1B]">{diary.user_name}</h4>
                                <p className="text-[0.65rem] text-[#6B5A5B]">Outfit: {diary.product_name}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[0.6rem] uppercase tracking-[1px] font-bold ${
                                diary.is_approved ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                              }`}>
                                {diary.is_approved ? "Approved" : "Pending Review"}
                              </span>
                            </div>

                            <div className="relative h-56 w-full overflow-hidden bg-black/5 border border-[#E5DAC6]/40 rounded-xs">
                              <Image 
                                src={diary.client_image_url} 
                                alt="Client lookbook outfit" 
                                fill 
                                className="object-cover" 
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                            </div>

                            <p className="text-xs text-[#3A2A2B] italic leading-relaxed">"{diary.review_text}"</p>
                          </div>

                          <div className="flex space-x-3 pt-3 border-t border-[#E5DAC6]/50">
                            {!diary.is_approved && (
                              <button 
                                onClick={() => handleApproveDiary(diary.id)}
                                className="px-3 py-1.5 bg-[#722F37] hover:bg-[#8B3A43] text-white text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={12} /> Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleRejectDiary(diary.id)}
                              className="px-3 py-1.5 border border-[#E5DAC6] hover:border-red-600 hover:text-red-600 text-[#5C4A4B] text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Client Testimonials Section */}
                <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Client Testimonials (Text Reviews)</h2>
                  
                  {diaries.filter(d => !d.client_image_url).length === 0 ? (
                    <p className="text-center py-12 text-xs text-[#6B5A5B]/70 italic">No text reviews registered.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {diaries.filter(d => !d.client_image_url).map((diary) => (
                        <div key={diary.id} className="bg-[#FAF8F5] border border-[#E5DAC6] p-5 space-y-4 rounded-xs flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-semibold text-[#2C1A1B]">{diary.user_name}</h4>
                                <p className="text-[0.65rem] text-[#6B5A5B]">Outfit: {diary.product_name}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[0.6rem] uppercase tracking-[1px] font-bold ${
                                diary.is_approved ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                              }`}>
                                {diary.is_approved ? "Approved" : "Pending Review"}
                              </span>
                            </div>

                            <p className="text-xs text-[#3A2A2B] italic leading-relaxed pt-2">"{diary.review_text}"</p>
                          </div>

                          <div className="flex space-x-3 pt-3 border-t border-[#E5DAC6]/50">
                            {!diary.is_approved && (
                              <button 
                                onClick={() => handleApproveDiary(diary.id)}
                                className="px-3 py-1.5 bg-[#722F37] hover:bg-[#8B3A43] text-white text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={12} /> Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleRejectDiary(diary.id)}
                              className="px-3 py-1.5 border border-[#E5DAC6] hover:border-red-600 hover:text-red-600 text-[#5C4A4B] text-[0.65rem] font-bold uppercase tracking-[1px] flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 6. TAB CONTENT: STAFF MANAGEMENT */}
            {activeTab === "staff_mgmt" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to create staff - only for superusers */}
                <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs h-fit relative space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Register Staff Account</h2>
                  
                  {staffInfo.is_superuser ? (
                    <form onSubmit={handleCreateStaff} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Username</label>
                        <input 
                          type="text" 
                          value={staffUsername} 
                          onChange={(e) => setStaffUsername(e.target.value)} 
                          required 
                          placeholder="e.g. anut"
                          className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Password</label>
                        <input 
                          type="password" 
                          value={staffPassword} 
                          onChange={(e) => setStaffPassword(e.target.value)} 
                          required 
                          placeholder="••••••••"
                          className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Display Name</label>
                        <input 
                          type="text" 
                          value={staffName} 
                          onChange={(e) => setStaffName(e.target.value)} 
                          required 
                          placeholder="e.g. Anu Thomas"
                          className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">Phone Number</label>
                        <input 
                          type="text" 
                          value={staffPhone} 
                          onChange={(e) => setStaffPhone(e.target.value)} 
                          placeholder="e.g. 9876543201"
                          className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[0.65rem] uppercase tracking-[1px] text-[#6B5A5B] font-semibold">WhatsApp Number</label>
                        <input 
                          type="text" 
                          value={staffWhatsApp} 
                          onChange={(e) => setStaffWhatsApp(e.target.value)} 
                          placeholder="e.g. 9876543201"
                          className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                        />
                      </div>

                      <label className="flex items-center space-x-3 text-xs cursor-pointer pt-2">
                        <input 
                          type="checkbox" 
                          checked={staffIsSuper} 
                          onChange={(e) => setStaffIsSuper(e.target.checked)} 
                          className="accent-[#722F37] h-4 w-4"
                        />
                        <span className="text-[#3A2A2B] font-medium">Grant Superadmin Privileges</span>
                      </label>

                      <button 
                        type="submit" 
                        disabled={actionLoading}
                        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        <Plus size={16} /> {actionLoading ? "Registering..." : "Create Account"}
                      </button>
                    </form>
                  ) : (
                    <div className="absolute inset-0 bg-[#FCFAF7]/95 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 space-y-4 z-10">
                      <ShieldAlert size={40} className="text-amber-500" />
                      <h4 className="font-serif text-base text-[#2C1A1B]">Privilege Required</h4>
                      <p className="text-xs text-[#6B5A5B] max-w-[200px] leading-relaxed">
                        Only Superadmins can register new staff accounts or modify permissions.
                      </p>
                    </div>
                  )}
                </div>

                {/* Staff Accounts List */}
                <div className="lg:col-span-2 bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                  <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Staff Registry ({staffList.length} Accounts)</h2>
                  
                  <div className="overflow-x-auto">
                    {staffList.length === 0 ? (
                      <p className="text-center py-16 text-xs text-[#6B5A5B]/70">No staff members registered.</p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5DAC6] uppercase tracking-[1px] text-[#5C4A4B] font-semibold">
                            <th className="pb-4">Name</th>
                            <th className="pb-4">Username</th>
                            <th className="pb-4">Role</th>
                            <th className="pb-4">Status</th>
                            {staffInfo.is_superuser && <th className="pb-4">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAC6]/70">
                          {staffList.map((staff) => (
                            <tr key={staff.id} className="hover:bg-[#FDFCFB] transition-colors">
                              <td className="py-4 font-semibold text-[#2C1A1B]">{staff.name || "Atelier Staff"}</td>
                              <td className="py-4">@{staff.username}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-[0.6rem] font-bold ${
                                  staff.is_superuser ? "text-[#722F37] bg-[#722F37]/10 border border-[#722F37]/20" : "text-[#5C4A4B] bg-[#E5DAC6]/30 border border-[#E5DAC6]"
                                }`}>
                                  {staff.is_superuser ? "Superadmin" : "Staff"}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`font-semibold ${staff.is_active ? "text-emerald-600" : "text-red-600"}`}>
                                  {staff.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              {staffInfo.is_superuser && (
                                <td className="py-4">
                                  <button
                                    onClick={() => handleToggleStaffActive(staff.id, staff.is_active)}
                                    className={`text-[0.65rem] uppercase font-bold tracking-[0.5px] cursor-pointer ${
                                      staff.is_active ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"
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

            {/* SUPPORT CHATS TAB */}
            {activeTab === "chats" && (
              <div className="flex h-[calc(100vh-160px)] border border-[#E5DAC6] rounded-xs overflow-hidden bg-white shadow-xs">
                
                {/* Left Panel: Conversation Thread List */}
                <div className="w-[320px] border-r border-[#E5DAC6] flex flex-col bg-[#FCFAF7]/50 shrink-0">
                  <div className="p-4 border-b border-[#E5DAC6] bg-[#FCFAF7]">
                    <h3 className="font-serif text-sm font-semibold tracking-wider text-[#2C1A1B] uppercase">Client Support Inbox</h3>
                    <p className="text-[10px] text-[#6B5A5B] font-light mt-0.5">Manage user design inquiries</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto divide-y divide-[#E5DAC6]/60">
                    {getConversations().length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#6B5A5B]/70 font-light">
                        No active support threads found.
                      </div>
                    ) : (
                      getConversations().map((chat) => {
                        const isSelected = selectedChatCustomerId === chat.customerId;
                        return (
                          <button
                            key={chat.customerId}
                            onClick={() => handleSelectChatCustomer(chat.customerId)}
                            className={`w-full text-left p-4 transition-all hover:bg-[#FAF6EE] flex flex-col gap-1 cursor-pointer ${
                              isSelected ? "bg-[#FAF6EE] border-l-4 border-[#722F37]" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-xs font-semibold text-[#2C1A1B] truncate max-w-[170px]">
                                {chat.customerName}
                              </span>
                              <span className="text-[9px] text-[#6B5A5B]/70 font-light">
                                {new Date(chat.latestMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px] text-[#A8854A] font-medium">
                                {chat.phone}
                              </span>
                              {chat.unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-[8px] font-bold bg-[#722F37] text-white rounded-full">
                                  {chat.unreadCount} new
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-[#6B5A5B] truncate mt-1 w-full font-light">
                              {chat.latestMsg.is_staff_sender ? "You: " : ""}
                              {chat.latestMsg.message}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Panel: Conversation Space */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
                  {!selectedChatCustomerId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 my-auto">
                      <MessageCircle size={32} className="text-[#A8854A]/40 mb-2" />
                      <h4 className="font-serif text-sm font-semibold text-[#2C1A1B]">Select a Support Thread</h4>
                      <p className="text-xs text-[#6B5A5B]/75 max-w-xs font-light mt-1">
                        Choose a client from the inbox to review custom styling requests or chat history.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
                      {/* Active Chat Header */}
                      {(() => {
                        const activeChat = getConversations().find(c => c.customerId === selectedChatCustomerId);
                        return (
                          <div className="px-6 py-4 border-b border-[#E5DAC6] bg-[#FCFAF7] flex justify-between items-center shrink-0">
                            <div>
                              <h4 className="text-xs font-semibold text-[#2C1A1B]">{activeChat?.customerName || "Customer"}</h4>
                              <p className="text-[10px] text-[#A8854A] font-medium mt-0.5">{activeChat?.phone}</p>
                            </div>
                            <span className="text-[9px] uppercase tracking-[1px] text-slate-400 font-light">
                              Direct Support Line
                            </span>
                          </div>
                        );
                      })()}

                      {/* Messages History */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFDF9]/20">
                        {chatMessages
                          .filter(msg => msg.customer === selectedChatCustomerId)
                          .map((msg) => {
                            const isStaff = msg.is_staff_sender;
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-[9px] font-semibold text-[#3B2F2F]/60">
                                    {isStaff ? (msg.sender_name || "Atelier Staff") : (msg.sender_name || "Customer")}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-light">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div
                                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs font-light shadow-2xs leading-relaxed ${
                                    isStaff
                                      ? "bg-[#722F37] text-white rounded-tr-none"
                                      : "bg-[#FAF8F5] border border-[#E5DAC6] text-[#3A2A2B] rounded-tl-none"
                                  }`}
                                >
                                  {msg.message}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Reply Input Form */}
                      <form onSubmit={handleSendChatReply} className="p-4 border-t border-[#E5DAC6] bg-[#FCFAF7] flex gap-2 shrink-0">
                        <input
                          type="text"
                          placeholder="Type your reply to the customer..."
                          required
                          value={chatReplyInput}
                          onChange={(e) => setChatReplyInput(e.target.value)}
                          disabled={sendingChatReply}
                          className="flex-1 bg-white border border-[#E5DAC6] rounded-md px-4 py-2.5 text-xs text-[#3A2A2B] outline-none focus:border-[#722F37] transition-all"
                        />
                        <button
                          type="submit"
                          disabled={sendingChatReply || !chatReplyInput.trim()}
                          className="px-5 py-2.5 rounded-md bg-[#722F37] text-white text-xs font-bold uppercase tracking-[1px] hover:bg-[#592228] transition-colors shrink-0 disabled:bg-slate-300 cursor-pointer"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 7. TAB CONTENT: CUSTOMERS */}
            {activeTab === "customers" && (
              <div className="bg-[#FCFAF7] p-6 border border-[#EBE2D5] shadow-xs space-y-6">
                <div className="flex justify-between items-center border-b border-[#E5DAC6] pb-4">
                  <h2 className="font-serif text-lg tracking-wide text-[#2C1A1B]">Registered Customers</h2>
                  <span className="text-xs text-[#6B5A5B]/85 font-medium">{customers.length} Customers Total</span>
                </div>

                <div className="overflow-x-auto">
                  {customers.length === 0 ? (
                    <p className="text-center py-16 text-xs text-[#6B5A5B]/70 font-light">No customers registered yet.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5DAC6] uppercase tracking-[1px] text-[#5C4A4B] font-semibold">
                          <th className="pb-4">Name</th>
                          <th className="pb-4">Phone Number</th>
                          <th className="pb-4">WhatsApp Number</th>
                          <th className="pb-4">Date Joined</th>
                          <th className="pb-4 text-center">Total Orders</th>
                          <th className="pb-4 text-right">Total Spent</th>
                          <th className="pb-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DAC6]/70">
                        {customers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-[#FDFCFB] transition-colors">
                            <td className="py-4 font-semibold text-[#2C1A1B]">{cust.name || "Unnamed Customer"}</td>
                            <td className="py-4">{cust.phone_number}</td>
                            <td className="py-4">{cust.whatsapp_number || "N/A"}</td>
                            <td className="py-4">{new Date(cust.date_joined).toLocaleDateString()}</td>
                            <td className="py-4 text-center">{cust.total_orders}</td>
                            <td className="py-4 text-right text-[#722F37] font-semibold">₹{cust.total_spent.toLocaleString("en-IN")}</td>
                            <td className="py-4 text-center">
                              <button 
                                onClick={() => setSelectedCustomer(cust)}
                                className="px-3 py-1.5 border border-[#722F37]/30 text-[#722F37] hover:bg-[#722F37] hover:text-white text-[0.65rem] font-bold uppercase tracking-[1px] transition-colors cursor-pointer rounded-xs"
                              >
                                View History
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

            {/* 8. TAB CONTENT: ATELIER SETTINGS */}
            {activeTab === "settings" && (
              <div className="max-w-2xl bg-[#FCFAF7] p-8 border border-[#EBE2D5] shadow-xs space-y-6">
                <h2 className="font-serif text-lg tracking-wide border-b border-[#E5DAC6] pb-4 text-[#2C1A1B]">Atelier Configurations</h2>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Brand Name</label>
                      <input 
                        type="text" 
                        value={settingsBrand} 
                        onChange={(e) => setSettingsBrand(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Atelier Supervisor / Owner</label>
                      <input 
                        type="text" 
                        value={settingsName} 
                        onChange={(e) => setSettingsName(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">About / Description Intro</label>
                    <textarea 
                      value={settingsDescription} 
                      onChange={(e) => setSettingsDescription(e.target.value)} 
                      required
                      rows={3}
                      className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Atelier Address (Press Enter for line breaks)</label>
                    <textarea 
                      value={settingsAddress} 
                      onChange={(e) => setSettingsAddress(e.target.value)} 
                      required
                      rows={3}
                      className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Client Helpline</label>
                      <input 
                        type="text" 
                        value={settingsHelpline} 
                        onChange={(e) => setSettingsHelpline(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Contact Email</label>
                      <input 
                        type="email" 
                        value={settingsEmail} 
                        onChange={(e) => setSettingsEmail(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">Opening Hours</label>
                      <input 
                        type="text" 
                        value={settingsHours} 
                        onChange={(e) => setSettingsHours(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[0.65rem] uppercase tracking-[1.5px] text-[#6B5A5B] font-semibold">WhatsApp Link Target (e.g. 919876543210)</label>
                      <input 
                        type="text" 
                        value={settingsPhone} 
                        onChange={(e) => setSettingsPhone(e.target.value)} 
                        required
                        className="w-full bg-[#FAF8F5] border border-[#E5DAC6] p-3 text-xs outline-none text-[#3A2A2B] focus:border-[#722F37] transition-colors rounded-xs"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary py-3.5 px-8 text-xs uppercase tracking-[2px] cursor-pointer">
                    Save Atelier Settings
                  </button>

                </form>
              </div>
            )}

            {/* 8. TAB CONTENT: STAFF PROFILE */}
            {activeTab === "profile" && staffInfo && (
              <div className="max-w-xl bg-[#FCFAF7] p-8 border border-[#EBE2D5] shadow-xs space-y-6 text-center">
                <div className="relative h-20 w-20 rounded-full bg-[#722F37]/10 border border-[#722F37]/20 flex items-center justify-center text-xl font-bold text-[#722F37] mx-auto">
                  {staffInfo.username.substring(0, 2).toUpperCase()}
                </div>
                
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl text-[#2C1A1B]">{staffInfo.name || staffInfo.first_name || "N/A"}</h2>
                  <p className="text-xs text-[#A8854A] font-semibold uppercase tracking-[2px]">
                    {staffInfo.is_superuser ? "Superadmin" : "Atelier Staff Member"}
                  </p>
                </div>

                <div className="border-t border-b border-[#E5DAC6] py-6 text-left text-xs font-light text-[#6B5A5B] space-y-4">
                  <div className="flex justify-between">
                    <span>Atelier Username</span>
                    <span className="text-[#2C1A1B] font-medium">@{staffInfo.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Status</span>
                    <span className="text-emerald-700 font-semibold">Authorized</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Line</span>
                    <span className="text-[#2C1A1B] font-medium">{staffInfo.phone_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp Line</span>
                    <span className="text-[#2C1A1B] font-medium">{staffInfo.whatsapp_number || "N/A"}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-red-600/35 hover:bg-red-600/10 text-red-600 uppercase tracking-[2px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-[#FCFAF7] border border-[#EBE2D5] p-8 space-y-6 overflow-y-auto max-h-[90vh] shadow-lg text-[#3A2A2B]"
            >
              
              <div className="flex justify-between items-center border-b border-[#E5DAC6] pb-4">
                <h3 className="font-serif text-xl tracking-wide text-[#2C1A1B]">Client Order Details #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-[#6B5A5B]/80 hover:text-[#2C1A1B] cursor-pointer" aria-label="Close modal">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 text-xs font-light text-[#3A2A2B]">
                <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 border border-[#E5DAC6]">
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">CLIENT NAME</span>
                    <p className="text-[#2C1A1B] font-medium text-sm">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">CONTACT PHONE</span>
                    <p className="text-[#2C1A1B] font-medium text-sm">{selectedOrder.user_phone}</p>
                  </div>
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">ORDER RESERVATION DATE</span>
                    <p className="text-[#2C1A1B] font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#6B5A5B] font-semibold block">STITCHING STATUS</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}
                      className="bg-[#FCFAF7] border border-[#E5DAC6] p-2 text-xs outline-none text-[#2C1A1B] focus:border-[#722F37] transition-colors rounded-xs"
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
                  <h4 className="font-serif text-sm text-[#2C1A1B] border-b border-[#E5DAC6] pb-2">Ordered Outfits</h4>
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start py-3 border-b border-[#E5DAC6]/75">
                      <div>
                        <h5 className="font-medium text-[#2C1A1B] text-sm">{item.product_name}</h5>
                        <p className="text-[#6B5A5B] pt-1">Size requested: <strong className="text-[#722F37]">{item.size}</strong> | Qty: {item.quantity}</p>
                        
                        {item.size === "Custom" && (
                          <div className="mt-3 p-3 bg-[#A8854A]/5 border border-[#A8854A]/25 text-[#722F37] leading-relaxed font-light">
                            <strong>Custom Stitching Request:</strong>
                            <p className="pt-1">Customer selected tailor custom measurements. Contact Salman / Client directly at {selectedOrder.user_phone} to record shoulder, bust, waist, and length measurements.</p>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-[#2C1A1B]">₹{(parseFloat(item.product_price) * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-semibold text-[#2C1A1B] pt-4 border-t border-[#E5DAC6]/75">
                  <span>Slot Total Amount</span>
                  <span className="text-[#722F37] text-lg">₹{parseFloat(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-start pt-2">
                  {(() => {
                    const phone = selectedOrder.user_phone || "";
                    const cleanPhone = phone.replace(/[+\s\-()]/g, "");
                    const itemsDesc = selectedOrder.items?.map((i: any) => `${i.product_name} (${i.size} x${i.quantity})`).join(", ") || "";
                    const message = `Hi ${selectedOrder.user_name || "Customer"},\n\nThis is Casa Amora Luxury Atelier. We are contacting you regarding your stitching Order #${selectedOrder.id} (Status: ${selectedOrder.status}).\n\nOutfits: ${itemsDesc}\n\nPlease let us know if you need any adjustments or custom measurements!`;
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                    return (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2 cursor-pointer bg-emerald-600 border-emerald-600 hover:bg-transparent hover:text-emerald-500 hover:border-emerald-500 transition-all font-semibold"
                      >
                        <MessageCircle size={15} /> Contact Client on WhatsApp
                      </a>
                    );
                  })()}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED CUSTOMER OVERLAY DIALOG */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-[#FCFAF7] border border-[#EBE2D5] p-8 space-y-6 overflow-y-auto max-h-[90vh] shadow-lg text-[#3A2A2B]"
            >
              
              <div className="flex justify-between items-center border-b border-[#E5DAC6] pb-4">
                <h3 className="font-serif text-xl tracking-wide text-[#2C1A1B]">Customer Profile: {selectedCustomer.name || "Unnamed Customer"}</h3>
                <button onClick={() => setSelectedCustomer(null)} className="text-[#6B5A5B]/80 hover:text-[#2C1A1B] cursor-pointer" aria-label="Close modal">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 text-xs font-light text-[#3A2A2B]">
                
                {/* Profile Grid */}
                <div className="grid grid-cols-2 gap-4 bg-[#FAF8F5] p-4 border border-[#E5DAC6]">
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">PHONE NUMBER</span>
                    <p className="text-[#2C1A1B] font-medium text-sm">{selectedCustomer.phone_number}</p>
                  </div>
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">WHATSAPP NUMBER</span>
                    <p className="text-[#2C1A1B] font-medium text-sm">{selectedCustomer.whatsapp_number || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">TOTAL ORDERS</span>
                    <p className="text-[#2C1A1B] font-medium text-sm">{selectedCustomer.total_orders}</p>
                  </div>
                  <div>
                    <span className="text-[#6B5A5B] font-semibold block mb-1">TOTAL SPENT</span>
                    <p className="text-[#722F37] font-semibold text-sm">₹{selectedCustomer.total_spent.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {/* WhatsApp Contact Action */}
                <div className="flex justify-start">
                  {(() => {
                    // Normalize phone number for WhatsApp link
                    const phone = selectedCustomer.whatsapp_number || selectedCustomer.phone_number || "";
                    const cleanPhone = phone.replace(/[+\s\-()]/g, "");
                    
                    // Format message containing order details
                    const ordersListText = selectedCustomer.orders && selectedCustomer.orders.length > 0 
                      ? selectedCustomer.orders.map((o: any) => {
                          const itemsText = o.items.map((i: any) => `${i.product_name} (${i.size} x${i.quantity})`).join(", ");
                          return `Order #${o.id} [${o.status}]: ${itemsText} - Total: ₹${parseFloat(o.total_amount).toLocaleString("en-IN")}`;
                        }).join("\n")
                      : "No orders found.";

                    const message = `Hi ${selectedCustomer.name || "Customer"},\n\nThis is Casa Amora Luxury Atelier. We are contacting you regarding your orders:\n\n${ordersListText}\n\nPlease let us know if you need any assistance or customization details!`;
                    const encodedMsg = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

                    return (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-3 px-6 text-xs flex items-center gap-2 cursor-pointer bg-emerald-600 border-emerald-600 hover:bg-transparent hover:text-emerald-500 hover:border-emerald-500 transition-all font-semibold"
                      >
                        <MessageCircle size={16} /> Contact on WhatsApp (With Order Details)
                      </a>
                    );
                  })()}
                </div>

                {/* Order History */}
                <div className="space-y-4">
                  <h4 className="font-serif text-sm text-[#2C1A1B] border-b border-[#E5DAC6] pb-2">Order History</h4>
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedCustomer.orders.map((order: any) => (
                        <div key={order.id} className="bg-[#FAF8F5] border border-[#E5DAC6] p-4 space-y-3 rounded-xs">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-[#2C1A1B]">Order #{order.id}</span>
                            <span className={`px-2 py-0.5 text-[0.6rem] uppercase font-bold tracking-[0.5px] ${
                              order.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              order.status === "Processing" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                              order.status === "Shipped" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                              "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-[0.7rem] text-[#6B5A5B]/85">
                            Ordered: {new Date(order.created_at).toLocaleString()}
                          </div>
                          
                          <div className="space-y-2 border-t border-[#E5DAC6]/75 pt-2">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-xs font-light text-[#3A2A2B]">
                                <span>{item.product_name} <strong className="text-[#722F37]">({item.size})</strong> x {item.quantity}</span>
                                <span className="text-[#2C1A1B] font-semibold">₹{(parseFloat(item.product_price) * item.quantity).toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-xs font-semibold text-[#2C1A1B] border-t border-[#E5DAC6]/75 pt-2">
                            <span>Order Total</span>
                            <span className="text-[#722F37]">₹{parseFloat(order.total_amount).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-[#6B5A5B]/70 italic">No orders logged for this customer.</p>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

