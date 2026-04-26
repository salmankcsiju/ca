import ProductCard, { Product } from "@/components/products/ProductCard";
import styles from "./Favorites.module.css";
import Link from "next/link";

// Dummy favorites data
const favoriteProducts: Product[] = [
  { id: 1, name: "Velvet Maxi Dress", price: 3499, category: "Women - Maxi", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop" },
  { id: 3, name: "Floral Summer Kurti", price: 1299, category: "Women - Kurthy", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1974&auto=format&fit=crop" },
];

export default function FavoritesPage() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Your Favorites</h1>

      {favoriteProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven't saved any items yet.</p>
          <Link href="/products" className="btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
