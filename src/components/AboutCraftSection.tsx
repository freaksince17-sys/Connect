import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  Eye, 
  Award, 
  Edit3, 
  Play, 
  Pause,
  X, 
  ExternalLink,
  Video,
  Feather,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { DEFAULT_CRAFT_STORY } from '../data/products';

export const AboutCraftSection: React.FC = () => {
  const { 
    craftStory, 
    isSellerMode, 
    setIsCraftStoryModalOpen 
  } = useCart();

  const story = craftStory || DEFAULT_CRAFT_STORY;
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalMuted, setIsModalMuted] = useState(false);
  const [modalVideoError, setModalVideoError] = useState(false);
  const [modalReloadKey, setModalReloadKey] = useState(0);

  const hoverVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Helper to extract TikTok Video ID from a URL
  const getTikTokVideoId = (url?: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/video\/(\d+)/) || url.match(/\/v\/(\d+)/) || url.match(/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const isDirectVideo = (url?: string): boolean => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('blob:');
  };

  const getPlayableVideoUrl = (url?: string): string | null => {
    if (!url) return null;
    if (isDirectVideo(url)) return url;
    const ttId = getTikTokVideoId(url);
    if (ttId) {
      return `/api/tiktok-video/${ttId}?url=${encodeURIComponent(url)}`;
    }
    return null;
  };

  const videoId = getTikTokVideoId(story.videoUrl);
  const playableUrl = getPlayableVideoUrl(story.videoUrl);
  const hasImage1 = Boolean(story.image1 && story.image1.trim());
  const hasImage2 = Boolean(story.image2 && story.image2.trim());

  useEffect(() => {
    if (isPlayingVideo) {
      setModalVideoError(false);
    }
  }, [isPlayingVideo]);

  return (
    <section id="craft-section" className="py-14 sm:py-20 bg-white border-b border-[#E8DFD8] relative">
      
      {/* Floating Seller Edit Button if in Seller Studio Mode */}
      {isSellerMode && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20">
          <button
            type="button"
            onClick={() => setIsCraftStoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1B1A] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-semibold shadow-md hover:bg-[#34312F] transition-all hover:scale-105"
            title="Edit this Craft Story section"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Craft Story</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Photography & Making Video Collage */}
          <div className="lg:col-span-5 relative">
            
            {/* Case A: Both images exist */}
            {hasImage1 && hasImage2 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column: Photo 1 + Stat 1 */}
                <div className="space-y-3 sm:space-y-4">
                  <div 
                    onMouseEnter={() => {
                      setIsHovered(true);
                      if (hoverVideoRef.current) {
                        hoverVideoRef.current.play().catch(() => {});
                      }
                    }}
                    onMouseLeave={() => {
                      setIsHovered(false);
                      if (hoverVideoRef.current) {
                        hoverVideoRef.current.pause();
                      }
                    }}
                    className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8DFD8] shadow-xs relative group cursor-pointer"
                  >
                    <img
                      src={story.image1}
                      alt="Handmade bead weaving in Kathmandu"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Video Preview */}
                    {playableUrl && (
                      <video
                        ref={hoverVideoRef}
                        src={playableUrl}
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    )}

                    {story.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setIsPlayingVideo(true)}
                        className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex flex-col items-center justify-center transition-colors text-white"
                        title="Watch making video"
                      >
                        <div className="w-11 h-11 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white border border-white/60 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#1C1B1A] transition-all shadow-md">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <span className="text-[10px] font-semibold tracking-wider uppercase mt-2 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
                          {isHovered ? 'Playing • Click for Sound' : 'Watch Making'}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] text-center">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat1Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium">{story.stat1Label}</p>
                  </div>
                </div>

                {/* Right Column: Stat 2 + Photo 2 */}
                <div className="space-y-3 sm:space-y-4 pt-6">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] text-center">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat2Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium">{story.stat2Label}</p>
                  </div>

                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8DFD8] shadow-xs relative group">
                    <img
                      src={story.image2}
                      alt="Natural materials & craft detailing"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Case B: Only one image exists (Photo 1 or Photo 2) */}
            {((hasImage1 && !hasImage2) || (!hasImage1 && hasImage2)) && (
              <div className="space-y-4">
                <div 
                  onMouseEnter={() => {
                    setIsHovered(true);
                    if (hoverVideoRef.current) {
                      hoverVideoRef.current.play().catch(() => {});
                    }
                  }}
                  onMouseLeave={() => {
                    setIsHovered(false);
                    if (hoverVideoRef.current) {
                      hoverVideoRef.current.pause();
                    }
                  }}
                  className="aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8DFD8] shadow-sm relative group cursor-pointer"
                >
                  <img
                    src={hasImage1 ? story.image1 : story.image2}
                    alt="Artified craft detail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Hover Video Preview */}
                  {playableUrl && (
                    <video
                      ref={hoverVideoRef}
                      src={playableUrl}
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  )}

                  {story.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(true)}
                      className="absolute inset-0 bg-black/20 group-hover:bg-black/30 flex flex-col items-center justify-center transition-colors text-white"
                      title="Watch making video"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-white border border-white/60 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-[#1C1B1A] transition-all shadow-md">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <span className="text-xs font-semibold tracking-wider uppercase mt-2.5 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                        {isHovered ? 'Playing • Click for Sound' : 'Watch Making Video'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Dual Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] text-center">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat1Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium">{story.stat1Label}</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD8] text-center">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat2Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium">{story.stat2Label}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Case C: User deleted both images */}
            {!hasImage1 && !hasImage2 && (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-[#F4EFEB] border border-[#E8DFD8] shadow-xs space-y-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1C1B1A] text-[#D4AF37] flex items-center justify-center shadow-md">
                  <Feather className="w-7 h-7" />
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1C1B1A]">
                    Artisanal Kathmandu Atelier
                  </h3>
                  <p className="text-xs text-[#736C65] mt-1.5 max-w-xs mx-auto">
                    Slow fashion hand-threaded by local women artisans in Lalitpur and Bhaktapur.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-white rounded-xl border border-[#E8DFD8] text-center shadow-xs">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat1Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium mt-0.5">{story.stat1Label}</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-[#E8DFD8] text-center shadow-xs">
                    <span className="font-serif text-2xl font-bold text-[#1C1B1A]">{story.stat2Number}</span>
                    <p className="text-[10px] uppercase tracking-wider text-[#736C65] font-medium mt-0.5">{story.stat2Label}</p>
                  </div>
                </div>

                {story.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setIsPlayingVideo(true)}
                    className="w-full py-3 bg-[#1C1B1A] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#34312F] transition-all shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                    <span>{story.videoButtonLabel || "Watch How It's Handcrafted"}</span>
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Right: Editorial Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD8] text-[10px] tracking-[0.2em] font-bold uppercase text-[#8C7A6B]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>{story.badge}</span>
              </div>

              {/* Quick Seller Edit Trigger */}
              {isSellerMode && (
                <button
                  type="button"
                  onClick={() => setIsCraftStoryModalOpen(true)}
                  className="text-[11px] text-[#8C7A6B] hover:text-[#1C1B1A] underline font-medium"
                >
                  Edit text & photos
                </button>
              )}
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1C1B1A] font-medium leading-tight">
              {story.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#5E5955] leading-relaxed">
              {story.paragraph1}
            </p>

            <p className="text-xs sm:text-sm text-[#5E5955] leading-relaxed">
              {story.paragraph2}
            </p>

            {/* If making video exists, feature a dedicated Watch Button */}
            {story.videoUrl && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsPlayingVideo(true)}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1C1B1A] text-white text-xs font-semibold hover:bg-[#34312F] transition-all shadow-sm hover:scale-[1.02]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1C1B1A]">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                  <span>{story.videoButtonLabel || "Watch How It's Handcrafted"}</span>
                  <span className="text-[10px] text-[#C5A880] border-l border-white/20 pl-2">on TikTok</span>
                </button>
              </div>
            )}

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F0EBE5]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1B1A]">
                  <HeartHandshake className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>{story.pillar1Title}</span>
                </div>
                <p className="text-[11px] text-[#736C65] leading-normal">
                  {story.pillar1Desc}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1B1A]">
                  <Award className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>{story.pillar2Title}</span>
                </div>
                <p className="text-[11px] text-[#736C65] leading-normal">
                  {story.pillar2Desc}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1B1A]">
                  <Eye className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>{story.pillar3Title}</span>
                </div>
                <p className="text-[11px] text-[#736C65] leading-normal">
                  {story.pillar3Desc}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Video Making Popup Modal */}
      {isPlayingVideo && story.videoUrl && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[90vh] bg-[#1C1B1A] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between">
            
            {/* Native Video Player or TikTok Embed or Fallback */}
            {playableUrl && !modalVideoError ? (
              <>
                <div className="absolute inset-0 w-full h-full bg-black">
                  <video
                    ref={modalVideoRef}
                    key={`modal-craft-${modalReloadKey}`}
                    src={playableUrl}
                    poster={story.image1 || story.image2}
                    autoPlay
                    muted={isModalMuted}
                    loop
                    playsInline
                    controls
                    onError={() => {
                      console.warn('Craft story native video playback failed, falling back to embed');
                      setModalVideoError(true);
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Top overlay controls */}
                <div className="relative z-30 p-3 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 to-transparent">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span>Making Story</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsModalMuted(!isModalMuted)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-medium shadow-md transition-all ${
                        !isModalMuted
                          ? 'bg-[#D4AF37] text-[#1C1B1A] border-[#D4AF37]'
                          : 'bg-black/70 text-white hover:bg-black border-white/20'
                      }`}
                      title={isModalMuted ? 'Unmute Audio' : 'Mute Audio'}
                    >
                      {isModalMuted ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                          <span>Unmute</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          <span>Sound ON</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (modalVideoRef.current) {
                          modalVideoRef.current.currentTime = 0;
                          modalVideoRef.current.play().catch(() => {});
                        } else {
                          setModalReloadKey((k) => k + 1);
                        }
                      }}
                      className="p-1.5 rounded-full bg-black/70 text-[#D4AF37] hover:bg-black border border-white/20 backdrop-blur-md"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {story.videoUrl && (
                      <a
                        href={story.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1C1B1A]/85 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/50 backdrop-blur-md text-[10px] font-medium shadow-md"
                        title="Open on TikTok"
                      >
                        <span>TikTok</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => setIsPlayingVideo(false)}
                      className="p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black border border-white/20"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : videoId ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${videoId}?lang=en-US`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={story.title}
                />
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-black">
                <Video className="w-12 h-12 text-[#D4AF37] mb-3" />
                <h4 className="font-serif text-lg font-semibold">{story.title}</h4>
                <p className="text-xs text-[#A69E96] mt-2 mb-4">
                  Watch our craft story directly on TikTok.
                </p>
                <a
                  href={story.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-white text-[#1C1B1A] rounded-full text-xs font-semibold flex items-center gap-2"
                >
                  <span>Open on TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
