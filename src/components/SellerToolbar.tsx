import React, { useState } from 'react';
import { Sparkles, Plus, Lock, ChevronUp, ChevronDown, RotateCcw, Package, Check, Layers, Video, Feather, Instagram } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const SellerToolbar: React.FC = () => {
  const { 
    isSellerMode, 
    setIsSellerMode, 
    products, 
    openProductEditor,
    resetProductsToDefault,
    setIsCatalogListOpen,
    reels,
    openTikTokEditor,
    instagramItems,
    openInstagramEditor,
    setIsCraftStoryModalOpen,
    bestsellerThreshold,
    setBestsellerThreshold
  } = useCart();

  const [isMinimized, setIsMinimized] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isSellerMode) return null;

  const handleReset = () => {
    if (confirm('Are you sure you want to restore the default product catalog? Any custom pieces or edits will be reset.')) {
      resetProductsToDefault();
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 2000);
    }
  };

  return (
    <aside 
      aria-label="Seller Studio Mode Controls" 
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 animate-fade-in"
    >
      {/* Minimized Pill */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1C1B1A] text-[#FAF8F5] border border-[#C5A880]/50 rounded-full shadow-xl hover:bg-[#2C2927] transition-all text-xs font-semibold"
          title="Expand Seller Toolbar"
        >
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span>Seller Mode ({products.length})</span>
          <ChevronUp className="w-3.5 h-3.5 text-[#C5A880]" />
        </button>
      ) : (
        /* Expanded Floating Toolbar */
        <div className="bg-[#1C1B1A]/95 text-white border border-[#C5A880]/40 rounded-2xl shadow-2xl p-3.5 sm:p-4 backdrop-blur-md max-w-xs sm:max-w-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              <div>
                <p className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Seller Studio Mode</span>
                  <span className="text-[10px] font-normal text-[#C5A880] bg-[#C5A880]/20 px-1.5 py-0.2 rounded">
                    Seller Only
                  </span>
                </p>
                <p className="text-[10px] text-[#A69E96]">
                  Invisible to buyers • {products.length} active pieces
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 text-[#A69E96] hover:text-white rounded-md"
              title="Minimize toolbar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsCatalogListOpen(true)}
              className="w-full py-2.5 px-3 bg-[#FAF8F5] text-[#1C1B1A] hover:bg-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4 text-[#C5A880]" />
              <span>Manage All Products ({products.length})</span>
            </button>

            {/* Monthly Bestseller Threshold Quick Adjust */}
            <div className="p-2 px-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#D8D2CB] text-[11px]">Monthly Bestseller Goal:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={bestsellerThreshold}
                  onChange={(e) => setBestsellerThreshold(Math.max(1, Number(e.target.value)))}
                  className="w-14 text-center px-1 py-0.5 bg-black/50 border border-[#C5A880]/60 rounded text-xs text-[#E6C687] font-bold focus:outline-none"
                  title="Products with sold count >= this number automatically become Bestsellers"
                />
                <span className="text-[10px] text-[#A69E96]">sold</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openProductEditor(null)}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Add New Piece</span>
            </button>

            <button
              type="button"
              onClick={() => openTikTokEditor(null)}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Manage TikTok Reels ({reels.length})</span>
            </button>

            <button
              type="button"
              onClick={() => openInstagramEditor(null)}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Manage Instagram Journal ({instagramItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCraftStoryModalOpen(true)}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <Feather className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Edit Craft Story & Making Video</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="py-1.5 px-2 bg-white/5 hover:bg-white/10 text-[11px] text-[#D8D2CB] rounded-lg flex items-center justify-center gap-1 border border-white/10 transition-colors"
                title="Reset back to initial factory catalog"
              >
                <RotateCcw className="w-3 h-3 text-[#A69E96]" />
                <span>{resetConfirm ? 'Reset Done' : 'Reset Defaults'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSellerMode(false)}
                className="py-1.5 px-2 bg-white/5 hover:bg-rose-950/40 text-[11px] text-rose-300 rounded-lg flex items-center justify-center gap-1 border border-rose-900/30 transition-colors"
                title="Exit seller mode to view site as customer"
              >
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Exit & Lock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
