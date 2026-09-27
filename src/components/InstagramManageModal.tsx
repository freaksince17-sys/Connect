import React, { useState, useEffect } from 'react';
import { 
  X, 
  Instagram, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  AtSign,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { InstagramJournalItem } from '../types';
import { compressImage } from '../utils/imageCompressor';

export const InstagramManageModal: React.FC = () => {
  const { 
    isInstagramManagerOpen, 
    setIsInstagramManagerOpen, 
    instagramItems, 
    updateInstagramItem, 
    addInstagramItem, 
    deleteInstagramItem, 
    deleteAllInstagramItems,
    products,
    editingInstagramItem,
    setEditingInstagramItem,
    instagramHandle,
    instagramProfileUrl,
    updateInstagramSettings
  } = useCart();

  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'settings'>('list');
  
  // Post editor form states
  const [itemId, setItemId] = useState('');
  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState(instagramHandle || '@artified_np');
  const [postUrl, setPostUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [taggedProductId, setTaggedProductId] = useState('');

  // Global settings state
  const [globalHandleInput, setGlobalHandleInput] = useState(instagramHandle || '@artified_np');
  const [globalUrlInput, setGlobalUrlInput] = useState(instagramProfileUrl || 'https://www.instagram.com/artified_np/');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [instagramFetchMessage, setInstagramFetchMessage] = useState('');
  
  // Inline delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [instagramConnection, setInstagramConnection] = useState({ configured: false, connected: false, username: '', loading: true });
  const [connectionNotice, setConnectionNotice] = useState('');

  useEffect(() => {
    if (!isInstagramManagerOpen) return;
    let cancelled = false;
    fetch('/api/instagram/connection')
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled) setInstagramConnection({ ...result, loading: false });
      })
      .catch(() => {
        if (!cancelled) setInstagramConnection((current) => ({ ...current, loading: false }));
      });
    const connectionResult = new URLSearchParams(window.location.search).get('instagram_connection');
    if (connectionResult === 'connected') setConnectionNotice('Instagram account connected. Auto-fill can now read posts from that account.');
    if (connectionResult === 'failed') setErrorMessage('Instagram could not complete the connection. Check Meta app setup and try again.');
    return () => { cancelled = true; };
  }, [isInstagramManagerOpen]);

  // Helper to extract cover photo thumbnail directly from any video source
  const extractCoverPhotoFromVideo = (videoSource: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = videoSource;

      let resolved = false;
      const capture = () => {
        if (resolved) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 480;
          canvas.height = video.videoHeight || 854;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
            resolved = true;
            resolve(dataUrl);
            return;
          }
        } catch (err) {
          console.warn('Canvas capture error:', err);
        }
        resolve('');
      };

      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
      };

      video.onseeked = () => {
        capture();
      };

      video.onerror = () => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      };

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve('');
        }
      }, 3500);
    });
  };

  // Automatically update cover photo, headline, and caption from tagged product
  const handleAutoFillFromProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // 1. Automatically update cover photo if currently empty
    if (!thumbnail && prod.images && prod.images.length > 0) {
      setThumbnail(prod.images[0]);
    }

    // 2. Automatically update headline
    setTitle(`${prod.title} • Handcrafted in Chikamugal, Kathmandu`);

    // 3. Automatically update caption (referencing store in Chikamugal, Kathmandu)
    const materialsStr = prod.materials && prod.materials.length > 0 
      ? prod.materials.join(', ') 
      : 'lustrous freshwater pearls and artisanal cord';
    const subtitlePart = prod.subtitle ? `${prod.subtitle}. ` : '';
    const generatedCaption = `${subtitlePart}Artisanal elegance handcrafted at our store in Chikamugal, Kathmandu with ${materialsStr}. Individually hand-knotted for lifetime durability and brilliant luster.\n\n✨ Price: NPR ${prod.price.toLocaleString()} (${prod.category})\n📍 Handcrafted at Chikamugal Store, Kathmandu\n🛍️ Tap the piece to shop or message us to order! #ArtifiedNepal #ChikamugalStore #KathmanduCraft`;
    setCaption(generatedCaption);

  };

  const handleAutoGenerateDetails = async () => {
    if (!postUrl.trim()) {
      setErrorMessage('Paste an Instagram post or Reel link first.');
      return;
    }

    setIsGeneratingDetails(true);
    setErrorMessage('');
    setInstagramFetchMessage('');
    try {
      const response = await fetch(`/api/instagram-info?url=${encodeURIComponent(postUrl.trim())}`);
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.error || 'Instagram could not provide details for this post.');
      }

      // Normalize the backend parser's public-page and Graph API response fields.
      const metadata = {
        title: typeof result.title === 'string' ? result.title.trim() : '',
        caption: typeof result.caption === 'string' ? result.caption.trim() : '',
        handle: typeof result.handle === 'string' ? result.handle.trim() : '',
        image: result.image || result.thumbnail || result.thumbnail_url || '',
        video: result.video || result.videoUrl || result.media_url || '',
      };

      const captionHeadline = metadata.caption
        .split(/\r?\n/)
        .map((line: string) => line.replace(/#[\w.]+/g, '').trim())
        .find(Boolean)
        ?.slice(0, 100) || '';
      const fallbackHeadline = `Instagram ${/\/reel\//i.test(postUrl) ? 'Reel' : 'Post'}${metadata.handle ? ` • ${metadata.handle}` : ''}`;
      setTitle(metadata.title || captionHeadline || fallbackHeadline);
      setCaption(metadata.caption);
      setHandle(metadata.handle);
      setVideoUrl(metadata.video);
      let coverImage = metadata.image;
      if (metadata.video) {
        setIsExtractingFrame(true);
        try {
          const frame = await extractCoverPhotoFromVideo(metadata.video);
          coverImage = frame ? await compressImage(frame, 800, 1200, 0.82) : metadata.image;
        } finally {
          setIsExtractingFrame(false);
        }
      }
      setThumbnail(coverImage);
      setInstagramFetchMessage(result.source === 'instagram-embed'
        ? (metadata.image
          ? 'Instagram provided a preview image, but not the caption or video file.'
          : 'Instagram returned only an embed for this post. It did not provide a cover image or video file, so an automatic cover could not be created.')
        : result.source === 'instagram-public-page'
          ? (coverImage
            ? 'Fetched the post details Instagram exposed and selected its cover image.'
            : 'Fetched the post details Instagram exposed, but it did not include a cover image or video stream to create one from.')
          : result.source === 'instagram-public-resolver'
            ? (metadata.video
              ? (coverImage
                ? 'Fetched the post caption and video, selected a cover, and enabled muted hover playback on its journal card.'
                : 'Fetched the post caption and video, but could not create a cover image from its video.')
              : (coverImage ? 'Fetched the post details and selected its cover image.' : 'Fetched the post details, but Instagram did not expose a cover image or video.'))
            : (coverImage ? 'Fetched this post from the connected Instagram account and selected its cover image.' : 'Fetched this post from the connected Instagram account, but it did not provide a cover image or video.'));
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleProductSelect = (prodId: string) => {
    setTaggedProductId(prodId);
    if (prodId) {
      handleAutoFillFromProduct(prodId);
    }
  };

  // When opening for edit
  useEffect(() => {
    if (editingInstagramItem) {
      setItemId(editingInstagramItem.id);
      setTitle(editingInstagramItem.title || '');
      setHandle(editingInstagramItem.handle || instagramHandle || '@artified_np');
      setPostUrl(editingInstagramItem.postUrl || '');
      setCaption(editingInstagramItem.caption || '');
      setThumbnail(editingInstagramItem.thumbnail || '');
      setVideoUrl(editingInstagramItem.videoUrl || '');
      setTaggedProductId(editingInstagramItem.taggedProductId || '');
      setActiveTab('editor');
    } else {
      resetForm();
    }
  }, [editingInstagramItem, isInstagramManagerOpen]);

  // Keep global handle state in sync
  useEffect(() => {
    setGlobalHandleInput(instagramHandle);
    setGlobalUrlInput(instagramProfileUrl);
  }, [instagramHandle, instagramProfileUrl, isInstagramManagerOpen]);

  const resetForm = () => {
    setItemId('');
    setTitle('');
    setHandle(instagramHandle || '@artified_np');
    setPostUrl(instagramProfileUrl || 'https://www.instagram.com/artified_np/');
    setCaption('');
    setThumbnail('');
    setVideoUrl('');
    setTaggedProductId('');
    setErrorMessage('');
  };

  if (!isInstagramManagerOpen) return null;

  const handleCreateNew = () => {
    setEditingInstagramItem(null);
    resetForm();
    setActiveTab('editor');
  };

  const handleEditClick = (item: InstagramJournalItem) => {
    setEditingInstagramItem(item);
    setActiveTab('editor');
  };

  // Custom photo upload with compression
  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = reader.result as string;
      try {
        const compressed = await compressImage(rawBase64, 800, 1200, 0.82);
        setThumbnail(compressed);
      } catch {
        setThumbnail(rawBase64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a post title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const matchedProd = taggedProductId ? products.find((p) => p.id === taggedProductId) : null;
      const savedVideoUrl = videoUrl.includes('/tiktok_videos/') ? '' : videoUrl.trim();

      const payload: InstagramJournalItem = {
        id: itemId || `ig-post-${Date.now()}`,
        title: title.trim(),
        handle: handle.trim(),
        postUrl: postUrl.trim() || instagramProfileUrl,
        caption: caption.trim(),
        thumbnail: thumbnail.trim(),
        ...(savedVideoUrl ? { videoUrl: savedVideoUrl } : {}),
        ...(taggedProductId && matchedProd ? {
          taggedProductId: taggedProductId.trim(),
          taggedProductName: matchedProd.title || 'Handcrafted Artisan Piece',
          taggedProductPrice: matchedProd.price || 0,
        } : {}),
      };

      if (itemId) {
        await updateInstagramItem(payload);
      } else {
        await addInstagramItem(payload);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveTab('list');
        setEditingInstagramItem(null);
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save Instagram item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsSubmitting(true);
    try {
      await deleteAllInstagramItems();
      setShowDeleteAllConfirm(false);
      setEditingInstagramItem(null);
      setActiveTab('list');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err: any) {
      setErrorMessage('Failed to delete all items: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteInstagramItem(id);
      setDeleteConfirmId(null);
      if (editingInstagramItem?.id === id || itemId === id) {
        setEditingInstagramItem(null);
        setActiveTab('list');
      }
    } catch (err: any) {
      setErrorMessage('Failed to delete: ' + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await updateInstagramSettings(globalHandleInput, globalUrlInput);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update Instagram settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E8DFD8] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD8] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-xs">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-semibold text-[#1C1B1A]">
                  Instagram Journal Manager
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4EFEB] text-[#8C7A6B] px-2 py-0.5 rounded-full border border-[#E8DFD8]">
                  Seller Studio
                </span>
              </div>
              <p className="text-xs text-[#736C65]">
                Manage visual journal posts, update your Instagram handle & link, and attach catalog products.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsInstagramManagerOpen(false);
              setEditingInstagramItem(null);
            }}
            className="p-1.5 text-[#8C7A6B] hover:text-[#1C1B1A] rounded-lg hover:bg-[#F4EFEB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E8DFD8] bg-[#F4EFEB]/50 px-4 sm:px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all ${
              activeTab === 'list'
                ? 'bg-white text-[#1C1B1A] border-t-2 border-[#1C1B1A] shadow-xs'
                : 'text-[#8C7A6B] hover:text-[#1C1B1A]'
            }`}
          >
            Your Active Posts ({instagramItems.length})
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'list' || activeTab === 'settings') handleCreateNew();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-white text-[#1C1B1A] border-t-2 border-[#1C1B1A] shadow-xs'
                : 'text-[#8C7A6B] hover:text-[#1C1B1A]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingInstagramItem ? 'Edit Post Details' : 'Add New Instagram Post'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-[#1C1B1A] border-t-2 border-[#1C1B1A] shadow-xs'
                : 'text-[#8C7A6B] hover:text-[#1C1B1A]'
            }`}
          >
            <AtSign className="w-3.5 h-3.5" />
            <span>Handle & Profile Link</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#736C65]">Active Handle:</span>
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8DFD8] text-[11px] font-semibold text-[#1C1B1A] rounded-full flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-[#E1306C]" />
                    {instagramHandle}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-xs text-[#8C7A6B] hover:text-[#1C1B1A] underline transition-colors"
                  >
                    Edit Handle / Link
                  </button>

                  {instagramItems.length > 0 && (
                    <>
                      {showDeleteAllConfirm ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg">
                          <span className="text-[11px] text-rose-700 font-semibold">Delete all?</span>
                          <button
                            type="button"
                            onClick={handleDeleteAll}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                          >
                            Yes, Delete All
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteAllConfirm(false)}
                            className="px-1 text-[10px] text-zinc-600 hover:text-black"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteAllConfirm(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                          title="Delete all existing journal entries"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete All Journals</span>
                        </button>
                      )}
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1B1A] text-white rounded-lg text-xs font-semibold hover:bg-[#34312F] shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Add Instagram Post</span>
                  </button>
                </div>
              </div>

              {instagramItems.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#D5C7BC] rounded-2xl bg-white/50 p-6">
                  <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto mb-3 text-[#8C7A6B]">
                    <Instagram className="w-6 h-6 text-[#E1306C]" />
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[#1C1B1A]">No Instagram Journal Posts Yet</h4>
                  <p className="text-xs text-[#736C65] max-w-sm mx-auto mt-1 mb-4">
                    All existing journals have been deleted. You can link fresh posts from your Instagram account ({instagramHandle}) or auto-generate posts from your catalog products.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    {products.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleCreateNew();
                          handleProductSelect(products[0].id);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c29f2e] text-[#1C1B1A] rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Create from {products[0].title.slice(0, 20)}...</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1B1A] text-white rounded-lg text-xs font-semibold hover:bg-[#34312F] shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Journal Post</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {instagramItems.map((item) => {
                    const isConfirming = deleteConfirmId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-[#E8DFD8] rounded-xl p-3 flex gap-3 shadow-xs hover:border-[#8C7A6B] transition-all group relative cursor-pointer"
                        onClick={() => handleEditClick(item)}
                      >
                        {/* Thumbnail without metric badges */}
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-black shrink-0 relative flex items-center justify-center">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-1 text-center">
                              <Instagram className="w-5 h-5 text-[#E1306C] mb-1" />
                              <span className="text-[8px] text-zinc-400">No Photo</span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Instagram className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[10px] font-semibold text-[#8C7A6B] truncate">
                                {item.handle || instagramHandle}
                              </span>
                              
                              {/* Inline Delete Button */}
                              <div onClick={(e) => e.stopPropagation()}>
                                {isConfirming ? (
                                  <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 p-1 rounded">
                                    <button
                                      type="button"
                                      onClick={(e) => handleConfirmDelete(item.id, e)}
                                      className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded hover:bg-rose-700"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="text-[10px] text-zinc-600 hover:text-black px-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="text-zinc-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                                    title="Delete post"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xs font-semibold text-[#1C1B1A] line-clamp-2 mt-1 leading-snug">
                              {item.title}
                            </h4>

                            <p className="text-[10px] text-[#736C65] line-clamp-1 mt-0.5">
                              {item.caption}
                            </p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-[#F4EFEB] flex items-center justify-between text-[10px]">
                            <span className="text-[#554E48] truncate pr-2">
                              {item.taggedProductId && item.taggedProductName ? (
                                <>🛍️ {item.taggedProductName}</>
                              ) : (
                                <span className="text-[#A39990] italic">None (No product)</span>
                              )}
                            </span>
                            <span className="font-semibold text-[#8C7A6B] group-hover:text-[#1C1B1A] flex items-center gap-0.5 shrink-0">
                              Edit <Edit3 className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: POST EDITOR */}
          {activeTab === 'editor' && (
            <form onSubmit={handleSaveItem} className="space-y-4">
              
              <div className="p-3 bg-[#EAE0D5]/50 border border-[#D5C7BC] rounded-xl flex items-start gap-2.5 text-xs text-[#4A423B]">
                <Sparkles className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1B1A]">Instagram Journal Entry:</p>
                  <p className="text-[11px] text-[#554E48] mt-0.5 leading-relaxed">
                    Set up your Instagram post with high-resolution imagery, captivating atelier storytelling, and direct links to your product catalog.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Saved to Cloud Firestore and live across all devices!</span>
                </div>
              )}

              {/* Product Auto-Fill & Tagging Section */}
              <div className="p-3.5 bg-gradient-to-r from-[#FAF8F5] to-[#F4EFEB] border border-[#D5C7BC] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <label className="block text-xs font-semibold text-[#1C1B1A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Tag Product (Auto-updates Cover Photo, Headline & Caption)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {taggedProductId ? (
                      <button
                        type="button"
                        onClick={() => handleProductSelect('')}
                        className="text-[10px] font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 shadow-2xs hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Set to None (Do not tag any product)"
                      >
                        <X className="w-2.5 h-2.5" />
                        <span>Select None</span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => { void handleAutoGenerateDetails().catch((error: any) => setErrorMessage(error.message || 'Could not fetch Instagram details.')); }}
                      disabled={isGeneratingDetails}
                      className="text-[10px] font-bold text-[#8C7A6B] hover:text-[#1C1B1A] flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D5C7BC] shadow-2xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      title="Fetch the caption, cover photo, and video from this Instagram post"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span>{isGeneratingDetails ? 'Fetching Instagram post…' : 'Auto-Generate Details'}</span>
                    </button>
                  </div>
                </div>

                <select
                  value={taggedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A] font-medium"
                >
                  <option value="">None (No product tagged / Standalone Reel)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — NPR {p.price.toLocaleString()} ({p.category})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#736C65]">
                  Selecting any product auto-fills the photo, headline & caption. You can select "None" or edit anything anytime!
                </p>
              </div>

              {/* Post URL */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                  Instagram Post / Reel URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={postUrl}
                      onChange={(e) => {
                        setPostUrl(e.target.value);
                        setErrorMessage('');
                        setInstagramFetchMessage('');
                      }}
                      placeholder="https://www.instagram.com/p/... or https://www.instagram.com/reel/..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A]"
                    />
                  </div>
                  {postUrl && (
                    <a
                      href={postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-white border border-[#D5C7BC] hover:border-[#1C1B1A] rounded-lg text-xs font-semibold text-[#1C1B1A] flex items-center gap-1.5 transition-colors"
                      title="Open link in new tab"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    </a>
                  )}
                </div>
                {instagramFetchMessage && (
                  <p role="status" className="mt-1.5 text-[10px] text-emerald-800">{instagramFetchMessage}</p>
                )}
              </div>

              {/* Title & Author Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1C1B1A]">
                      Journal Headline / Title *
                    </label>
                    <span className="text-[9px] text-[#736C65]">Editable</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Maya Aurelia Pearl Bag • Handcrafted in Nepal"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Author Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@artified_np"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A]"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1C1B1A]">
                    Story Caption / Excerpt
                  </label>
                  <span className="text-[9px] text-[#736C65]">Editable</span>
                </div>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share the artisanal details, artisan craftsmanship, or customer styling notes..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A] resize-none"
                />
              </div>

              {/* Cover photo is fetched from Instagram or captured from the source video. */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#1C1B1A]">
                    Cover Photo / Artwork *
                  </label>
                  <span className="text-[9px] text-[#736C65]">Editable</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {/* Photo Preview Box */}
                  <div className="w-24 h-32 rounded-xl border border-[#D5C7BC] overflow-hidden bg-black/5 relative shrink-0 flex items-center justify-center">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setThumbnail('')}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8C7A6B] p-2 text-center">
                        <ImageIcon className="w-6 h-6 mb-1 text-[#C5A880]" />
                        <span className="text-[9px] text-[#A39990]">Paste a post link to fill</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* File Upload Button */}
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D5C7BC] hover:border-[#1C1B1A] rounded-lg text-xs font-medium text-[#1C1B1A] cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#8C7A6B]" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Or Image URL */}
                    <div>
                      <span className="text-[10px] text-[#8C7A6B] block mb-0.5">
                        {isExtractingFrame ? 'Creating a cover frame from the Instagram video…' : 'Or paste a direct image URL:'}
                      </span>
                      <input
                        type="url"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD8]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingInstagramItem(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#736C65] hover:text-[#1C1B1A] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1C1B1A] hover:bg-[#34312F] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{itemId ? 'Update Journal Post' : 'Save & Publish Post'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SETTINGS (HANDLE & PROFILE LINK) */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-3 bg-white border border-[#E8DFD8] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#1C1B1A]">Connect the Artified_np Instagram account</p>
                    <p className="text-[11px] text-[#736C65] mt-0.5">
                      {instagramConnection.loading ? 'Checking connection…' : instagramConnection.connected
                        ? `Connected as @${instagramConnection.username || 'Instagram account'}`
                        : instagramConnection.configured
                          ? 'Meta will ask you to approve read access to this account’s posts.'
                          : 'Meta app setup is required before Instagram can show its permission screen.'}
                    </p>
                  </div>
                  {instagramConnection.connected && <span className="text-[10px] font-semibold text-emerald-800">Connected</span>}
                </div>
                {connectionNotice && <p role="status" className="text-[11px] text-emerald-800">{connectionNotice}</p>}
                {instagramConnection.configured && !instagramConnection.connected && (
                  <a href="/api/instagram/connect" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1B1A] text-white rounded-lg text-xs font-semibold">
                    <Instagram className="w-3.5 h-3.5" /> Connect Instagram
                  </a>
                )}
              </div>

              <div className="p-3 bg-gradient-to-r from-[#FAF0E6] to-[#F4EFEB] border border-[#E8DFD8] rounded-xl flex items-start gap-2.5 text-xs text-[#4A423B]">
                <Instagram className="w-4 h-4 text-[#E1306C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1C1B1A]">Official Instagram Handle & Link:</p>
                  <p className="text-[11px] text-[#554E48] mt-0.5 leading-relaxed">
                    Updating this here will update all links, buttons, and badges across the entire website (headers, footers, showcase bars, and follow buttons).
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instagram handle and link updated successfully across all devices!</span>
                </div>
              )}

              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E8DFD8]">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Instagram Handle (Username)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={globalHandleInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGlobalHandleInput(val);
                        // Auto-fill profile URL if it matches standard Instagram pattern
                        const clean = val.replace('@', '').trim();
                        if (clean) {
                          setGlobalUrlInput(`https://www.instagram.com/${clean}/`);
                        }
                      }}
                      placeholder="@artified_np"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A] font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-[#736C65] mt-1">
                    Include '@' (e.g. <code>@artified_np</code>)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1B1A] mb-1">
                    Official Instagram Profile Link (URL)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        value={globalUrlInput}
                        onChange={(e) => setGlobalUrlInput(e.target.value)}
                        placeholder="https://www.instagram.com/artified_np/"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D5C7BC] rounded-lg focus:outline-hidden focus:border-[#1C1B1A]"
                      />
                    </div>
                    {globalUrlInput && (
                      <a
                        href={globalUrlInput}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white border border-[#D5C7BC] hover:border-[#1C1B1A] rounded-lg text-xs font-semibold text-[#1C1B1A] flex items-center gap-1.5 transition-colors shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3 text-[#8C7A6B]" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-[#736C65] mt-1">
                    Direct web URL opened when customers click "Follow on Instagram" or click any post.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E8DFD8]">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-xs font-semibold text-[#736C65] hover:text-[#1C1B1A] transition-colors"
                >
                  Back to Posts List
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#1C1B1A] hover:bg-[#34312F] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Save Handle & Profile Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
