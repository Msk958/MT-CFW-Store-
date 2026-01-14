import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("categories API", () => {
  it("should list categories", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();
    
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should allow admin to create category", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const timestamp = Date.now();
    const result = await caller.categories.create({
      name: `Test Category ${timestamp}`,
      slug: `test-category-${timestamp}`,
      description: "Test description",
      icon: "🧪",
      displayOrder: 99,
    });

    expect(result.success).toBe(true);
  });
});
