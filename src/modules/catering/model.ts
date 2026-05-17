import db from "@/config/db";
import event from "@/modules/event/schema"
import catering, { menuSchema } from "./schema";
import Repository from "./repository";
import { eq, sql, desc, or } from "drizzle-orm";
import type { CateringColumn, MenuItemColumn } from "./resource";

class Catering {
  static async createCatering(
    params: Partial<CateringColumn> & { eventId: number },
  ) {
    try {
      console.log(params);
      const result = await db
        .insert(catering)
        .values(params as any)
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async listCaterings(params: {
    eventId: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (Number(page) - 1) * Number(limit);

      const items = await db
        .select(Repository.cateringSelectQuery)
        .from(catering)
        .leftJoin(event, eq(event.id, catering.eventId))


        .where(
          or(
            eq(
              catering.eventId, params.eventId
            ),
            eq(
              event.parentId, params.eventId
            )
          )
        )

        .orderBy(desc(catering.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(catering)
        .where(eq(catering.eventId, params.eventId));

      const count = Number(countResult[0]?.count ?? 0);

      return {
        items,
        page: Number(page),
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  static async findCateringById(id: number): Promise<CateringColumn | null> {
    try {
      const result = await db
        .select(Repository.cateringSelectQuery)
        .from(catering)
        .where(eq(catering.id, id));
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async updateCatering(
    id: number,
    params: Partial<CateringColumn>,
  ): Promise<CateringColumn | null> {
    try {
      const result = await db
        .update(catering)
        .set({ ...params, updatedAt: new Date() } as any)
        .where(eq(catering.id, id))
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async deleteCatering(id: number) {
    try {
      const result = await db
        .delete(catering)
        .where(eq(catering.id, id))
        .returning();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async createMenuItem(
    params: Partial<MenuItemColumn> & { cateringId: number },
  ): Promise<MenuItemColumn | null> {
    try {
      const result = await db
        .insert(menuSchema)
        .values(params as any)
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async listMenuItems(cateringId: number): Promise<MenuItemColumn[]> {
    try {
      const result = await db
        .select(Repository.menuSelectQuery)
        .from(menuSchema)
        .where(eq(menuSchema.cateringId, cateringId))
        .orderBy(desc(menuSchema.createdAt));
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findMenuItemById(id: number): Promise<MenuItemColumn | null> {
    try {
      const result = await db
        .select(Repository.menuSelectQuery)
        .from(menuSchema)
        .where(eq(menuSchema.id, id));
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async updateMenuItem(
    id: number,
    params: Partial<MenuItemColumn>,
  ): Promise<MenuItemColumn | null> {
    try {
      const result = await db
        .update(menuSchema)
        .set({ ...params, updatedAt: new Date() } as any)
        .where(eq(menuSchema.id, id))
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async deleteMenuItem(id: number) {
    try {
      const result = await db
        .delete(menuSchema)
        .where(eq(menuSchema.id, id))
        .returning();
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default Catering;
