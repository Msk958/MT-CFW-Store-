import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, FolderTree, ShoppingCart, Loader2 } from "lucide-react";
import { Link } from "wouter";
import ProductsManagement from "@/components/admin/ProductsManagement";
import CategoriesManagement from "@/components/admin/CategoriesManagement";
import OrdersManagement from "@/components/admin/OrdersManagement";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();

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

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">غير مصرح لك بالدخول</h1>
            <p className="text-muted-foreground">هذه الصفحة مخصصة للمدراء فقط</p>
            <Button asChild>
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground">إدارة المتجر والمنتجات</p>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">المنتجات</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <FolderTree className="h-4 w-4" />
                <span className="hidden sm:inline">الفئات</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">الطلبات</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsManagement />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesManagement />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
