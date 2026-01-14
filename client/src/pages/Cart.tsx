import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: cartItems = [], isLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFromCart = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المنتج من السلة");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المنتج");
    },
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => {
      toast.success("تم تفريغ السلة");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تفريغ السلة");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
            <h1 className="text-2xl font-bold">يجب تسجيل الدخول أولاً</h1>
            <p className="text-muted-foreground">قم بتسجيل الدخول لعرض سلة التسوق</p>
            <Button asChild>
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => {
    return sum + ((item.productPrice || 0) * (item.quantity || 0));
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-primary mb-8">سلة التسوق</h1>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center space-y-4">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">السلة فارغة</h2>
                <p className="text-muted-foreground">لم تقم بإضافة أي منتجات بعد</p>
                <Button asChild>
                  <Link href="/">تصفح المنتجات</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {item.productImage ? (
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img 
                              src={item.productImage} 
                              alt={item.productName || ""}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-lg">{item.productName}</h3>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                الكمية: {item.quantity}
                              </p>
                              <p className="text-xl font-bold text-primary">
                                {(item.productPrice || 0) * (item.quantity || 0)} ر.س
                              </p>
                            </div>
                            
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => removeFromCart.mutate(item.id)}
                              disabled={removeFromCart.isPending}
                            >
                              {removeFromCart.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => clearCart.mutate()}
                  disabled={clearCart.isPending}
                >
                  {clearCart.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  تفريغ السلة
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-primary/20 sticky top-20">
                  <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">عدد المنتجات</span>
                        <span>{cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span>{total} ر.س</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-primary/20 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>المجموع الكلي</span>
                        <span className="text-primary">{total} ر.س</span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full" size="lg">
                      <Link href="/checkout">إتمام الطلب</Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/">متابعة التسوق</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
