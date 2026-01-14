import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Categories router
  categories: router({
    list: publicProcedure.query(async () => {
      const { getAllCategories } = await import("./db");
      return getAllCategories();
    }),
    getBySlug: publicProcedure.input(z.string()).query(async ({ input }) => {
      const { getCategoryBySlug } = await import("./db");
      return getCategoryBySlug(input);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { createCategory } = await import("./db");
        await createCategory(input);
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { id, ...data } = input;
        const { updateCategory } = await import("./db");
        await updateCategory(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { deleteCategory } = await import("./db");
        await deleteCategory(input);
        return { success: true };
      }),
  }),

  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      const { getAllProducts } = await import("./db");
      return getAllProducts();
    }),
    getByCategory: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getProductsByCategory } = await import("./db");
      return getProductsByCategory(input);
    }),
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getProductById } = await import("./db");
      return getProductById(input);
    }),
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { createProduct } = await import("./db");
        await createProduct(input);
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { id, ...data } = input;
        const { updateProduct } = await import("./db");
        await updateProduct(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { deleteProduct } = await import("./db");
        await deleteProduct(input);
        return { success: true };
      }),
  }),

  // Cart router
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getCartItems } = await import("./db");
      return getCartItems(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { addToCart } = await import("./db");
        await addToCart(ctx.user.id, input.productId, input.quantity);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const { removeFromCart } = await import("./db");
        await removeFromCart(ctx.user.id, input);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const { clearCart } = await import("./db");
      await clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Orders router
  orders: router({
    create: protectedProcedure
      .input(z.object({
        totalAmount: z.number(),
        phoneNumber: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          price: z.number(),
          quantity: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createOrder } = await import("./db");
        const { items, ...orderData } = input;
        // Map items to include orderId (will be set in createOrder)
        const orderItemsData = items.map(item => ({
          ...item,
          orderId: 0, // Placeholder, will be set in createOrder
        }));
        const orderId = await createOrder(
          { ...orderData, userId: ctx.user.id },
          orderItemsData
        );
        return { success: true, orderId };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const { getOrdersByUser } = await import("./db");
      return getOrdersByUser(ctx.user.id);
    }),
    all: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { getAllOrders } = await import("./db");
      return getAllOrders();
    }),
   }),

  // Reviews router
  reviews: router({
    getByProduct: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getProductReviews } = await import("./db");
      return getProductReviews(input);
    }),
    getAverageRating: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getProductAverageRating } = await import("./db");
      return getProductAverageRating(input);
    }),
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
        isVerifiedPurchase: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createReview } = await import("./db");
        await createReview({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
          isVerifiedPurchase: input.isVerifiedPurchase || false,
        });
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        const { deleteReview } = await import("./db");
        await deleteReview(input, ctx.user.id);
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
