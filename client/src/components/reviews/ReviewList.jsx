import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquarePlus, Pencil, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  fetchProductReviewsRequest,
  createReviewRequest,
  updateReviewRequest,
  deleteReviewRequest,
} from '../../lib/reviewApi';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewSummary from './ReviewSummary';
import ConfirmDialog from '../admin/ConfirmDialog';

const LIMIT = 5;

/**
 * ReviewList — complete review section for a product page.
 *
 * @param {string} productId     - MongoDB _id of the product
 * @param {number} rating        - product.rating (from ProductContext, passed as prop)
 * @param {number} numReviews    - product.numReviews
 * @param {function} onRatingUpdate - called with (newRating, newNumReviews) after any write
 */
export default function ReviewList({ productId, rating, numReviews, onRatingUpdate }) {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, hasMore: false, total: 0 });
  const [fetching, setFetching] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // The current user's existing review (if any)
  const [myReview, setMyReview] = useState(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  // AuthContext stores user.id (string), reviews store user as ObjectId string
  const getUserId = () => user?.id || user?._id;

  const isOwner = (review) => {
    const uid = getUserId();
    if (!uid) return false;
    const rid = review.user?._id || review.user;
    return String(uid) === String(rid);
  };

  // ── Load reviews ─────────────────────────────────────────────────────────────
  const loadReviews = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setFetching(true);
      else setLoadingMore(true);
      try {
        const data = await fetchProductReviewsRequest(productId, page, LIMIT);
        const fetched = data.reviews || [];
        setReviews((prev) => (append ? [...prev, ...fetched] : fetched));
        setPagination({
          page,
          hasMore: data.pagination.hasMore,
          total: data.pagination.total,
        });

        // Detect my own review in the batch
        if (user) {
          const uid = getUserId();
          const mine = fetched.find((r) => {
            const rid = r.user?._id || r.user;
            return String(uid) === String(rid);
          });
          if (mine) setMyReview(mine);
        }
      } catch {
        // silently ignore network errors
      } finally {
        setFetching(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, user]
  );

  useEffect(() => {
    setMyReview(null); // reset when product changes
    loadReviews(1, false);
  }, [loadReviews]);

  // ── After any write: reload reviews + notify parent of new rating ────────────
  const refreshAfterWrite = useCallback(async () => {
    const data = await fetchProductReviewsRequest(productId, 1, LIMIT);
    const fetched = data.reviews || [];
    setReviews(fetched);
    setPagination({ page: 1, hasMore: data.pagination.hasMore, total: data.pagination.total });

    if (user) {
      const uid = getUserId();
      const mine = fetched.find((r) => String(uid) === String(r.user?._id || r.user));
      setMyReview(mine || null);
    }

    // Ask server for updated product rating
    if (onRatingUpdate) {
      // We re-fetch the product rating from the fresh review list
      // (the product rating update is already done server-side)
      onRatingUpdate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user, onRatingUpdate]);

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async (ratingVal, comment) => {
    setSubmitting(true);
    try {
      await createReviewRequest({ productId, rating: ratingVal, comment });
      toast.success('Review submitted!');
      await refreshAfterWrite();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEditOpen = (review) => {
    setEditTarget(review);
    setEditOpen(true);
  };

  const handleUpdate = async (ratingVal, comment) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await updateReviewRequest(editTarget._id, { rating: ratingVal, comment });
      setEditOpen(false);
      toast.success('Review updated!');
      await refreshAfterWrite();
    } catch (err) {
      toast.error(err.message || 'Failed to update review.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteReviewRequest(deleteId);
      if (myReview?._id === deleteId) setMyReview(null);
      setDeleteId(null);
      toast.success('Review deleted.');
      await refreshAfterWrite();
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Load more ────────────────────────────────────────────────────────────────
  const handleLoadMore = () => loadReviews(pagination.page + 1, true);

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="space-y-4">
        <div className="h-28 rounded-2xl bg-muted/30 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  const hasReviewed = Boolean(myReview);
  const showWriteForm = isAuthenticated && !hasReviewed;

  return (
    <div className="space-y-6">
      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <ReviewSummary
        rating={rating}
        numReviews={numReviews}
        reviews={reviews}
        total={pagination.total}
      />

      {/* ── Auth gate ───────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm">Sign in to leave a review</span>
            </div>
            <Button size="sm" className="rounded-xl" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Write form (not yet reviewed) ───────────────────────────────── */}
      {showWriteForm && (
        <Card className="bg-card/60 border-primary/20 border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Write a Review</h3>
            </div>
            <ReviewForm onSubmit={handleCreate} loading={submitting} />
          </CardContent>
        </Card>
      )}

      {/* ── Already reviewed banner ──────────────────────────────────────── */}
      {hasReviewed && (
        <Card className="bg-primary/5 border-primary/20 border">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                You've already reviewed this product
              </p>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${
                      s <= myReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handleEditOpen(myReview)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Review list ──────────────────────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-muted/20 border border-border/40 text-center">
          <Star className="h-10 w-10 text-primary/20 mb-3" />
          <p className="text-base font-medium text-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to share your experience.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ReviewCard
                  review={review}
                  isOwner={isOwner(review)}
                  isAdmin={user?.role === 'admin'}
                  onEdit={handleEditOpen}
                  onDelete={(id) => setDeleteId(id)}
                  deleting={deleting && deleteId === review._id}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Load more ────────────────────────────────────────────────────── */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-xl border-border/50 hover:border-primary/50"
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

      {/* ── Edit dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Review</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ReviewForm
              onSubmit={handleUpdate}
              initialRating={editTarget.rating}
              initialComment={editTarget.comment}
              isEdit
              loading={submitting}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
