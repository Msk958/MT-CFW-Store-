import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { useState } from "react";

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: cartItems = [] } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء الطلب بنجاح!");
      setOrderCompleted(true);
      utils.cart.get.invalidate();
      utils.orders.myOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
      setIsSubmitting(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">يجب تسجيل الدخول أولاً</h1>
            <Button asChild>
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">السلة فارغة</h1>
            <p className="text-muted-foreground">لا توجد منتجات لإتمام الطلب</p>
            <Button asChild>
              <Link href="/">العودة للتسوق</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderCompleted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="border-primary/20 max-w-md w-full mx-4">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">تم إنشاء الطلب بنجاح!</h1>
                <p className="text-muted-foreground">شكراً لك على الشراء</p>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/account">عرض الطلبات</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">متابعة التسوق</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => {
    return sum + ((item.productPrice || 0) * (item.quantity || 0));
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const items = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName || "",
      price: item.productPrice || 0,
      quantity: item.quantity || 0,
    }));

    createOrder.mutate({
      totalAmount: total,
      phoneNumber: formData.phoneNumber,
      notes: formData.notes || undefined,
      items,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold text-primary mb-8">إتمام الطلب</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>بيانات الطلب</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNumber: e.target.value })
                        }
                        required
                        placeholder="+966 XX XXX XXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="أي ملاحظات أو طلبات خاصة..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || createOrder.isPending}
                    >
                      {isSubmitting || createOrder.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      إتمام الطلب
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-primary/20 sticky top-20">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productName} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.productPrice || 0) * (item.quantity || 0)} ر.س
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-primary/20 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>{total} ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الشحن</span>
                      <span>مجاني</span>
                    </div>
                  </div>

                  <div className="border-t border-primary/20 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>المجموع الكلي</span>
                      <span className="text-primary">{total} ر.س</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
