import Link from "next/link";
import { Instagram, Send, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F3E9DC] border-t border-[#D6B370]/35 text-[#3B2F2F] py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Information */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl tracking-[4px] text-[#3B2F2F]">CASA AMORA</h2>
          <p className="text-sm text-[#3B2F2F]/70 leading-relaxed font-light">
            Bespoke haute couture and tailoring management designed for premium elegance. Crafting statements for Women &amp; Kids.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="font-serif text-[#D6B370] uppercase tracking-[2px] text-sm">Quick Links</h3>
          <ul className="space-y-2 text-sm font-light text-[#3B2F2F]/80">
            <li>
              <Link href="/products" className="hover:text-[#D8A7B1] transition-colors">All Collections</Link>
            </li>
            <li>
              <Link href="/products?category=1" className="hover:text-[#D8A7B1] transition-colors">Women's Couture</Link>
            </li>
            <li>
              <Link href="/products?category=2" className="hover:text-[#D8A7B1] transition-colors">Kids' Wear</Link>
            </li>
            <li>
              <Link href="/auth" className="hover:text-[#D8A7B1] transition-colors">Customer Login</Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-serif text-[#D6B370] uppercase tracking-[2px] text-sm">Atelier Contact</h3>
          <ul className="space-y-2 text-sm font-light text-[#3B2F2F]/80">
            <li>
              <span className="text-[#3B2F2F]/50">Phone: </span>
              <a href="tel:7356198300" className="hover:text-[#D8A7B1] transition-colors">7356198300</a>
            </li>
            <li>
              <span className="text-[#3B2F2F]/50">Email: </span>
              <a href="mailto:support@casaamora.com" className="hover:text-[#D8A7B1] transition-colors">support@casaamora.com</a>
            </li>
            <li className="flex items-center space-x-4 pt-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-[#D6B370]/30 hover:border-[#D8A7B1] hover:text-[#D8A7B1] transition-all rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/917356198300"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-[#D6B370]/30 hover:border-[#D8A7B1] hover:text-[#D8A7B1] transition-all rounded-full"
                aria-label="WhatsApp"
              >
                <Phone size={18} />
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h3 className="font-serif text-[#D6B370] uppercase tracking-[2px] text-sm">The Atelier Gazette</h3>
          <p className="text-xs text-[#3B2F2F]/60 font-light leading-relaxed">
            Subscribe to receive private previews of new collections and editorial lookbooks.
          </p>
          <div className="flex border border-[#D6B370]/30 overflow-hidden bg-white/50 backdrop-blur-xs rounded-sm shadow-2xs">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-transparent text-xs p-3 flex-grow outline-none border-none text-[#3B2F2F] placeholder-[#3B2F2F]/40"
            />
            <button className="bg-[#D8A7B1] text-white px-4 hover:bg-[#D6B370] transition-colors flex items-center justify-center cursor-pointer">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#D6B370]/20 flex flex-col md:flex-row justify-between items-center text-xs text-[#3B2F2F]/50 font-light space-y-4 md:space-y-0">
        <p>&copy; {new Date().getFullYear()} Casa Amora. All rights reserved.</p>
        <div className="space-x-6">
          <a href="#" className="hover:text-[#D8A7B1] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#D8A7B1] transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
