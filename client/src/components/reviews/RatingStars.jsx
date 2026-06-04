import React from 'react';
import { Star } from 'lucide-react';

/**
 * RatingStars — display-only star row.
 * @param {number} rating  - numeric rating (can be fractional)
 * @param {number} max     - total stars (default 5)
 * @param {string} size    - Tailwind size class for the icon (default 'h-4 w-4')
 */
export default function RatingStars({ rating = 0, max = 5, size = 'h-4 w-4' }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <Star
            key={i}
            className={`${size} flex-shrink-0 ${
              filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
            }`}
          />
        );
      })}
    </div>
  );
}

/**
 * InteractiveRatingStars — clickable star row for forms.
 * @param {number}   value    - currently selected rating
 * @param {function} onChange - called with new rating number
 * @param {string}   size     - Tailwind size class (default 'h-7 w-7')
 */
export function InteractiveRatingStars({ value = 0, onChange, size = 'h-7 w-7' }) {
  const [hovered, setHovered] = React.useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${star} out of 5`}
          className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
        >
          <Star
            className={`${size} flex-shrink-0 transition-colors ${
              star <= display ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40 hover:text-amber-400/60'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
