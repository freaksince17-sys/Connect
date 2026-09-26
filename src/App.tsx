/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { MainSwipeDeck } from './components/MainSwipeDeck';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { SellerAuthModal } from './components/SellerAuthModal';
import { SellerToolbar } from './components/SellerToolbar';
import { SellerProductModal } from './components/SellerProductModal';
import { SellerCatalogListModal } from './components/SellerCatalogListModal';
import { TikTokManageModal } from './components/TikTokManageModal';
import { InstagramManageModal } from './components/InstagramManageModal';
import { CraftStoryModal } from './components/CraftStoryModal';

export default function App() {
  return (
    <CartProvider>
      <div id="top" className="min-h-screen bg-[#FAF8F5] text-[#1C1B1A] flex flex-col font-sans selection:bg-[#E8DFD8] selection:text-[#1C1B1A]">
        {/* Top Announcement Bar */}
        <AnnouncementBar />

        {/* Sticky Frosted Header */}
        <Navbar />

        {/* Main Swipeable 6-Screen Deck */}
        <main className="flex-1">
          <MainSwipeDeck />
        </main>

        {/* Footer */}
        <Footer />

        {/* Global Modals & Slide-over Drawers */}
        <ProductDetailModal />
        <CartDrawer />
        <CheckoutModal />
        <WishlistDrawer />
        <OrderTrackerModal />

        {/* Seller Mode Modals & Floating Atelier Toolbar */}
        <SellerAuthModal />
        <SellerCatalogListModal />
        <SellerProductModal />
        <TikTokManageModal />
        <InstagramManageModal />
        <CraftStoryModal />
        <SellerToolbar />

        {/* Mobile Sticky Quick Navigation */}
        <MobileBottomBar />
      </div>
    </CartProvider>
  );
}

