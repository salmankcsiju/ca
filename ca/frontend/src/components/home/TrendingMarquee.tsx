"use client";

import styles from "./TrendingMarquee.module.css";
import Image from "next/image";

const trendingProducts = [
  { id: 1, name: "Velvet Maxi Dress", price: "₹3,499", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop" },
  { id: 2, name: "Silk Churidhar Set", price: "₹2,899", image: "https://images.unsplash.com/photo-1583391733958-650fac5b18bc?q=80&w=1974&auto=format&fit=crop" },
  { id: 3, name: "Floral Summer Kurti", price: "₹1,299", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop" },
  { id: 4, name: "Kids Party Gown", price: "₹1,899", image: "https://images.unsplash.com/photo-1519238396265-276709849206?q=80&w=1974&auto=format&fit=crop" },
  { id: 5, name: "Premium Georgette Saree", price: "₹4,599", image: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=1980&auto=format&fit=crop" },
];

export default function TrendingMarquee() {
  // Duplicate the array to create a seamless loop
  const marqueeItems = [...trendingProducts, ...trendingProducts];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Latest & Trending</h2>
        <div className={styles.badge}>Just Arrived</div>
      </div>
      
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className={styles.productCard}>
              <div className={styles.imageWrapper}>
                <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                <div className={styles.hoverOverlay}>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Quick View</button>
                </div>
              </div>
              <div className={styles.details}>
                <h4>{product.name}</h4>
                <p>{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
