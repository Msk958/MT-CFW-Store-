import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, LogOut, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: myOrders = [], isLoading: ordersLoading } = trpc.orders.myOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "secondary" },
      processing: { label: "قيد المعالجة", variant: "default" },
      completed: { label: "مكتمل", variant: "outline" },
      cancelled: { label: "ملغي", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">حسابي</h1>
              <p className="text-muted-foreground">مرحباً {user?.name || "المستخدم"}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto">
              <TabsTrigger value="profile">بيانات الحساب</TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">الطلبات</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>بيانات الحساب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">الاسم</label>
                      <p className="text-lg font-medium">{user?.name || "-"}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                      <p className="text-lg font-medium">{user?.email || "-"}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">طريقة تسجيل الدخول</label>
                      <p className="text-lg font-medium">{user?.loginMethod || "-"}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">الصلاحية</label>
                      <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
                        {user?.role === "admin" ? "مدير" : "مستخدم"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">تاريخ الانضمام</label>
                      <p className="text-lg font-medium">{formatDate(user?.createdAt || new Date())}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">آخر دخول</label>
                      <p className="text-lg font-medium">{formatDate(user?.lastSignedIn || new Date())}</p>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <div className="border-t border-primary/20 pt-6">
                      <Button asChild>
                        <Link href="/admin">الذهاب إلى لوحة التحكم</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>طلباتي</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : myOrders.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-muted-foreground">لا توجد طلبات حتى الآن</p>
                      <Button asChild>
                        <Link href="/">ابدأ التسوق</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-primary/20 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">الطلب #{order.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                            <span className="text-muted-foreground">المبلغ الإجمالي</span>
                            <span className="text-lg font-bold text-primary">
                              {order.totalAmount} ر.س
                            </span>
                          </div>

                          {order.notes && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              <p className="font-medium mb-1">ملاحظات:</p>
                              <p>{order.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
