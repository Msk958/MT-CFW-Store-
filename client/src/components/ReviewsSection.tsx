import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

interface ReviewsSectionProps {
  productId: number;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const utils = trpc.useUtils();

  const { data: reviews = [], isLoading: reviewsLoading } = trpc.reviews.getByProduct.useQuery(productId);
  const { data: ratingData = { average: 0, count: 0 } } = trpc.reviews.getAverageRating.useQuery(productId);

  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التقييم");
      utils.reviews.getByProduct.invalidate(productId);
      utils.reviews.getAverageRating.invalidate(productId);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف التقييم");
    },
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>التقييمات والآراء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Rating */}
          <div className="flex items-center gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">
                {ratingData.average.toFixed(1)}
              </div>
              <div className="flex justify-center">
                {renderStars(Math.round(ratingData.average))}
              </div>
              <p className="text-sm text-muted-foreground">
                {ratingData.count} تقييم
              </p>
            </div>

            {/* Add Review Button */}
            {isAuthenticated && (
              <div className="flex-1">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full"
                >
                  {showForm ? "إلغاء" : "أضف تقييمك"}
                </Button>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          {showForm && isAuthenticated && (
            <AddReviewForm
              productId={productId}
              onSuccess={() => {
                setShowForm(false);
                utils.reviews.getByProduct.invalidate(productId);
                utils.reviews.getAverageRating.invalidate(productId);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="border-primary/20">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">لا توجد تقييمات حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-primary/20">
              <CardContent className="pt-6 space-y-3">
                {/* Review Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">
                          شراء موثق
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-semibold">{review.title}</h4>
                    )}
                  </div>

                  {/* Delete Button */}
                  {isAuthenticated && user?.id === review.userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteReview.mutate(review.id)}
                      disabled={deleteReview.isPending}
                    >
                      {deleteReview.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Review Comment */}
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}

                {/* Review Footer */}
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-primary/20">
                  <span>{formatDate(review.createdAt)}</span>
                  <span>بواسطة: المستخدم</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface AddReviewFormProps {
  productId: number;
  onSuccess: () => void;
}

function AddReviewForm({ productId, onSuccess }: AddReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("شكراً لتقييمك!");
      setRating(5);
      setTitle("");
      setComment("");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة التقييم");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("يرجى إضافة تعليق");
      return;
    }
    createReview.mutate({
      productId,
      rating,
      title: title || undefined,
      comment,
      isVerifiedPurchase: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg">
      {/* Rating Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">التقييم</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">العنوان (اختياري)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ملخص تقييمك"
          className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background"
        />
      </div>

      {/* Comment Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">تعليقك</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شارك رأيك حول هذا المنتج..."
          rows={4}
          className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={createReview.isPending}
      >
        {createReview.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        إرسال التقييم
      </Button>
    </form>
  );
}
