import db from "@/config/db";
import users from "./schema";
import type { UserColumn } from "./resource";
import Repository from "./repository";
import { sql, not, eq, or } from "drizzle-orm";
import { user } from "@/config/db/schema";

class User {

  private static toDobString(value: unknown): string | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (value instanceof Date) return value.toISOString().split("T")[0];
    if (typeof value === "string") return value;
    return undefined;
  }

  static async findAllAndCount(params: any) {
    const { page, limit, email, phone } = params;
    let conditions = []
    if (email) {
      conditions.push(eq(user.email, email))
    }
    if (phone) {
      conditions.push(eq(user.phone, phone));
    }
    const offset = (page - 1) * limit;
    const result = conditions ? await db.select(Repository.selectQuery).from(user).where(or(...conditions)).limit(limit).offset(offset) : await db
      .select(Repository.selectQuery as any)
      .from(users)
      .where(
        not(eq(users.id, 1))
      )
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(not(eq(users.id, 1)));
    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }
  static async findAllInvitation(params: any) {
    const { page, limit, email, phone } = params;
    let conditions = []
    if (email) {
      conditions.push(eq(user.email, email))
    }
    if (phone) {
      conditions.push(eq(user.phone, phone));
    }
    const offset = (page - 1) * limit;
    const result = conditions ? await db.select(Repository.selectQuery).from(user).where(or(...conditions)).limit(limit).offset(offset) : await db
      .select(Repository.selectQuery)
      .from(users)
      .where(
        not(eq(users.id, 1))
      )
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(not(eq(users.id, 1)));
    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };

  }

  static async create(params: Partial<UserColumn>, password: string) {
    const insertParams: any = {
      ...params,
      dob: User.toDobString(params.dob) ?? new Date().toISOString().split("T")[0],
      phone: params.phone ?? `+977${Date.now()}`,
      password,
      relation: params.relation ?? "Default relation"
    };


    const result = await db.insert(users).values(insertParams).returning();
    return result[0];
  }

  static async find(
    params: Partial<UserColumn>,
    options: { includePassword: true },
  ): Promise<(UserColumn & { password: string }) | null>;
  static async find(
    params: Partial<UserColumn>,
    options?: { includePassword?: false },
  ): Promise<UserColumn | null>;
  static async find(
    params: Partial<UserColumn>,
    options: { includePassword?: boolean } = {},
  ): Promise<(UserColumn & { password: string }) | UserColumn | null> {
    const { id, email, phone } = params;
    const conditions = [];
    if (id !== undefined) {
      conditions.push(eq(users.id, id));
    }
    if (email !== undefined) {
      conditions.push(eq(users.email, email));
    }

    if (phone !== undefined) {
      conditions.push(eq(users.phone, phone));
    }

    if (conditions.length === 0) {
      return null;
    }
    const selectShape = options.includePassword
      ? Repository.authSelectQuery
      : Repository.selectQuery;

    const result = await db
      .select(selectShape)
      .from(users)
      .where(conditions.length === 1 ? conditions[0] : or(...conditions));
    return result[0] || null;
  }
  static async update(
    params: Partial<UserColumn | { password: string }>,
    id: number,
  ) {
    const updatedParams: any = {
      ...params,
    };

    if ("dob" in updatedParams) {
      const normalizedDob = User.toDobString(updatedParams.dob);
      if (normalizedDob !== undefined) updatedParams.dob = normalizedDob;
      else delete updatedParams.dob;
    }

    const result: any = await db
      .update(users)
      .set(updatedParams)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }
  static async destroy(id: number) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result;
  }
}

export default User;
