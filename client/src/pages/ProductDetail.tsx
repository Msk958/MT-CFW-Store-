import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewsSection from "@/components/ReviewsSection";
import { ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id || "0");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: product, isLoading } = trpc.products.getById.useQuery(productId);

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة المنتج إلى السلة");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المنتج");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
            <Button asChild>
              <a href="/">العودة للرئيسية</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              الرئيسية
            </a>
            <ArrowRight className="h-4 w-4" />
            <span>{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div>
              {product.imageUrl ? (
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-primary">{product.name}</h1>
                {product.description && (
                  <p className="text-muted-foreground">{product.description}</p>
                )}
              </div>

              {/* Price and Stock */}
              <Card className="border-primary/20 bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">السعر</p>
                    <p className="text-4xl font-bold text-primary">
                      {product.price} ر.س
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">الكمية المتاحة</p>
                    <p className="text-lg font-semibold">
                      {product.stock > 0 ? (
                        <span className="text-green-500">{product.stock} وحدة</span>
                      ) : (
                        <span className="text-red-500">غير متوفر</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleAddToCart}
                disabled={addToCart.isPending || product.stock === 0}
              >
                {addToCart.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                {product.stock === 0 ? "غير متوفر" : "أضف إلى السلة"}
              </Button>


            </div>
          </div>

          {/* Reviews Section */}
          <ReviewsSection productId={productId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
