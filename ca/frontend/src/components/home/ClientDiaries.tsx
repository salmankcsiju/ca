"use client";

import { useEffect, useState } from "react";
import styles from "./ClientDiaries.module.css";
import Image from "next/image";
import { Upload } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ClientDiaries() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiaries = async () => {
      try {
        const data = await fetchApi("/diaries/");
        setDiaries(data);
      } catch (err) {
        console.error("Failed to fetch client diaries:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDiaries();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Client Diaries</h2>
          <p>Real stories, real fits. See how our bespoke creations look on our wonderful clients.</p>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <p style={{ textAlign: "center", width: "100%" }}>Loading...</p>
          ) : diaries.length > 0 ? (
            diaries.map((diary) => (
              <div key={diary.id} className={styles.diaryCard}>
                <div className={styles.imagesContainer}>
                  <div className={styles.imageHalf}>
                    <div className={styles.label}>The Product</div>
                    <Image 
                      src={diary.product_image_url || "https://images.unsplash.com/photo-1583391733958-650fac5b18bc?q=80&w=1974&auto=format&fit=crop"} 
                      alt="Product" 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                  <div className={styles.imageHalf}>
                    <div className={styles.label}>The Fit</div>
                    <Image 
                      src={diary.client_image_url || "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=1980&auto=format&fit=crop"} 
                      alt="Client" 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                </div>
                <div className={styles.content}>
                  <h4>{diary.user_name}</h4>
                  <p>"{diary.review_text}"</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", width: "100%", color: "var(--text-muted)" }}>
              No diaries found. Be the first to share your look!
            </p>
          )}
        </div>

        <div className={styles.uploadSection}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
            <Upload size={20} />
            Share Your Look
          </button>
        </div>
      </div>
    </section>
  );
}
