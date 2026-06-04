import React from 'react';
import { Trash2, Pencil, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import RatingStars from './RatingStars';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * ReviewCard — displays a single review.
 * @param {object}   review      - review document
 * @param {boolean}  isOwner     - whether the current user owns this review
 * @param {boolean}  isAdmin     - whether the current user is an admin
 * @param {function} onEdit      - called when Edit is clicked
 * @param {function} onDelete    - called when Delete is clicked
 * @param {boolean}  deleting    - disables delete button during request
 */
export default function ReviewCard({ review, isOwner, isAdmin, onEdit, onDelete, deleting }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/40 hover:border-border/70 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + meta */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">{review.name}</p>
                {isOwner && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={review.rating} size="h-3.5 w-3.5" />
                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed break-words">{review.comment}</p>
            </div>
          </div>

          {/* Actions */}
          {(isOwner || isAdmin) && (
            <div className="flex gap-1.5 flex-shrink-0">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(review)}
                  aria-label="Edit review"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                onClick={() => onDelete(review._id)}
                disabled={deleting}
                aria-label="Delete review"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
