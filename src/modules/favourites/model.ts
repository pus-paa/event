import db from "@/config/db";
import { eq, and } from "drizzle-orm";
import favouritesTable from "./schema";
import businessSchema from "@/modules/businesses/schema";
import repository from "@/modules/businesses/repository";

class FavouritesModel {
  static async findByUser(userId: number) {
    return db
      .select(repository.businessSelectQuery)
      .from(favouritesTable)
      .innerJoin(businessSchema, eq(favouritesTable.businessId, businessSchema.id))
      .where(eq(favouritesTable.userId, userId));
  }

  static async findOne(userId: number, businessId: number) {
    const rows = await db
      .select()
      .from(favouritesTable)
      .where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.businessId, businessId)))
      .limit(1);
    return rows[0] ?? null;
  }

  static async create(userId: number, businessId: number) {
    const rows = await db
      .insert(favouritesTable)
      .values({ userId, businessId })
      .onConflictDoNothing()
      .returning();
    return rows[0] ?? null;
  }

  static async destroy(userId: number, businessId: number) {
    return db
      .delete(favouritesTable)
      .where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.businessId, businessId)))
      .returning();
  }
}

export default FavouritesModel;
