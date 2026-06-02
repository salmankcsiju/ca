"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import styles from "../Dashboard.module.css";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // If already logged in as staff, redirect directly to dashboard
    const token = localStorage.getItem("casa_amora_token");
    if (token) {
      fetchApi("/auth/me/")
        .then((profile) => {
          if (profile.is_staff) {
            router.push("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("casa_amora_token");
        });
    }
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      localStorage.setItem("casa_amora_token", data.token);

      const profile = await fetchApi("/auth/me/");
      if (profile.is_staff) {
        localStorage.setItem("casa_amora_user", JSON.stringify(profile));
        router.push("/dashboard");
      } else {
        localStorage.removeItem("casa_amora_token");
        throw new Error("Unauthorized. Only staff members can access the dashboard.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer} style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className={styles.loginGate}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: "2rem", marginBottom: "4px" }}>Casa Amora</h2>
          <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)" }}>Staff Atelier Login</p>
        </div>
        {loginError && <p className={styles.errorMsg}>{loginError}</p>}
        <form onSubmit={handleAdminLogin}>
          <div className={styles.formGroup}>
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Enter admin/staff username"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loginLoading} style={{ marginTop: "16px" }}>
            {loginLoading ? "Authenticating..." : "Login to Atelier"}
          </button>
        </form>
      </div>
    </div>
  );
}
