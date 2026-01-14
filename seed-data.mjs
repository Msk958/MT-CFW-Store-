import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Seed categories
const categoriesData = [
  { name: "سيارات", slug: "cars", description: "سيارات متنوعة", icon: "🚗", displayOrder: 1 },
  { name: "بكجات", slug: "packages", description: "بكجات مميزة", icon: "📦", displayOrder: 2 },
  { name: "اولوية", slug: "priority", description: "خدمات الأولوية", icon: "⭐", displayOrder: 3 },
  { name: "ورشات", slug: "workshops", description: "ورشات العمل", icon: "🔧", displayOrder: 4 },
  { name: "مطاعم", slug: "restaurants", description: "مطاعم ومقاهي", icon: "🍔", displayOrder: 5 },
  { name: "الشخصيات", slug: "characters", description: "شخصيات مميزة", icon: "👤", displayOrder: 6 },
];

console.log("Seeding categories...");
for (const cat of categoriesData) {
  await db.insert(categories).values(cat);
}

// Seed products
const productsData = [
  { categoryId: 1, name: "سيارة رياضية", description: "سيارة رياضية سريعة", price: 50000, stock: 10 },
  { categoryId: 1, name: "سيارة فاخرة", description: "سيارة فاخرة مريحة", price: 80000, stock: 5 },
  { categoryId: 2, name: "بكج المبتدئين", description: "بكج شامل للمبتدئين", price: 10000, stock: 50 },
  { categoryId: 2, name: "بكج المحترفين", description: "بكج متقدم للمحترفين", price: 25000, stock: 30 },
  { categoryId: 3, name: "أولوية VIP", description: "خدمة أولوية VIP", price: 15000, stock: 20 },
  { categoryId: 4, name: "ورشة ميكانيكا", description: "ورشة ميكانيكا متكاملة", price: 35000, stock: 8 },
];

console.log("Seeding products...");
for (const prod of productsData) {
  await db.insert(products).values(prod);
}

console.log("Seeding completed!");
process.exit(0);
