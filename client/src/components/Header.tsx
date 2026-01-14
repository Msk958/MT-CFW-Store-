import { Link } from "wouter";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { data: cartItems = [] } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const categories = [
    { name: "الرئيسية", href: "/" },
    { name: "سيارات", href: "/category/cars" },
    { name: "بكجات", href: "/category/packages" },
    { name: "اولوية", href: "/category/priority" },
    { name: "ورشات", href: "/category/workshops" },
    { name: "مطاعم", href: "/category/restaurants" },
    { name: "الشخصيات", href: "/category/characters" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/logo.png" alt="MT CFW" className="h-10 w-10" />
              <span className="text-2xl font-bold text-primary" style={{
                textShadow: '0 0 10px oklch(0.75 0.25 145), 0 0 20px oklch(0.75 0.25 145)'
              }}>
                MT CFW
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((category) => (
              <Link key={category.href} href={category.href}>
                <span className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors cursor-pointer">
                  {category.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <>
                <Link href={user?.role === 'admin' ? '/admin' : '/account'}>
                  <Button variant="ghost" size="icon" title="حسابي">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <a href={getLoginUrl()}>تسجيل الدخول</a>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary/20">
            <div className="flex flex-col gap-3">
              {categories.map((category) => (
                <Link key={category.href} href={category.href}>
                  <span
                    className="block px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
