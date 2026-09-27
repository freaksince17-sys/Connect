import React, { useMemo, useState } from 'react';
import { Check, Edit3, MapPin, MessageSquare, Search, Star, Trash2, X } from 'lucide-react';
import { Product, ProductReviewItem } from '../types';
import { useCart } from '../context/CartContext';
import { getProductReviews } from '../utils/productStats';

interface ReviewRow {
  product: Product;
  review: ProductReviewItem;
}

export const SellerReviewsModal: React.FC = () => {
  const {
    isSellerMode,
    isReviewManagerOpen,
    setIsReviewManagerOpen,
    products,
    saveProductReviews
  } = useCart();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [draft, setDraft] = useState<ProductReviewItem | null>(null);
  const [targetProductId, setTargetProductId] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const rows = useMemo(() => products.flatMap((product) =>
    getProductReviews(product).map((review) => ({ product, review }))
  ), [products]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(({ product, review }) =>
      [product.title, review.author, review.location, review.comment]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [rows, search]);

  if (!isSellerMode || !isReviewManagerOpen) return null;

  const beginEdit = (row: ReviewRow) => {
    setEditing(row);
    setDraft({ ...row.review });
    setTargetProductId(row.product.id);
    setNotice('');
  };

  const closeEditor = () => {
    setEditing(null);
    setDraft(null);
  };

  const handleSave = async () => {
    if (!editing || !draft) return;
    const cleanDraft = {
      ...draft,
      author: draft.author.trim(),
      location: draft.location.trim(),
      comment: draft.comment.trim(),
      rating: Math.min(5, Math.max(1, Number(draft.rating) || 1))
    };
    if (!cleanDraft.author || !cleanDraft.location || !cleanDraft.comment || !targetProductId) {
      setNotice('Add the reviewer name, location, review text, and product before saving.');
      return;
    }

    const sourceProduct = products.find((product) => product.id === editing.product.id);
    const targetProduct = products.find((product) => product.id === targetProductId);
    if (!sourceProduct || !targetProduct) return;

    const updates: Record<string, ProductReviewItem[]> = {
      [sourceProduct.id]: getProductReviews(sourceProduct)
    };
    if (sourceProduct.id === targetProduct.id) {
      updates[sourceProduct.id] = updates[sourceProduct.id].map((review) =>
        review.id === editing.review.id ? cleanDraft : review
      );
    } else {
      updates[sourceProduct.id] = updates[sourceProduct.id].filter((review) => review.id !== editing.review.id);
      updates[targetProduct.id] = [
        cleanDraft,
        ...getProductReviews(targetProduct).filter((review) => review.id !== cleanDraft.id)
      ];
    }

    setIsSaving(true);
    setNotice('');
    try {
      const cloudSynced = await saveProductReviews(updates);
      setNotice(cloudSynced ? 'Review saved.' : 'Review saved on this device. Cloud sync is unavailable.');
      closeEditor();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: ReviewRow) => {
    if (!window.confirm(`Delete ${row.review.author}'s review for ${row.product.title}?`)) return;
    setIsSaving(true);
    setNotice('');
    try {
      const remainingReviews = getProductReviews(row.product).filter((review) => review.id !== row.review.id);
      const cloudSynced = await saveProductReviews({ [row.product.id]: remainingReviews });
      setNotice(cloudSynced ? 'Review deleted.' : 'Review deleted on this device. Cloud sync is unavailable.');
      if (editing?.product.id === row.product.id && editing.review.id === row.review.id) closeEditor();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6"
      onClick={() => setIsReviewManagerOpen(false)}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-reviews-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#D8C8B7] bg-[#FAF8F5] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-[#E8DED4] px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EFE5DA] text-[#947452]">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id="seller-reviews-title" className="text-lg font-semibold text-[#29231F]">Manage Product Reviews</h2>
              <p className="text-sm text-[#83786F]">Edit reviewer details, review text, rating, and product.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReviewManagerOpen(false)}
            aria-label="Close review manager"
            className="rounded-full p-2 text-[#83786F] transition hover:bg-[#EFE5DA] hover:text-[#29231F]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
          <div className="flex min-h-0 flex-col border-b border-[#E8DED4] md:border-b-0 md:border-r">
            <div className="px-5 py-4 sm:px-6">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B8E83]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reviews, people, products..."
                  className="w-full rounded-xl border border-[#D9C9BA] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#B89568]"
                />
              </label>
              <p className="mt-2 text-xs text-[#91857B]">{filteredRows.length} {filteredRows.length === 1 ? 'review' : 'reviews'}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-5 sm:px-6">
              {filteredRows.map((row) => (
                <article key={`${row.product.id}:${row.review.id}`} className="rounded-xl border border-[#E5D9CD] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-wide text-[#9A7A57]">{row.product.title}</p>
                      <p className="mt-1 font-semibold text-[#302923]">{row.review.author}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[#8B8178]"><MapPin className="h-3 w-3" />{row.review.location}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#FFF7E5] px-2 py-1 text-xs font-semibold text-[#A77712]">
                      <Star className="h-3.5 w-3.5 fill-current" />{row.review.rating}
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-[#625A53]">{row.review.comment}</p>
                  <div className="mt-3 flex justify-end gap-2 border-t border-[#F0EAE4] pt-3">
                    <button type="button" onClick={() => beginEdit(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9C9BA] px-3 py-1.5 text-xs font-medium text-[#51483F] hover:bg-[#FAF6F1]">
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" disabled={isSaving} onClick={() => void handleDelete(row)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </article>
              ))}
              {filteredRows.length === 0 && <p className="rounded-xl border border-dashed border-[#D9C9BA] p-6 text-center text-sm text-[#8B8178]">No reviews match that search.</p>}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {editing && draft ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#302923]">Edit review</h3>
                  <p className="mt-1 text-xs text-[#8B8178]">You can move this review to a different product.</p>
                </div>
                <label className="block text-sm font-medium text-[#51483F]">Reviewer name
                  <input value={draft.author} onChange={(event) => setDraft({ ...draft, author: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#D9C9BA] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#B89568]" />
                </label>
                <label className="block text-sm font-medium text-[#51483F]">Reviewer location
                  <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#D9C9BA] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#B89568]" />
                </label>
                <label className="block text-sm font-medium text-[#51483F]">Product reviewed
                  <select value={targetProductId} onChange={(event) => setTargetProductId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#D9C9BA] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#B89568]">
                    {products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-[#51483F]">Rating (1–5)
                  <input type="number" min={1} max={5} step={0.1} value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-[#D9C9BA] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#B89568]" />
                </label>
                <label className="block text-sm font-medium text-[#51483F]">Review text
                  <textarea rows={5} value={draft.comment} onChange={(event) => setDraft({ ...draft, comment: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-[#D9C9BA] bg-white px-3 py-2.5 font-normal leading-5 outline-none focus:border-[#B89568]" />
                </label>
                {notice && <p className="text-sm text-[#6F654E]">{notice}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" disabled={isSaving} onClick={() => void handleSave()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#29231F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#453B33] disabled:opacity-50">
                    <Check className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save review'}
                  </button>
                  <button type="button" onClick={closeEditor} className="rounded-lg border border-[#D9C9BA] px-4 py-2.5 text-sm font-medium text-[#625A53] hover:bg-white">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-40 flex-col items-center justify-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[#EFE5DA] text-[#947452]"><Edit3 className="h-5 w-5" /></span>
                <h3 className="mt-3 font-semibold text-[#302923]">Choose a review to edit</h3>
                <p className="mt-1 max-w-xs text-sm leading-5 text-[#8B8178]">Update the reviewer’s name and location, change the review, or assign it to another product.</p>
                {notice && <p className="mt-4 text-sm text-[#6F654E]">{notice}</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
