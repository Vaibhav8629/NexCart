import React from 'react';
import RatingStars from './RatingStars';

/**
 * ReviewSummary — shows average rating + per-star breakdown bars.
 *
 * @param {number} rating     - product average rating
 * @param {number} numReviews - total number of reviews
 * @param {Array}  reviews    - current page of review objects (used for bar calculation)
 * @param {number} total      - total reviews across all pages (for accurate bar %)
 */
export default function ReviewSummary({ rating, numReviews, reviews = [], total = 0 }) {
  // Count each star level from the full total (approximated from fetched reviews)
  // We use the loaded reviews to compute distribution; counts are weighted to total
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 p-6 rounded-2xl bg-card/60 border border-border/40">
      {/* Big average */}
      <div className="flex flex-col items-center text-center min-w-[100px]">
        <p className="text-5xl font-extrabold text-foreground leading-none">
          {numReviews > 0 ? Number(rating).toFixed(1) : '—'}
        </p>
        <div className="mt-2 mb-1">
          <RatingStars rating={rating} size="h-5 w-5" />
        </div>
        <p className="text-xs text-muted-foreground">{numReviews} {numReviews === 1 ? 'review' : 'reviews'}</p>
      </div>

      {/* Star breakdown bars */}
      <div className="flex-1 w-full space-y-1.5">
        {starCounts.map(({ star, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-right text-muted-foreground font-medium">{star}</span>
              <svg className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="w-8 text-muted-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
