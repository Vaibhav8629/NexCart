import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Search, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminGetAllReviewsRequest, adminDeleteReviewRequest } from '../../lib/reviewApi';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  // Delete state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await adminGetAllReviewsRequest(page, 20);
      setReviews((prev) => (append ? [...prev, ...data.reviews] : data.reviews));
      setPagination({ page, hasMore: data.pagination.hasMore, total: data.pagination.total });
    } catch (err) {
      toast.error(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, false);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteReviewRequest(deleteId);
      setReviews((prev) => prev.filter((r) => r._id !== deleteId));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
      setDeleteId(null);
      toast.success('Review removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  // Client-side filter
  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.user?.email?.toLowerCase().includes(q);
    const matchRating =
      filterRating === 'all' || String(r.rating) === String(filterRating);
    return matchSearch && matchRating;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Moderation</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">Reviews</h1>
          </div>
          <span className="ml-auto text-2xl font-bold text-white">{pagination.total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user, product or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400/50"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="h-12 w-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No reviews found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search || filterRating !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Reviews will appear here once customers submit them.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-4 font-medium">Product</th>
                      <th className="text-left px-4 py-4 font-medium">User</th>
                      <th className="text-left px-4 py-4 font-medium">Rating</th>
                      <th className="text-left px-4 py-4 font-medium w-64">Comment</th>
                      <th className="text-left px-4 py-4 font-medium">Date</th>
                      <th className="text-left px-4 py-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((review, idx) => (
                      <motion.tr
                        key={review._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {review.product?.images?.[0] && (
                              <img
                                src={review.product.images[0]}
                                alt=""
                                className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <span className="text-white text-sm font-medium line-clamp-1">
                              {review.product?.name || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-white text-sm font-medium">{review.name}</p>
                          <p className="text-slate-500 text-xs">{review.user?.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StarDisplay rating={review.rating} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-slate-300 text-xs line-clamp-2 max-w-[16rem]">
                            {review.comment}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs h-7 px-2"
                            onClick={() => setDeleteId(review._id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-white/5">
                {filtered.map((review, idx) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-1">
                          {review.product?.name || '—'}
                        </p>
                        <p className="text-slate-400 text-xs">{review.name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs h-7 px-2 flex-shrink-0"
                        onClick={() => setDeleteId(review._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <StarDisplay rating={review.rating} />
                    <p className="text-slate-400 text-xs line-clamp-2">{review.comment}</p>
                    <p className="text-slate-600 text-xs">{formatDate(review.createdAt)}</p>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Load more */}
      {pagination.hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchReviews(pagination.page + 1, true)}
            disabled={loadingMore}
            className="rounded-xl border-white/10 text-slate-300 hover:border-amber-400/50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              `Load more (${pagination.total - reviews.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove Review"
        description="Are you sure you want to permanently remove this review? This cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
