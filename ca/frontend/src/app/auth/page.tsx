"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Auth.module.css";
import { ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isWhatsapp, setIsWhatsapp] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        phone_number: phone,
        name: isLogin ? "User" : name,
        whatsapp_number: (!isLogin && !isWhatsapp) ? whatsapp : phone
      };

      const response = await fetchApi("/auth/login/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Save token to local storage
      localStorage.setItem("casa_amora_token", response.token);
      localStorage.setItem("casa_amora_user", JSON.stringify(response.user));
      
      // Redirect to home
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={20} /> Back to Home
          </Link>
          <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p>
            {isLogin 
              ? "Sign in to access your orders, wishlist, and exclusive offers." 
              : "Join Casa Amora to track your bespoke orders and preferences."}
          </p>
        </div>

        {error && <div style={{ color: "red", marginBottom: "16px", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Enter your full name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number *</label>
            <input 
              type="tel" 
              id="phone" 
              placeholder="Enter your mobile number" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className={styles.whatsappGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={isWhatsapp} 
                  onChange={(e) => setIsWhatsapp(e.target.checked)} 
                />
                <span>Is this your WhatsApp number?</span>
              </label>

              {!isWhatsapp && (
                <div className={`${styles.formGroup} ${styles.animateIn}`}>
                  <label htmlFor="whatsapp">WhatsApp Number (Optional)</label>
                  <input 
                    type="tel" 
                    id="whatsapp" 
                    placeholder="Enter your WhatsApp number" 
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  <span className={styles.helpText}>We use WhatsApp to share order updates and custom measurements.</span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Register")}
          </button>
        </form>

        <div className={styles.toggleText}>
          {isLogin ? (
            <p>New to Casa Amora? <button type="button" className={styles.toggleBtn} onClick={() => setIsLogin(false)}>Create an account</button></p>
          ) : (
            <p>Already have an account? <button type="button" className={styles.toggleBtn} onClick={() => setIsLogin(true)}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
