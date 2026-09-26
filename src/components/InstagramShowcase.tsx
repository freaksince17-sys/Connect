import React, { useState } from 'react';
import { 
  Instagram, 
  ExternalLink, 
  Play, 
  Share2, 
  X, 
  Sparkles, 
  ShoppingBag,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { InstagramJournalItem } from '../types';

export interface InstagramShowcaseProps {
  embedded?: boolean;
  hideHeader?: boolean;
}

export const InstagramShowcase: React.FC<InstagramShowcaseProps> = ({ embedded = false, hideHeader = false }) => {
  const { 
    setQuickViewProduct, 
    products, 
    isSellerMode,
    instagramItems,
    instagramHandle,
    instagramProfileUrl,
    openInstagramEditor,
    deleteInstagramItem
  } = useCart();

  const [activeItem, setActiveItem] = useState<InstagramJournalItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(instagramProfileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteInstagramItem(id);
      setDeleteConfirmId(null);
      if (activeItem?.id === id) {
        setActiveItem(null);
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  return (
    <section 
      id="instagram-section" 
      className={`py-8 sm:py-12 bg-[#FAF8F5] ${embedded ? '' : 'border-t border-[#E8DFD8]'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header - Matching "As Seen On TikTok" Layout & Aesthetics */}
        {!hideHeader && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#C5A880] text-xs uppercase tracking-[0.25em] font-semibold mb-2">
                <span className="w-6 h-[1px] bg-[#C5A880]" />
                <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>INSTAGRAM JOURNAL • {instagramHandle.toUpperCase()}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1B1A] font-semibold">
                Instagram Journal
              </h2>
              <p className="text-xs sm:text-sm text-[#736C65] mt-1.5 max-w-lg">
                Discover real customer unboxings, slow-motion pearl shine tests, and wedding styling guides straight from our studio in Patan.
              </p>
            </div>

            {/* Direct Link to Instagram Button & Seller Controls */}
            <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
              {isSellerMode && (
                <button
                  type="button"
                  onClick={() => openInstagramEditor(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4AF37] text-[#1C1B1A] text-xs font-bold tracking-wider uppercase hover:bg-[#c29f2e] transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage Instagram Journal ({instagramItems.length})</span>
                </button>
              )}

              <a
                href={instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1B1A] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#34312F] transition-all shadow-xs group"
              >
                <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>Follow {instagramHandle}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        )}

        {/* Video & Posts Grid - Empty State or Grid (without views/likes badges) */}
        {instagramItems.length === 0 ? (
          <div className="py-12 sm:py-16 px-6 text-center max-w-lg mx-auto bg-white rounded-3xl border border-[#E8DFD8] shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
              <Instagram className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#1C1B1A] font-semibold mb-2">
              Instagram Journal
            </h3>
            <p className="text-xs sm:text-sm text-[#736C65] leading-relaxed mb-6">
              Connect with us directly on Instagram <span className="font-semibold text-[#1C1B1A]">{instagramHandle}</span> for behind-the-scenes beadweaving in Patan, new drops, and customer unboxings.
            </p>
            {isSellerMode && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => openInstagramEditor(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#1C1B1A] text-xs font-bold uppercase tracking-wider hover:bg-[#c29f2e] transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Journal Entry</span>
                </button>
              </div>
            )}
            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#C5A880] hover:text-[#1C1B1A] transition-colors"
            >
              <span>Visit @{instagramHandle.replace('@', '')} on Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {instagramItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Media Image Thumbnail */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Instagram Logo Badge / Seller Controls Top Right */}
                <div className="absolute top-3 right-3 z-20" onClick={(e) => e.stopPropagation()}>
                {isSellerMode ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openInstagramEditor(item)}
                      className="p-1.5 rounded-full bg-black/60 hover:bg-[#D4AF37] text-white hover:text-[#1C1B1A] transition-colors cursor-pointer shadow-xs"
                      title="Edit this post"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === item.id ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors shadow-xs"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer shadow-xs"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Instagram className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 group-hover:scale-110 group-hover:bg-white/50 transition-all">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Card Footer Information */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-10 flex flex-col justify-end">
                <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-snug drop-shadow-md">
                  {item.title}
                </h3>

                {/* Tagged Product pill if available */}
                {item.taggedProductId && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-[#D4AF37] font-medium truncate">
                    <ShoppingBag className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.taggedProductName}</span>
                  </div>
                )}

                {/* Direct Link indicator */}
                <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80">
                  <span className="text-[10px] text-[#A69E96]">{item.handle || instagramHandle}</span>
                  <span className="text-[10px] font-semibold text-[#D4AF37] group-hover:underline flex items-center gap-0.5">
                    View on Instagram <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom CTA Card - Direct Link to Instagram Page */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFD8] text-center shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8DFD8] flex items-center justify-center mx-auto text-[#E1306C]">
            <Instagram className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-xl sm:text-2xl text-[#1C1B1A] font-semibold">
            Follow {instagramHandle} on Instagram
          </h3>

          <p className="text-xs sm:text-sm text-[#736C65] max-w-md mx-auto leading-relaxed">
            Stay updated with daily workshop clips, fresh product drops, customer reviews, and handcrafted pearl creations directly from Chikamugal, Kathmandu.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            {isSellerMode && (
              <button
                type="button"
                onClick={() => openInstagramEditor(null)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4AF37] text-[#1C1B1A] text-xs font-bold tracking-wider uppercase hover:bg-[#c29f2e] shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Journal Posts</span>
              </button>
            )}

            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#1C1B1A] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#34312F] shadow-sm transition-all group"
            >
              <Instagram className="w-4 h-4 text-[#E1306C]" />
              <span>Visit Official Instagram Page</span>
              <ExternalLink className="w-4 h-4 text-[#C5A880] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

      </div>

      {/* Item Detail Modal - Styled exactly like TikTok Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0"
            onClick={() => setActiveItem(null)}
          />

          <div className="relative bg-[#1C1B1A] text-white w-full max-w-3xl rounded-3xl overflow-hidden border border-[#34312F] shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left Media (Portrait Video Thumbnail) */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[350px]">
              <img
                src={activeItem.thumbnail}
                alt={activeItem.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover max-h-[550px]"
              />

              {/* Play Badge */}
              <a
                href={activeItem.postUrl || instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                title="Play on Instagram"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:scale-110 group-hover:bg-white/40 transition-all">
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                </div>
              </a>
            </div>

            {/* Right Information & Action Pane */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between bg-[#1C1B1A]">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-[#1C1B1A] flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeItem.handle || instagramHandle}</h4>
                      <span className="text-[10px] text-[#A69E96]">Kathmandu, Nepal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSellerMode && (
                      <button
                        type="button"
                        onClick={() => {
                          const toEdit = activeItem;
                          setActiveItem(null);
                          openInstagramEditor(toEdit);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4AF37] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Post</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveItem(null)}
                      className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Title & Caption */}
                <div className="py-4 space-y-3">
                  <h3 className="font-serif text-lg font-semibold text-white leading-snug">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-[#D5C7BC] leading-relaxed">
                    {activeItem.caption}
                  </p>
                </div>

                {/* Tagged Product Box */}
                {activeItem.taggedProductId && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 my-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                        Featured Piece
                      </span>
                      <h5 className="text-xs font-semibold text-white">
                        {activeItem.taggedProductName}
                      </h5>
                      <span className="text-xs text-[#D4AF37] font-medium">
                        NPR {activeItem.taggedProductPrice?.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const p = products.find(prod => prod.id === activeItem.taggedProductId);
                        if (p) {
                          setActiveItem(null);
                          setQuickViewProduct(p);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#1C1B1A] rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Shop Piece
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-xs text-[#A69E96] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
                  </button>

                  <span className="text-[11px] text-[#A69E96]">
                    Kathmandu Studio
                  </span>
                </div>

                {/* Direct Link to Instagram */}
                <a
                  href={activeItem.postUrl || instagramProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#1C1B1A] text-xs font-bold uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Instagram className="w-4 h-4 text-[#1C1B1A]" />
                  <span>Open on Instagram ({activeItem.handle || instagramHandle})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1C1B1A]" />
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
