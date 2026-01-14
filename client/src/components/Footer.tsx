import { Link } from "wouter";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MT CFW" className="h-12 w-12" />
              <span className="text-2xl font-bold text-primary" style={{
                textShadow: '0 0 10px oklch(0.75 0.25 145), 0 0 20px oklch(0.75 0.25 145)'
              }}>
                MT CFW
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              متجر مختص لبيع المنتجات الرقمية
            </p>
          </div>

          {/* Store Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">المتجر</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    الرئيسية
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/cars">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    سيارات
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/category/packages">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    بكجات
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    الدعم الفني
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">العميل</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    حسابي
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cart">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    السلة
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    اتصل بنا
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-primary/20 text-center">
          <p className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} MT CFW
          </p>
        </div>
      </div>
    </footer>
  );
}
