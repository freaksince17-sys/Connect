import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  ShieldCheck, 
  Truck, 
  ArrowUp, 
  Check,
  Lock,
  Instagram,
  ArrowUpRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Footer: React.FC = () => {
  const { 
    setSelectedCategory, 
    openTracker, 
    setIsSellerAuthModalOpen, 
    setActiveNavTab 
  } = useCart();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmailInput('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const handleNavCategory = (category: string) => {
    setActiveNavTab('home');
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C1B1A] text-[#FAF8F5] pt-14 pb-24 lg:pb-14 border-t border-[#2B2927]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Brand Statement */}
        <div className="pb-12 border-b border-[#2B2927] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-[#C5A880] text-xs uppercase tracking-[0.2em] font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>The Artified Circle • VIP Nepal</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
              Receive First Access to Limited Batch Releases
            </h3>
            <p className="text-xs sm:text-sm text-[#A69E96] mt-2 max-w-lg leading-relaxed">
              Subscribe for new pearl bag drops, festive release alerts (Teej, Dashain, Tihar), and exclusive styling guides.
            </p>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email or phone..."
                className="flex-1 px-4 py-3 bg-[#2B2927] border border-[#3E3A36] rounded-xl text-xs text-white placeholder-[#736C65] focus:outline-none focus:border-[#C5A880]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#C5A880] text-[#1C1B1A] font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-[#D4AF37] transition-colors shrink-0 flex items-center gap-1.5"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Joined!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-emerald-400 mt-1.5">
                Thank you! Use promo code <strong>TIKTOK10</strong> for 10% off your checkout.
              </p>
            )}
          </div>
        </div>

        {/* Middle Footer Columns */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-serif text-xl tracking-[0.2em] font-semibold uppercase text-white">
                Artified_np
              </h4>
              <p className="text-[10px] tracking-widest uppercase text-[#C5A880] mt-0.5 font-medium">
                Handcrafted Elegance | Wearable Art
              </p>
            </div>
            <p className="text-xs text-[#A69E96] leading-relaxed">
              Handmade pearl evening bags, freshwater baroque chokers, and macrame creations woven with patient mastery in Kathmandu, Nepal.
            </p>
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="https://www.instagram.com/artified_np/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 text-white rounded-xl border border-[#E1306C]/40 hover:border-[#E1306C] transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center">
                    <Instagram className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs block text-white group-hover:text-[#fcb045] transition-colors">
                      @artified_np
                    </span>
                    <span className="text-[10px] text-[#A69E96]">12K+ followers on Instagram</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="https://tiktok.com/@artified_np"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-[#2B2927] text-[#A69E96] rounded-xl border border-[#3E3A36] hover:border-[#C5A880] hover:text-white transition-colors text-[11px] flex items-center justify-between"
              >
                <span>TikTok @artified_np</span>
                <ArrowUpRight className="w-3 h-3 text-[#736C65]" />
              </a>
            </div>
          </div>

          {/* Column 2: Artisanal Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C5A880] mb-4">
              Creations
            </h5>
            <ul className="space-y-2.5 text-xs text-[#A69E96]">
              <li>
                <button
                  onClick={() => {
                    setActiveNavTab('journal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-white hover:text-[#fcb045] transition-colors flex items-center gap-1.5 font-medium text-left cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>Instagram Journal (@artified_np)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveNavTab('tiktok');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  As Seen On TikTok
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavCategory('pearl-bags')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Handcrafted Pearl Bags
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavCategory('pearl-necklaces')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Freshwater Pearl Chokers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavCategory('macrame')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Macrame
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavCategory('accessories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accessories
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleNavCategory('pearl-necklaces');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C5A880] transition-colors text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  <span>Bridal Pearl Collars</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavCategory('best-sellers')}
                  className="hover:text-white transition-colors"
                >
                  Trending Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & Policies */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C5A880] mb-4">
              Client Care
            </h5>
            <ul className="space-y-2.5 text-xs text-[#A69E96]">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNavTab('track');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5 text-[#FAF8F5] font-medium cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Track Order Status Live</span>
                </button>
              </li>
              <li>
                <a href="#care-section" className="hover:text-white transition-colors">
                  Pearl & Macrame Care Guide
                </a>
              </li>
              <li>
                <a href="#care-section" className="hover:text-white transition-colors">
                  Delivery Rates & Valley Timelines
                </a>
              </li>
              <li>
                <span className="text-emerald-400 font-semibold block">
                  Easy exchange within 24 hrs
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors block">
                  Handcrafted Artisan Inspection Guarantee
                </span>
              </li>
              <li>
                <a
                  href="https://wa.me/9779801234567"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  <span>Direct WhatsApp Helpdesk</span>
                </a>
              </li>
              <li>
                <a
                  href="https://ig.me/m/artified_np"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#fcb045] hover:text-[#fd1d1d] transition-colors font-medium flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>Direct Instagram DM (@artified_np)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Studio Nepal */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C5A880] mb-4">
              Studio & Orders
            </h5>
            <div className="flex items-start gap-2.5 text-xs text-[#A69E96]">
              <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>Chikamugal, Kathmandu, Nepal</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#A69E96]">
              <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>+977 980-1234567 (Call / WhatsApp)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#A69E96]">
              <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>artified.nepal@gmail.com</span>
            </div>

            {/* Accepted Local Payment Methods */}
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-semibold mb-2">
                Accepted In Nepal:
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 bg-[#2B2927] text-white text-[10px] rounded border border-[#3E3A36]">
                  Cash on Delivery (COD)
                </span>
                <span className="px-2 py-0.5 bg-[#60BB46]/20 text-[#82d66a] text-[10px] rounded border border-[#60BB46]/40 font-semibold">
                  eSewa
                </span>
                <span className="px-2 py-0.5 bg-[#5D2E8E]/20 text-[#a379d4] text-[10px] rounded border border-[#5D2E8E]/40 font-semibold">
                  Khalti
                </span>
                <span className="px-2 py-0.5 bg-[#2B2927] text-white text-[10px] rounded border border-[#3E3A36]">
                  Fonepay QR
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#2B2927] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736C65]">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} Artified_np. All rights reserved. Intricately Handcrafted in Nepal.</p>
            <span className="text-[#3A3530]">•</span>
            {/* Discreet Studio Portal Access for the seller (Hidden from regular shoppers) */}
            <button
              type="button"
              onClick={() => setIsSellerAuthModalOpen(true)}
              className="text-[10px] text-[#4A4540] hover:text-[#A69E96] transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
              title="Seller Studio Login (Passcode required)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Studio</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[11px]">Pricing in NPR (Rs.)</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#A69E96] hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
