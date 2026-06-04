import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { InteractiveRatingStars } from './RatingStars';

/**
 * ReviewForm — write or edit a review.
 *
 * @param {function} onSubmit     - async fn(rating, comment) called on submit
 * @param {number}   initialRating
 * @param {string}   initialComment
 * @param {boolean}  isEdit       - true when editing an existing review
 * @param {boolean}  loading      - disables form during submission
 * @param {function} onCancel     - shown when isEdit is true
 */
export default function ReviewForm({
  onSubmit,
  initialRating = 0,
  initialComment = '',
  isEdit = false,
  loading = false,
  onCancel,
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!rating) next.rating = 'Please select a star rating.';
    if (!comment.trim()) next.comment = 'Comment is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(rating, comment.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
        <InteractiveRatingStars value={rating} onChange={setRating} />
        {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating}</p>}
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
        <Textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) setErrors((p) => ({ ...p, comment: '' }));
          }}
          placeholder="Share your experience with this product..."
          rows={4}
          className="bg-background/50 border-border/50 focus:border-primary resize-none text-foreground placeholder:text-muted-foreground/60"
        />
        {errors.comment && <p className="text-xs text-red-400 mt-1">{errors.comment}</p>}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl font-semibold bg-primary hover:bg-amber-500 text-black"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Saving…' : 'Submitting…'}</>
          ) : (
            <><Send className="mr-2 h-4 w-4" />{isEdit ? 'Save Changes' : 'Submit Review'}</>
          )}
        </Button>
        {isEdit && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="rounded-xl">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
