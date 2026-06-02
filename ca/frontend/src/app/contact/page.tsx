"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Phone, Mail, MapPin, Clock, Send, MessageCircle, 
  Sparkles, CheckCircle2, ChevronRight, LogIn, ArrowLeft 
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: number;
  sender: number;
  sender_name: string;
  sender_username: string;
  is_staff_sender: boolean;
  customer: number;
  message: string;
  timestamp: string;
  is_read: boolean;
}

export default function ContactPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Atelier Settings
  const [settings, setSettings] = useState<any>({
    brand_name: "CASA AMORA",
    description: "Casa Amora is a luxury bespoke boutique offering personalized sewing, premium fabrics, and private bridal consultations. Meet our master couturiers to sketch, fit, and build your dream closet.",
    address: "Casa Amora Atelier, Marine Drive,\nKochi, Kerala — 682031",
    helpline: "+91 98765 43210 (Toll Free)",
    email: "boutique@casaamora.com",
    hours: "Mon — Sat: 10:00 AM — 08:00 PM IST",
    whatsapp: "919876543210"
  });

  // Load dynamic settings on mount
  useEffect(() => {
    fetchApi("/settings/")
      .then((data: any[]) => {
        if (data && data.length > 0) {
          const dict = data.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});
          setSettings((prev: any) => ({ ...prev, ...dict }));
        }
      })
      .catch((err) => console.error("Failed to load settings", err));
  }, []);

  // Authenticated state check
  useEffect(() => {
    const token = localStorage.getItem("casa_amora_token");
    const userStr = localStorage.getItem("casa_amora_user");
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  // Poll chat messages if logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMessages = async () => {
      try {
        const data = await fetchApi("/messages/");
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    // Load initial
    setLoadingHistory(true);
    fetchMessages().finally(() => setLoadingHistory(false));

    // Set up polling
    const interval = setInterval(fetchMessages, 4000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Mark messages as read when opening page / receiving messages
  useEffect(() => {
    if (!isLoggedIn || messages.length === 0) return;

    // Check if there are unread messages from staff
    const hasUnreadStaff = messages.some(msg => msg.is_staff_sender && !msg.is_read);
    if (hasUnreadStaff) {
      fetchApi("/messages/mark_read/", {
        method: "POST",
        body: JSON.stringify({ customer: currentUser?.id }),
      }).catch(err => console.error("Error marking messages read", err));
    }
  }, [messages, isLoggedIn, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const response = await fetchApi("/messages/", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      // Append message instantly for smooth UX
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      console.error("Failed to send message", err);
      alert(err.message || "Could not send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3B2F2F] font-sans pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Title */}
        <div className="mb-12 text-center md:text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400 hover:text-[#D8A7B1] transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <span className="block text-[0.65rem] uppercase tracking-[4px] text-[#D6B370] font-bold mb-2">Connect With Us</span>
          <h1 className="font-serif text-4xl md:text-5xl text-[#3B2F2F] tracking-wide">The Atelier Closet</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT: Atelier Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#FAF7F2] border border-[#D6B370]/20 rounded-3xl p-4 sm:p-8 md:p-10 shadow-xs">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-2xl text-[#3B2F2F] mb-4">Visit Our Atelier</h2>
                <p className="text-xs text-[#3B2F2F]/75 leading-relaxed font-light">
                  {settings.description}
                </p>
              </div>

              {/* Contacts Grid */}
              <div className="space-y-6">
                
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/20 flex items-center justify-center text-[#D8A7B1] shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D6B370]">Atelier Address</h4>
                    <p className="text-xs text-[#3B2F2F]/85 mt-1 font-light leading-relaxed">
                      {settings.address.split('\n').map((line: string, i: number) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/20 flex items-center justify-center text-[#D8A7B1] shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D6B370]">Client Helpline</h4>
                    <p className="text-xs text-[#3B2F2F]/85 mt-1 font-light">
                      {settings.helpline}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/20 flex items-center justify-center text-[#D8A7B1] shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D6B370]">Email & Media</h4>
                    <p className="text-xs text-[#3B2F2F]/85 mt-1 font-light">
                      {settings.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#D8A7B1]/10 border border-[#D8A7B1]/20 flex items-center justify-center text-[#D8A7B1] shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D6B370]">Opening Hours</h4>
                    <p className="text-xs text-[#3B2F2F]/85 mt-1 font-light">
                      {settings.hours}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="mt-10 pt-8 border-t border-[#D6B370]/15 space-y-4">
              <span className="block text-[10px] uppercase tracking-[1px] text-slate-400 font-light">Need an instant stitch update?</span>
              <a 
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-semibold text-xs tracking-[1.5px] uppercase flex items-center justify-center gap-2.5 transition-all rounded-2xl"
              >
                <MessageCircle size={16} /> Chat via WhatsApp
              </a>
            </div>

          </div>

          {/* RIGHT: Support Chat Console (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-white border border-[#D6B370]/20 rounded-3xl overflow-hidden min-h-[550px] shadow-sm">
            
            {/* Console Header */}
            <div className="bg-[#FAF7F2] border-b border-[#D6B370]/15 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[1.5px] text-[#3B2F2F]">Atelier Support Chat</h3>
                  <span className="text-[9px] text-[#6B5A5B] font-light">Designers & tailors online</span>
                </div>
              </div>

              {isLoggedIn && currentUser && (
                <div className="text-[10px] text-[#3B2F2F]/65 font-medium">
                  Logged in as <span className="text-[#D8A7B1] font-semibold">{currentUser.name || currentUser.username}</span>
                </div>
              )}
            </div>

            {/* Console Workspace */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden min-h-[400px]">
              
              {!isLoggedIn ? (
                /* Unauthenticated View */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                  <div className="h-16 w-16 bg-[#FAF7F2] border border-[#D6B370]/20 rounded-full flex items-center justify-center text-[#D6B370] mb-6 shadow-xs">
                    <Sparkles size={28} className="animate-pulse" />
                  </div>
                  <h4 className="font-serif text-xl text-[#3B2F2F] mb-3">Consult with Casa Amora</h4>
                  <p className="text-xs text-[#3B2F2F]/65 max-w-sm font-light leading-relaxed mb-6">
                    Connect directly with our master stylists and designers to discuss customizations, sleeve or neckline choices, alterations, and booking details.
                  </p>
                  <button
                    onClick={() => router.push("/auth?redirect=/contact")}
                    className="btn-primary py-3.5 px-8 text-xs uppercase tracking-[2px] flex items-center gap-2"
                  >
                    <LogIn size={14} /> Sign In to Start Chatting
                  </button>
                </div>
              ) : (
                /* Chat Message Log */
                <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
                  
                  {/* Scrollable messages area */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[350px] scrollbar-thin">
                    {loadingHistory ? (
                      <div className="h-full flex items-center justify-center my-auto">
                        <span className="text-xs text-[#6B5A5B]/50 font-serif animate-pulse">Retrieving Atelier chat logs...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center my-auto p-4">
                        <MessageCircle size={24} className="text-[#D8A7B1] mb-2 opacity-50" />
                        <p className="text-xs font-serif text-[#3B2F2F]/60">Send your first message to begin</p>
                        <p className="text-[10px] font-light text-[#6B5A5B] mt-1 max-w-[240px]">Ask about styles, fabric modifications, order statuses, or customized request quotes.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isMe = !msg.is_staff_sender;
                          return (
                            <div 
                              key={msg.id}
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] font-semibold text-[#3B2F2F]/60">
                                  {isMe ? "You" : (msg.sender_name || "Atelier Staff")}
                                </span>
                                <span className="text-[8px] text-slate-400 font-light">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div 
                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs font-light shadow-2xs leading-relaxed break-words ${
                                  isMe 
                                    ? "bg-[#D8A7B1] text-white rounded-tr-none" 
                                    : "bg-[#FAF7F2] border border-[#D6B370]/15 text-[#3B2F2F] rounded-tl-none"
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-[#D6B370]/10 flex gap-2">
                    <input 
                      type="text"
                      placeholder="Type your design question or note..."
                      required
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={sending}
                      className="flex-1 bg-[#FAF7F2] border border-[#D6B370]/20 rounded-xl px-4 py-3 text-xs text-[#3B2F2F] placeholder:text-[#3B2F2F]/40 outline-none focus:border-[#D8A7B1] transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={sending || !inputText.trim()}
                      className="h-10 w-10 rounded-xl bg-[#D8A7B1] text-white flex items-center justify-center hover:bg-[#c9959e] transition-colors shrink-0 disabled:bg-slate-200 cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </form>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
