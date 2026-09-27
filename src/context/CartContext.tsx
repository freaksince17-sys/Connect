import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, DeliveryZone, OrderDetails, TikTokReel, CraftStoryData, InstagramJournalItem, ProductReviewItem } from '../types';
import { 
  DELIVERY_ZONES, 
  PRODUCTS, 
  TIKTOK_REELS, 
  DEFAULT_CRAFT_STORY,
  DEFAULT_INSTAGRAM_ITEMS,
  DEFAULT_INSTAGRAM_HANDLE,
  DEFAULT_INSTAGRAM_PROFILE_URL
} from '../data/products';
import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  getDocFromServer 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { compressImage } from '../utils/imageCompressor';
import { sanitizeForFirestore } from '../utils/firestoreSanitizer';
import { sanitizeReviewItem } from '../utils/productStats';

export type AppNavTab = 'home' | 'tiktok' | 'journal' | 'craft' | 'track';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, customizationNote?: string, selectedColorOrStyle?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  giftPackagingFee: number;
  discount: number;
  total: number;
  selectedDeliveryZone: DeliveryZone;
  setSelectedDeliveryZone: (zone: DeliveryZone) => void;
  giftPackaging: boolean;
  setGiftPackaging: (val: boolean) => void;
  giftMessage: string;
  setGiftMessage: (val: string) => void;
  orderNote: string;
  setOrderNote: (val: string) => void;
  promoCode: string;
  promoError: string | null;
  promoSuccess: string | null;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  quickViewProduct: Product | null;
  quickViewProducts: Product[];
  setQuickViewProduct: (product: Product | null, productList?: Product[]) => void;
  activeReel: TikTokReel | null;
  setActiveReel: (reel: TikTokReel | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  completedOrder: OrderDetails | null;
  setCompletedOrder: (order: OrderDetails | null) => void;
  isTrackerOpen: boolean;
  setIsTrackerOpen: (open: boolean) => void;
  trackingOrderId: string;
  setTrackingOrderId: (id: string) => void;
  openTracker: (orderId?: string) => void;
  // Seller / Atelier Mode (Invisible to regular buyers)
  products: Product[];
  updateProduct: (updated: Product) => Promise<void>;
  addProduct: (newProduct: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProductsToDefault: () => Promise<void>;
  isSellerMode: boolean;
  setIsSellerMode: (val: boolean) => void;
  isSellerAuthModalOpen: boolean;
  setIsSellerAuthModalOpen: (val: boolean) => void;
  isSellerModalOpen: boolean;
  setIsSellerModalOpen: (val: boolean) => void;
  isCatalogListOpen: boolean;
  setIsCatalogListOpen: (val: boolean) => void;
  isReviewManagerOpen: boolean;
  setIsReviewManagerOpen: (val: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  openProductEditor: (product?: Product | null) => void;
  duplicateProduct: (id: string) => Promise<void>;
  toggleProductStock: (id: string) => Promise<void>;
  toggleProductNewArrival: (id: string) => Promise<void>;
  batchSetNewArrival: (ids: string[], isNew: boolean) => Promise<void>;
  // TikTok Reels Management
  reels: TikTokReel[];
  isTikTokManagerOpen: boolean;
  setIsTikTokManagerOpen: (val: boolean) => void;
  editingReel: TikTokReel | null;
  setEditingReel: (reel: TikTokReel | null) => void;
  openTikTokEditor: (reel?: TikTokReel | null) => void;
  updateReel: (reel: TikTokReel) => Promise<void>;
  addReel: (reel: TikTokReel) => Promise<void>;
  deleteReel: (id: string) => Promise<void>;
  // Craft Story & Making Video
  craftStory: CraftStoryData;
  updateCraftStory: (newData: CraftStoryData) => Promise<void>;
  isCraftStoryModalOpen: boolean;
  setIsCraftStoryModalOpen: (val: boolean) => void;
  // Instagram Journal & Handle Management
  instagramItems: InstagramJournalItem[];
  instagramHandle: string;
  instagramProfileUrl: string;
  isInstagramManagerOpen: boolean;
  setIsInstagramManagerOpen: (val: boolean) => void;
  editingInstagramItem: InstagramJournalItem | null;
  setEditingInstagramItem: (item: InstagramJournalItem | null) => void;
  openInstagramEditor: (item?: InstagramJournalItem | null) => void;
  updateInstagramItem: (item: InstagramJournalItem) => Promise<void>;
  addInstagramItem: (item: InstagramJournalItem) => Promise<void>;
  deleteInstagramItem: (id: string) => Promise<void>;
  deleteAllInstagramItems: () => Promise<void>;
  updateInstagramSettings: (handle: string, profileUrl?: string) => Promise<void>;
  // Main Application Multi-Tab Horizontal Navigation
  activeNavTab: AppNavTab;
  setActiveNavTab: (tab: AppNavTab) => void;
  // Social Media Showcase Tab
  activeSocialTab: 'tiktok' | 'journal';
  setActiveSocialTab: (tab: 'tiktok' | 'journal') => void;
  // Real-time Cloud Sync
  isCloudSynced: boolean;
  syncStatusText: string;
  forceSyncAllToCloud: () => Promise<void>;
  // Product Card Image Display Mode (contain = full piece visible without cropping, cover = edge-to-edge fill)
  productImageFit: 'contain' | 'cover';
  setProductImageFit: (fit: 'contain' | 'cover') => void;
  // Automated Monthly Bestseller Threshold & Live Online Sales Tracking
  bestsellerThreshold: number;
  setBestsellerThreshold: (val: number) => void;
  recordOnlineOrderSales: (items: CartItem[]) => Promise<void>;
  addProductReview: (productId: string, review: ProductReviewItem) => Promise<void>;
  saveProductReviews: (reviewsByProduct: Record<string, ProductReviewItem[]>) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GIFT_PACKAGING_COST = 150; // NPR

// Category-appropriate default fallbacks if an image is completely missing or broken
const CATEGORY_FALLBACKS: Record<string, string> = {
  'pearl-bags': 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
  'pearl-necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
  'macrame': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
  'accessories': 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=900&q=80',
  'custom-beaded': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
};

// Helper to sanitize product images so they never point to broken ephemeral /uploads/
const sanitizeProduct = (prod: Product): Product => {
  const fallback = CATEGORY_FALLBACKS[prod.category] || CATEGORY_FALLBACKS['pearl-bags'];
  
  const cleanImages = (prod.images || [])
    .map((img) => {
      if (typeof img === 'string' && img.startsWith('/uploads/')) {
        return fallback;
      }
      return img;
    })
    .filter((img) => typeof img === 'string' && img.trim() !== '');

  return {
    ...prod,
    images: cleanImages.length > 0 ? cleanImages : [fallback]
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('artified_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('artified_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<DeliveryZone>(DELIVERY_ZONES[0]);
  const [giftPackaging, setGiftPackaging] = useState<boolean>(false);
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [quickViewProduct, setQuickViewProductState] = useState<Product | null>(null);
  const [quickViewProducts, setQuickViewProducts] = useState<Product[]>([]);
  const [activeReel, setActiveReel] = useState<TikTokReel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedOrder, setCompletedOrderState] = useState<OrderDetails | null>(null);

  // TikTok Reels State
  const [reels, setReels] = useState<TikTokReel[]>(() => {
    try {
      const saved = localStorage.getItem('artified_tiktok_reels');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r, i) => ({
            ...r,
            videoUrl: (!r.videoUrl || (r.videoUrl.includes('@artified_np') && !r.videoUrl.includes('/video/')))
              ? TIKTOK_REELS[i % TIKTOK_REELS.length].videoUrl
              : r.videoUrl
          }));
        }
      }
    } catch {}
    return TIKTOK_REELS;
  });
  const [isTikTokManagerOpen, setIsTikTokManagerOpen] = useState<boolean>(false);
  const [editingReel, setEditingReel] = useState<TikTokReel | null>(null);

  const openTikTokEditor = (reel?: TikTokReel | null) => {
    setEditingReel(reel || null);
    setIsTikTokManagerOpen(true);
  };

  // Instagram Journal & Profile Handle State (All legacy/existing journals deleted per user request)
  const [instagramItems, setInstagramItems] = useState<InstagramJournalItem[]>(() => {
    try {
      const isCleared = localStorage.getItem('artified_instagram_cleared_v4');
      if (!isCleared) {
        localStorage.setItem('artified_instagram_cleared_v4', 'true');
        localStorage.setItem('artified_instagram_journal_items', JSON.stringify([]));
        return [];
      }
      const saved = localStorage.getItem('artified_instagram_journal_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [instagramHandle, setInstagramHandle] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('artified_instagram_handle');
      if (saved) return saved;
    } catch {}
    return DEFAULT_INSTAGRAM_HANDLE;
  });

  const [instagramProfileUrl, setInstagramProfileUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('artified_instagram_profile_url');
      if (saved) return saved;
    } catch {}
    return DEFAULT_INSTAGRAM_PROFILE_URL;
  });

  const [isInstagramManagerOpen, setIsInstagramManagerOpen] = useState<boolean>(false);
  const [editingInstagramItem, setEditingInstagramItem] = useState<InstagramJournalItem | null>(null);

  const openInstagramEditor = (item?: InstagramJournalItem | null) => {
    setEditingInstagramItem(item || null);
    setIsInstagramManagerOpen(true);
  };

  // Craft Story & Making Video State
  const [craftStory, setCraftStory] = useState<CraftStoryData>(() => {
    try {
      const saved = localStorage.getItem('artified_craft_story');
      return saved ? JSON.parse(saved) : DEFAULT_CRAFT_STORY;
    } catch {
      return DEFAULT_CRAFT_STORY;
    }
  });
  const [isCraftStoryModalOpen, setIsCraftStoryModalOpen] = useState<boolean>(false);

  // Main Application Multi-Tab Horizontal Navigation
  const [activeNavTab, setActiveNavTab] = useState<AppNavTab>('home');

  // Social Media Showcase Tab State ('tiktok' | 'journal')
  const [activeSocialTab, setActiveSocialTab] = useState<'tiktok' | 'journal'>('tiktok');

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('artified_products_custom');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const setQuickViewProduct = (product: Product | null, productList?: Product[]) => {
    if (!product) {
      setQuickViewProductState(null);
      setQuickViewProducts([]);
      return;
    }

    const currentListContainsProduct = quickViewProducts.some((item) => item.id === product.id);
    const sourceList = productList || (currentListContainsProduct ? quickViewProducts : products);
    setQuickViewProductState(product);
    setQuickViewProducts(
      sourceList.some((item) => item.id === product.id)
        ? sourceList.map((item) => item.id === product.id ? product : item)
        : [...sourceList, product]
    );
  };

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [syncStatusText, setSyncStatusText] = useState<string>('Connecting to live cloud...');

  // Product Image Fit Mode (contain = whole piece visible, cover = fill box)
  const [productImageFit, setProductImageFitState] = useState<'contain' | 'cover'>(() => {
    try {
      const saved = localStorage.getItem('artified_product_image_fit');
      if (saved === 'contain' || saved === 'cover') return saved;
    } catch {}
    return 'contain';
  });

  const setProductImageFit = (fit: 'contain' | 'cover') => {
    setProductImageFitState(fit);
    try {
      localStorage.setItem('artified_product_image_fit', fit);
    } catch {}
  };

  // Monthly Bestseller Threshold (set by seller in Seller Studio)
  const [bestsellerThreshold, setBestsellerThresholdState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('artified_bestseller_threshold');
      if (saved) return Number(saved) || 50;
    } catch {}
    return 50;
  });

  const setBestsellerThreshold = async (val: number) => {
    const num = Math.max(1, Number(val) || 50);
    setBestsellerThresholdState(num);
    try {
      localStorage.setItem('artified_bestseller_threshold', String(num));
    } catch {}

    try {
      const generalDocRef = doc(db, 'store_settings', 'general');
      await setDoc(generalDocRef, { bestsellerThreshold: num }, { merge: true });
    } catch (err) {
      console.warn('Could not sync bestsellerThreshold to cloud:', err);
    }
  };

  // Record genuine live online sales when an order is submitted
  const recordOnlineOrderSales = async (items: CartItem[]) => {
    try {
      const updatedProducts = products.map((prod) => {
        const matchingItem = items.find((item) => item.product.id === prod.id);
        if (matchingItem) {
          const prevOnline = prod.onlineSalesCount || 0;
          return {
            ...prod,
            onlineSalesCount: prevOnline + matchingItem.quantity
          };
        }
        return prod;
      });

      setProducts(updatedProducts);
      try {
        localStorage.setItem('artified_products_v3', JSON.stringify(updatedProducts));
      } catch {}

      // Real-time Cloud Firestore sync
      try {
        const batch = writeBatch(db);
        for (const item of items) {
          const prodRef = doc(db, 'products', item.product.id);
          const current = updatedProducts.find((p) => p.id === item.product.id);
          if (current) {
            batch.set(prodRef, current, { merge: true });
          }
        }
        await batch.commit();
      } catch (cloudErr) {
        console.warn('Online sales logged locally:', cloudErr);
      }
    } catch (e) {
      console.error('Error logging online sales:', e);
    }
  };

  // Add customer review to a product
  const addProductReview = async (productId: string, review: ProductReviewItem) => {
    try {
      const sanitized = sanitizeReviewItem(review);
      const updatedProducts = products.map((prod) => {
        if (prod.id === productId) {
          const existingReviews = prod.customReviews || [];
          return {
            ...prod,
            customReviews: [sanitized, ...existingReviews]
          };
        }
        return prod;
      });

      setProducts(updatedProducts);
      try {
        localStorage.setItem('artified_products_v3', JSON.stringify(updatedProducts));
      } catch {}

      try {
        const prodRef = doc(db, 'products', productId);
        const current = updatedProducts.find((p) => p.id === productId);
        if (current) {
          await setDoc(prodRef, current, { merge: true });
        }
      } catch (cloudErr) {
        console.warn('Review saved locally:', cloudErr);
      }
    } catch (e) {
      console.error('Error saving review:', e);
    }
  };

  // Save complete seller-managed review lists, including edits and intentional deletions.
  const saveProductReviews = async (reviewsByProduct: Record<string, ProductReviewItem[]>): Promise<boolean> => {
    const updates = new Map<string, ProductReviewItem[]>(
      Object.entries(reviewsByProduct).map(([productId, reviews]) => [
        productId,
        reviews.map((review) => ({
          ...review,
          author: review.author.trim(),
          location: review.location.trim(),
          comment: review.comment.trim(),
          rating: Math.min(5, Math.max(1, Number(review.rating) || 1))
        }))
      ] as [string, ProductReviewItem[]])
    );
    const updatedProducts = products.map((product) => {
      const reviews = updates.get(product.id);
      return reviews
        ? {
            ...product,
            customReviews: reviews,
            reviewsManaged: true,
            rating: reviews.length
              ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10
              : 0
          }
        : product;
    });

    setProducts(updatedProducts);
    try {
      localStorage.setItem('artified_products_custom', JSON.stringify(updatedProducts));
      localStorage.setItem('artified_products_v3', JSON.stringify(updatedProducts));
    } catch (error) {
      console.warn('Could not save review edits to this device:', error);
    }

    if (quickViewProduct && updates.has(quickViewProduct.id)) {
      const updatedQuickView = updatedProducts.find((product) => product.id === quickViewProduct.id);
      if (updatedQuickView) setQuickViewProduct(updatedQuickView);
    }

    try {
      const batch = writeBatch(db);
      for (const product of updatedProducts) {
        if (updates.has(product.id)) {
          batch.set(doc(db, 'products', product.id), sanitizeForFirestore(product), { merge: true });
        }
      }
      await batch.commit();
      return true;
    } catch (cloudErr) {
      console.warn('Review edits saved on this device; cloud sync failed:', cloudErr);
      return false;
    }
  };

  // 1. Initial connection test to Firestore as required by Firebase skill
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      }
    }
    testConnection();
  }, []);

  // 2. Real-time Firestore synchronization listener
  useEffect(() => {
    const productsCol = collection(db, 'products');

    const unsubscribe = onSnapshot(
      productsCol,
      async (snapshot) => {
        if (!snapshot.empty) {
          const cloudProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            cloudProducts.push(sanitizeProduct(docSnap.data() as Product));
          });

          // Sort products: keep default products in catalog order, and custom new pieces organized
          const sorted = [...cloudProducts].map(sanitizeProduct).sort((a, b) => {
            const idxA = PRODUCTS.findIndex((p) => p.id === a.id);
            const idxB = PRODUCTS.findIndex((p) => p.id === b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.title.localeCompare(b.title);
          });

          setProducts(sorted);
          setIsCloudSynced(true);
          setSyncStatusText('🟢 Live Cloud Synced across all devices');

          try {
            localStorage.setItem('artified_products_custom', JSON.stringify(sorted));
          } catch {}
        } else {
          // If Firestore is empty (first initialization), seed it with local or default products
          console.log('Firestore is empty. Bootstrapping products into Cloud...');
          setSyncStatusText('Initializing cloud catalog...');

          let seedList: Product[] = PRODUCTS;
          try {
            const localRaw = localStorage.getItem('artified_products_custom');
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                seedList = parsed;
              }
            }
          } catch {}

          try {
            const batch = writeBatch(db);
            seedList.forEach((p) => {
              const docRef = doc(db, 'products', p.id);
              batch.set(docRef, p);
            });
            await batch.commit();
            setIsCloudSynced(true);
            setSyncStatusText('🟢 Live Cloud Synced across all devices');
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'products');
          }
        }
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        setSyncStatusText('⚠️ Cloud sync offline');
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time TikTok Reels Firestore sync
  useEffect(() => {
    const reelsCol = collection(db, 'tiktok_reels');
    const unsubscribe = onSnapshot(
      reelsCol,
      async (snapshot) => {
        const cloudReels: TikTokReel[] = [];
        snapshot.forEach((docSnap) => {
          cloudReels.push(docSnap.data() as TikTokReel);
        });
        setReels(cloudReels);
        try {
          localStorage.setItem('artified_tiktok_reels', JSON.stringify(cloudReels));
        } catch {}
      },
      (err) => {
        console.warn('TikTok reels onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 4. Real-time Craft Story Firestore sync
  useEffect(() => {
    const craftDocRef = doc(db, 'store_settings', 'craft_story');
    const unsubscribe = onSnapshot(
      craftDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CraftStoryData;
          setCraftStory((prev) => ({ ...prev, ...data }));
          try {
            localStorage.setItem('artified_craft_story', JSON.stringify({ ...DEFAULT_CRAFT_STORY, ...data }));
          } catch {}
        }
      },
      (err) => {
        console.warn('Craft story onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 5. Real-time Instagram Journal Firestore sync
  useEffect(() => {
    const isCleared = localStorage.getItem('artified_instagram_cleared_v4');
    const igCol = collection(db, 'instagram_journal');
    const unsubscribe = onSnapshot(
      igCol,
      async (snapshot) => {
        if (!snapshot.empty) {
          const cloudItems: InstagramJournalItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as InstagramJournalItem;
            // Purge legacy default demo posts if present
            if (docSnap.id.startsWith('ig-item-') && isCleared) {
              try {
                deleteDoc(doc(db, 'instagram_journal', docSnap.id));
              } catch {}
            } else {
              cloudItems.push(data);
            }
          });
          setInstagramItems(cloudItems);
          try {
            localStorage.setItem('artified_instagram_journal_items', JSON.stringify(cloudItems));
          } catch {}
        } else {
          setInstagramItems([]);
          try {
            localStorage.setItem('artified_instagram_journal_items', JSON.stringify([]));
          } catch {}
        }
      },
      (err) => {
        console.warn('Instagram journal onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 6. Real-time Instagram Profile Settings Firestore sync
  useEffect(() => {
    const igSettingsRef = doc(db, 'store_settings', 'instagram');
    const unsubscribe = onSnapshot(
      igSettingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.handle) {
            setInstagramHandle(data.handle);
            try { localStorage.setItem('artified_instagram_handle', data.handle); } catch {}
          }
          if (data?.profileUrl) {
            setInstagramProfileUrl(data.profileUrl);
            try { localStorage.setItem('artified_instagram_profile_url', data.profileUrl); } catch {}
          }
        }
      },
      (err) => {
        console.warn('Instagram settings onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // 7. Real-time General Settings (bestsellerThreshold) Firestore sync
  useEffect(() => {
    const generalSettingsRef = doc(db, 'store_settings', 'general');
    const unsubscribe = onSnapshot(
      generalSettingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.bestsellerThreshold) {
            const num = Number(data.bestsellerThreshold);
            if (!isNaN(num) && num > 0) {
              setBestsellerThresholdState(num);
              try { localStorage.setItem('artified_bestseller_threshold', String(num)); } catch {}
            }
          }
        }
      },
      (err) => {
        console.warn('General settings onSnapshot error:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const forceSyncAllToCloud = async () => {
    setSyncStatusText('Pushing all local edits to cloud...');
    try {
      const batch = writeBatch(db);
      for (const p of products) {
        // Compress any base64 images if needed
        const optimizedImages = await Promise.all(
          p.images.map(async (img) => {
            if (img.startsWith('data:image/')) {
              return await compressImage(img, 1000, 1000, 0.82);
            }
            return img;
          })
        );
        const cleanedProduct = { ...p, images: optimizedImages };
        batch.set(doc(db, 'products', p.id), cleanedProduct);
      }
      await batch.commit();
      setIsCloudSynced(true);
      setSyncStatusText('🟢 Live Cloud Synced across all devices');
    } catch (err) {
      console.error('Failed to force sync to cloud', err);
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  // Seller / Atelier Mode State (default invisible to buyers)
  const [isSellerMode, setIsSellerModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('seller') === 'true' || urlParams.get('admin') === 'true' || urlParams.get('atelier') === 'admin') {
        return true;
      }
      return sessionStorage.getItem('artified_seller_session') === 'active';
    }
    return false;
  });

  const [isSellerAuthModalOpen, setIsSellerAuthModalOpen] = useState<boolean>(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
  const [isCatalogListOpen, setIsCatalogListOpen] = useState<boolean>(false);
  const [isReviewManagerOpen, setIsReviewManagerOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const setIsSellerMode = (val: boolean) => {
    setIsSellerModeState(val);
    if (typeof window !== 'undefined') {
      if (val) {
        sessionStorage.setItem('artified_seller_session', 'active');
      } else {
        sessionStorage.removeItem('artified_seller_session');
      }
    }
  };

  const updateProduct = async (updated: Product) => {
    // 1. Optimize images if any base64
    const cleanImages = await Promise.all(
      updated.images.map(async (img) => {
        if (img.startsWith('data:image/')) {
          return await compressImage(img, 1000, 1000, 0.82);
        }
        return img;
      })
    );
    const cleanedProduct: Product = sanitizeProduct({ ...updated, images: cleanImages });

    // 2. Optimistic UI update
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === cleanedProduct.id ? cleanedProduct : p));
      try {
        localStorage.setItem('artified_products_custom', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save custom products', e);
      }
      return next;
    });

    if (quickViewProduct?.id === cleanedProduct.id) {
      setQuickViewProduct(cleanedProduct);
    }

    // 3. Write directly to Cloud Firestore so smartphone and all devices get it immediately
    try {
      const docRef = doc(db, 'products', cleanedProduct.id);
      await setDoc(docRef, sanitizeForFirestore(cleanedProduct));
    } catch (err) {
      console.error('Failed to update product in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${cleanedProduct.id}`);
    }
  };

  const addProduct = async (newProduct: Product) => {
    // 1. Optimize images if any base64
    const cleanImages = await Promise.all(
      newProduct.images.map(async (img) => {
        if (img.startsWith('data:image/')) {
          return await compressImage(img, 1000, 1000, 0.82);
        }
        return img;
      })
    );
    const cleanedProduct: Product = sanitizeProduct({ ...newProduct, images: cleanImages });

    setProducts((prev) => {
      const next = [cleanedProduct, ...prev];
      try {
        localStorage.setItem('artified_products_custom', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save custom products', e);
      }
      return next;
    });

    try {
      const docRef = doc(db, 'products', cleanedProduct.id);
      await setDoc(docRef, sanitizeForFirestore(cleanedProduct));
    } catch (err) {
      console.error('Failed to add product in Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `products/${cleanedProduct.id}`);
    }
  };

  const duplicateProduct = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const cloned: Product = {
      ...existing,
      id: `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${existing.title} (Copy)`,
      isNewArrival: true,
      reviewsCount: 0,
      stockCount: 3,
    };

    await addProduct(cloned);
  };

  const toggleProductStock = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const newInStock = !existing.inStock;
    const updated: Product = {
      ...existing,
      inStock: newInStock,
      stockCount: newInStock ? (existing.stockCount > 0 ? existing.stockCount : 3) : 0,
    };

    await updateProduct(updated);
  };

  const toggleProductNewArrival = async (id: string) => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return;

    const updated: Product = {
      ...existing,
      isNewArrival: !existing.isNewArrival,
    };

    await updateProduct(updated);
  };

  const batchSetNewArrival = async (ids: string[], isNew: boolean) => {
    if (ids.length === 0) return;
    const targetSet = new Set(ids);
    const updatedBatch: Product[] = [];

    setProducts((prev) => {
      const next = prev.map((p) => {
        if (targetSet.has(p.id)) {
          const updated = { ...p, isNewArrival: isNew };
          updatedBatch.push(updated);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('artified_products_custom', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save custom products', e);
      }
      return next;
    });

    try {
      const batch = writeBatch(db);
      updatedBatch.forEach((p) => {
        batch.set(doc(db, 'products', p.id), sanitizeProduct(p));
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to batch update products in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('artified_products_custom', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save custom products', e);
      }
      return next;
    });

    if (quickViewProduct?.id === id) {
      setQuickViewProduct(null);
    }

    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete product in Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const resetProductsToDefault = async () => {
    try {
      localStorage.removeItem('artified_products_custom');
    } catch (e) {
      console.warn('Failed to remove custom products', e);
    }
    setProducts(PRODUCTS);

    try {
      const batch = writeBatch(db);
      PRODUCTS.forEach((p) => {
        batch.set(doc(db, 'products', p.id), p);
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to reset products in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const openProductEditor = (product?: Product | null) => {
    setEditingProduct(product || null);
    setIsSellerModalOpen(true);
  };

  const updateReel = async (updated: TikTokReel) => {
    setReels((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      try {
        localStorage.setItem('artified_tiktok_reels', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'tiktok_reels', updated.id);
      await setDoc(docRef, sanitizeForFirestore(updated));
    } catch (err) {
      console.error('Failed to update reel in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `tiktok_reels/${updated.id}`);
    }
  };

  const addReel = async (newReel: TikTokReel) => {
    setReels((prev) => {
      const next = [newReel, ...prev];
      try {
        localStorage.setItem('artified_tiktok_reels', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'tiktok_reels', newReel.id);
      await setDoc(docRef, sanitizeForFirestore(newReel));
    } catch (err) {
      console.error('Failed to add reel to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `tiktok_reels/${newReel.id}`);
    }
  };

  const deleteReel = async (id: string) => {
    setReels((prev) => {
      const next = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('artified_tiktok_reels', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'tiktok_reels', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete reel in Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `tiktok_reels/${id}`);
    }
  };

  const updateCraftStory = async (newData: CraftStoryData) => {
    setCraftStory(newData);
    try {
      localStorage.setItem('artified_craft_story', JSON.stringify(newData));
    } catch {}

    try {
      const craftDocRef = doc(db, 'store_settings', 'craft_story');
      await setDoc(craftDocRef, sanitizeForFirestore(newData), { merge: true });
    } catch (err) {
      console.error('Failed to update craft story in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, 'store_settings/craft_story');
    }
  };

  const cleanInstagramItemForFirestore = (item: InstagramJournalItem): Record<string, any> => {
    const docData: Record<string, any> = {
      id: item.id,
      title: item.title || '',
      caption: item.caption || '',
      thumbnail: item.thumbnail || '',
      postUrl: item.postUrl || '',
      handle: item.handle || '@artified_np',
    };
    if (item.videoUrl && item.videoUrl.trim()) {
      docData.videoUrl = item.videoUrl.trim();
    }
    if (item.taggedProductId && item.taggedProductId.trim()) {
      docData.taggedProductId = item.taggedProductId.trim();
      docData.taggedProductName = item.taggedProductName || '';
      docData.taggedProductPrice = Number(item.taggedProductPrice) || 0;
    }
    return docData;
  };

  const updateInstagramItem = async (updated: InstagramJournalItem) => {
    const cleaned = cleanInstagramItemForFirestore(updated) as InstagramJournalItem;
    setInstagramItems((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? cleaned : item));
      try {
        localStorage.setItem('artified_instagram_journal_items', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'instagram_journal', updated.id);
      await setDoc(docRef, sanitizeForFirestore(cleaned));
    } catch (err) {
      console.error('Failed to update Instagram item in Firestore:', err);
      handleFirestoreError(err, OperationType.UPDATE, `instagram_journal/${updated.id}`);
    }
  };

  const addInstagramItem = async (newItem: InstagramJournalItem) => {
    const cleaned = cleanInstagramItemForFirestore(newItem) as InstagramJournalItem;
    setInstagramItems((prev) => {
      const next = [cleaned, ...prev];
      try {
        localStorage.setItem('artified_instagram_journal_items', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'instagram_journal', newItem.id);
      await setDoc(docRef, sanitizeForFirestore(cleaned));
    } catch (err) {
      console.error('Failed to add Instagram item to Firestore:', err);
      handleFirestoreError(err, OperationType.CREATE, `instagram_journal/${newItem.id}`);
    }
  };

  const deleteInstagramItem = async (id: string) => {
    setInstagramItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('artified_instagram_journal_items', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      const docRef = doc(db, 'instagram_journal', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Failed to delete Instagram item in Firestore:', err);
      handleFirestoreError(err, OperationType.DELETE, `instagram_journal/${id}`);
    }
  };

  const deleteAllInstagramItems = async () => {
    const current = [...instagramItems];
    setInstagramItems([]);
    try {
      localStorage.setItem('artified_instagram_journal_items', JSON.stringify([]));
      localStorage.setItem('artified_instagram_cleared_v4', 'true');
    } catch {}

    try {
      for (const item of current) {
        const docRef = doc(db, 'instagram_journal', item.id);
        await deleteDoc(docRef);
      }
    } catch (err) {
      console.warn('Failed to delete items from cloud:', err);
    }
  };

  const updateInstagramSettings = async (handle: string, profileUrl?: string) => {
    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const cleanUrl = profileUrl?.trim() || `https://www.instagram.com/${cleanHandle.replace('@', '')}/`;

    setInstagramHandle(cleanHandle);
    setInstagramProfileUrl(cleanUrl);

    try {
      localStorage.setItem('artified_instagram_handle', cleanHandle);
      localStorage.setItem('artified_instagram_profile_url', cleanUrl);
    } catch {}

    try {
      const docRef = doc(db, 'store_settings', 'instagram');
      await setDoc(docRef, { handle: cleanHandle, profileUrl: cleanUrl }, { merge: true });
    } catch (err) {
      console.error('Failed to update Instagram settings in Firestore:', err);
      handleFirestoreError(err, OperationType.WRITE, 'store_settings/instagram');
    }
  };

  // Keyboard shortcut listener for Seller Mode (Alt + Shift + S or Ctrl + Shift + S)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.altKey || e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        if (isSellerMode) {
          setIsSellerMode(false);
        } else {
          setIsSellerAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSellerMode]);

  const setCompletedOrder = (order: OrderDetails | null) => {
    setCompletedOrderState(order);
    if (order) {
      try {
        const existingRaw = localStorage.getItem('artified_orders');
        const existing: OrderDetails[] = existingRaw ? JSON.parse(existingRaw) : [];
        // Prepend new order
        const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
        localStorage.setItem('artified_orders', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist order to storage', e);
      }
    }
  };

  const openTracker = (orderId?: string) => {
    if (orderId) {
      setTrackingOrderId(orderId);
    } else if (!trackingOrderId && completedOrder?.orderId) {
      setTrackingOrderId(completedOrder.orderId);
    }
    setIsTrackerOpen(true);
  };

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artified_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('artified_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const addToCart = (
    product: Product,
    quantity = 1,
    customizationNote?: string,
    selectedColorOrStyle?: string
  ) => {
    setCart((prev) => {
      const noteHash = (customizationNote || '').trim().toLowerCase();
      const styleHash = (selectedColorOrStyle || '').trim().toLowerCase();
      const itemId = `${product.id}-${noteHash}-${styleHash}`;

      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: itemId,
            product,
            quantity,
            customizationNote: customizationNote?.trim() || undefined,
            selectedColorOrStyle: selectedColorOrStyle?.trim() || undefined,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.min(newQty, 10) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setGiftPackaging(false);
    setGiftMessage('');
    setOrderNote('');
    setDiscount(0);
    setPromoCode('');
    setPromoError(null);
    setPromoSuccess(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a voucher code');
      return;
    }
    if (clean === 'ARTIFIED10' || clean === 'TIKTOK10') {
      const calculatedDiscount = Math.round(subtotal * 0.1);
      setDiscount(calculatedDiscount);
      setPromoCode(clean);
      setPromoSuccess(`10% discount voucher applied (-Rs. ${calculatedDiscount.toLocaleString()})`);
      setPromoError(null);
    } else if (clean === 'NEPALFIRST') {
      const calculatedDiscount = 250;
      setDiscount(calculatedDiscount);
      setPromoCode(clean);
      setPromoSuccess(`Festive offer applied (-Rs. 250)`);
      setPromoError(null);
    } else {
      setPromoError('Invalid promo code. Try "TIKTOK10" or "NEPALFIRST"');
      setPromoSuccess(null);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscount(0);
    setPromoError(null);
    setPromoSuccess(null);
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? selectedDeliveryZone.fee : 0;
  const giftPackagingFee = giftPackaging && cart.length > 0 ? GIFT_PACKAGING_COST : 0;
  const total = Math.max(0, subtotal + deliveryFee + giftPackagingFee - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        giftPackagingFee,
        discount,
        total,
        selectedDeliveryZone,
        setSelectedDeliveryZone,
        giftPackaging,
        setGiftPackaging,
        giftMessage,
        setGiftMessage,
        orderNote,
        setOrderNote,
        promoCode,
        promoError,
        promoSuccess,
        applyPromoCode,
        removePromoCode,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
        quickViewProduct,
        quickViewProducts,
        setQuickViewProduct,
        activeReel,
        setActiveReel,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        completedOrder,
        setCompletedOrder,
        isTrackerOpen,
        setIsTrackerOpen,
        trackingOrderId,
        setTrackingOrderId,
        openTracker,
        // Seller Mode & Products
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        resetProductsToDefault,
        isSellerMode,
        setIsSellerMode,
        isSellerAuthModalOpen,
        setIsSellerAuthModalOpen,
        isSellerModalOpen,
        setIsSellerModalOpen,
        isCatalogListOpen,
        setIsCatalogListOpen,
        isReviewManagerOpen,
        setIsReviewManagerOpen,
        editingProduct,
        setEditingProduct,
        openProductEditor,
        duplicateProduct,
        toggleProductStock,
        toggleProductNewArrival,
        batchSetNewArrival,
        // TikTok Reels
        reels,
        isTikTokManagerOpen,
        setIsTikTokManagerOpen,
        editingReel,
        setEditingReel,
        openTikTokEditor,
        updateReel,
        addReel,
        deleteReel,
        // Craft Story & Making Video
        craftStory,
        updateCraftStory,
        isCraftStoryModalOpen,
        setIsCraftStoryModalOpen,
        // Instagram Journal & Handle Management
        instagramItems,
        instagramHandle,
        instagramProfileUrl,
        isInstagramManagerOpen,
        setIsInstagramManagerOpen,
        editingInstagramItem,
        setEditingInstagramItem,
        openInstagramEditor,
        updateInstagramItem,
        addInstagramItem,
        deleteInstagramItem,
        deleteAllInstagramItems,
        updateInstagramSettings,
        // Main Application Multi-Tab Horizontal Navigation
        activeNavTab,
        setActiveNavTab,
        // Social Media Showcase Tab
        activeSocialTab,
        setActiveSocialTab,
        // Real-time Cloud Sync
        isCloudSynced,
        syncStatusText,
        forceSyncAllToCloud,
        // Product Card Image Display Mode
        productImageFit,
        setProductImageFit,
        // Monthly Bestseller Threshold and Sales Tracking
        bestsellerThreshold,
        setBestsellerThreshold,
        recordOnlineOrderSales,
        addProductReview,
        saveProductReviews,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
