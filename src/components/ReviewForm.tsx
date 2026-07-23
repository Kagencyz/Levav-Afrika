import { useState } from 'react';
import { trpc } from '@/providers/trpc';
import { StarRating } from './StarRating';
import { Star } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { toast } from 'sonner';

interface ReviewFormProps {
  bookingId: number;
  revieweeId: number;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const utils = trpc.useUtils();
  const { isOffline, queueAction } = useOffline();
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      utils.review.forUser.invalidate({ userId: revieweeId });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    // If offline, queue the review for later sync
    if (isOffline) {
      queueAction({
        type: 'review',
        data: {
          bookingId,
          revieweeId,
          rating,
          comment: comment || undefined,
        },
      });
      toast.success('You are offline. Review saved and will be synced when you reconnect.');
      setSubmitted(true);
      onSuccess?.();
      return;
    }

    createReview.mutate({ bookingId, revieweeId, rating, comment: comment || undefined });
  };

  if (submitted) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 text-center">
        <Star size={40} className="text-[#C6FF34] mx-auto mb-3" fill="#C6FF34" />
        <h3 className="text-white text-lg font-medium mb-1">Review Submitted!</h3>
        <p className="text-white/50 text-sm">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-5"
    >
      <div>
        <label className="block text-white/60 text-sm mb-3">Rate your experience</label>
        <StarRating rating={rating} size={32} interactive onRate={setRating} />
        {rating > 0 && (
          <p className="text-[#C6FF34] text-sm mt-2 font-medium">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="comment" className="block text-white/60 text-sm mb-2">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C6FF34]/30 resize-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={rating === 0 || createReview.isPending}
        className="w-full bg-[#C6FF34] text-black font-medium py-3 rounded-xl hover:bg-[#b8f030] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
      >
        {createReview.isPending ? 'Submitting...' : 'Submit Review'}
      </button>

      {createReview.isError && (
        <p className="text-red-400 text-sm text-center">
          {createReview.error.message || 'Something went wrong. Please try again.'}
        </p>
      )}
    </form>
  );
}
