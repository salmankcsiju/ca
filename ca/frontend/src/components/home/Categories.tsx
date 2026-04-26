"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Categories.module.css";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const womenCategories = [
  "Churidhar", "Abaya", "Maxi", "Saree", "Kurthy", "Oversized Kurthy", "Sleeveless Kurthy", "Short Kurthy"
];

const kidsCategories = [
  "Frocks", "Kids Maxi", "Ethnic Wear", "Casual Wear", "Party Wear"
];

export default function Categories() {
  const [expandedSection, setExpandedSection] = useState<"women" | "kids" | null>(null);

  const toggleSection = (section: "women" | "kids") => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Discover Our Collections</h2>
          <p>Carefully curated for you and your little ones.</p>
        </div>

        <div className={styles.grid}>
          {/* Women Section */}
          <div className={styles.categoryCard}>
            <div className={styles.imageWrapper} onClick={() => toggleSection("women")}>
              <Image 
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop" 
                alt="Women's Collection"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.cardOverlay}>
                <h3>Women</h3>
                <motion.div 
                  animate={{ rotate: expandedSection === "women" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={32} />
                </motion.div>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedSection === "women" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={styles.expandedContent}
                >
                  <div className={styles.subCategoryGrid}>
                    {womenCategories.map((cat, idx) => (
                      <Link key={idx} href={`/category/women?type=${cat.toLowerCase().replace(' ', '-')}`}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kids Section */}
          <div className={styles.categoryCard}>
            <div className={styles.imageWrapper} onClick={() => toggleSection("kids")}>
              <Image 
                src="https://images.unsplash.com/photo-1519238396265-276709849206?q=80&w=1974&auto=format&fit=crop" 
                alt="Kids' Collection"
                fill
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.cardOverlay}>
                <h3>Kids</h3>
                <motion.div 
                  animate={{ rotate: expandedSection === "kids" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={32} />
                </motion.div>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedSection === "kids" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={styles.expandedContent}
                >
                  <div className={styles.subCategoryGrid}>
                    {kidsCategories.map((cat, idx) => (
                      <Link key={idx} href={`/category/kids?type=${cat.toLowerCase().replace(' ', '-')}`}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
