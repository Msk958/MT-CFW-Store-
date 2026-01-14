import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, Package, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const utils = trpc.useUtils();
  
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج للسلة");
      utils.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المنتج");
    },
  });

  // Get featured products (first 6)
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Logo with Glow Effect */}
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="MT CFW" 
                  className="h-32 w-32 md:h-48 md:w-48"
                  style={{
                    filter: 'drop-shadow(0 0 20px oklch(0.75 0.25 145)) drop-shadow(0 0 40px oklch(0.75 0.25 145 / 0.5))'
                  }}
                />
              </div>
              
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary"
                style={{
                  textShadow: '0 0 20px oklch(0.75 0.25 145), 0 0 40px oklch(0.75 0.25 145), 0 0 60px oklch(0.75 0.25 145)'
                }}
              >
                MT CFW
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                متجر مختص لبيع المنتجات الرقمية
              </p>
              
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="#products">عرض المنتجات</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-card/50">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">منتجات متنوعة</h3>
                  <p className="text-muted-foreground">مجموعة واسعة من المنتجات الرقمية عالية الجودة</p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">تسليم فوري</h3>
                  <p className="text-muted-foreground">احصل على منتجاتك فورًا بعد الشراء</p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">دفع آمن</h3>
                  <p className="text-muted-foreground">نظام دفع آمن وموثوق</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-16">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12 text-primary">الفئات</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.slug}`}>
                    <Card className="border-primary/20 hover:border-primary/50 transition-all cursor-pointer group">
                      <CardContent className="pt-6 text-center space-y-2">
                        <div className="text-3xl mb-2">{category.icon || "📦"}</div>
                        <p className="font-medium group-hover:text-primary transition-colors">{category.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section id="products" className="py-16 bg-card/50">
            <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12 text-primary">المنتجات المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <Card key={product.id} className="border-primary/20 hover:border-primary/50 transition-all group">
                    <CardContent className="p-6 space-y-4">
                      {product.imageUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-2xl font-bold text-primary">
                            {product.price} ر.س
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (!isAuthenticated) {
                                window.location.href = getLoginUrl();
                                return;
                              }
                              addToCart.mutate({
                                productId: product.id,
                                quantity: 1,
                              });
                            }}
                            disabled={addToCart.isPending}
                          >
                            {addToCart.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "إضافة للسلة"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {products.length > 6 && (
                <div className="text-center mt-12">
                  <Button asChild size="lg" variant="outline">
                    <Link href="/category/all">عرض جميع المنتجات</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
