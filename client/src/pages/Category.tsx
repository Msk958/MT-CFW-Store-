import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Category() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const { isAuthenticated } = useAuth();
  
  const { data: category } = trpc.categories.getBySlug.useQuery(slug);
  const { data: allProducts = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة المنتج إلى السلة");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المنتج");
    },
  });

  // Filter products by category
  const products = slug === "all" 
    ? allProducts 
    : allProducts.filter(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        return cat?.slug === slug;
      });

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
  };

  if (!category && slug !== "all") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">الفئة غير موجودة</h1>
            <Button asChild>
              <a href="/">العودة للرئيسية</a>
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
          {/* Category Header */}
          <div className="mb-12 text-center space-y-4">
            {slug === "all" ? (
              <>
                <h1 className="text-4xl font-bold text-primary">جميع المنتجات</h1>
                <p className="text-muted-foreground">تصفح جميع المنتجات المتاحة</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">{category?.icon || "📦"}</div>
                <h1 className="text-4xl font-bold text-primary">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground">{category.description}</p>
                )}
              </>
            )}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="border-primary/20 hover:border-primary/50 transition-all group"
                >
                  <CardContent className="p-6 space-y-4">
                    {product.imageUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
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
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addToCart.isPending || product.stock === 0}
                        >
                          {addToCart.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : product.stock === 0 ? (
                            "نفذت الكمية"
                          ) : (
                            "إضافة للسلة"
                          )}
                        </Button>
                      </div>
                      
                      {product.stock > 0 && product.stock < 10 && (
                        <p className="text-xs text-yellow-500">
                          متبقي {product.stock} فقط
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
