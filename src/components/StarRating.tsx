import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, size = 24, interactive = false, onRate }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayRating;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              onClick={() => onRate?.(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                size={size}
                className={filled ? 'text-[#C6FF34]' : 'text-white/20'}
                fill={filled ? '#C6FF34' : 'transparent'}
              />
            </button>
          );
        }

        return (
          <Star
            key={star}
            size={size}
            className={filled ? 'text-[#C6FF34]' : 'text-white/20'}
            fill={filled ? '#C6FF34' : 'transparent'}
          />
        );
      })}
    </div>
  );
}
