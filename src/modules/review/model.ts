import db from "@/config/db";
import Review from "./schema";
import Repository from "./repository";
import { eq, sql, desc, and } from "drizzle-orm";
import type { ReviewColumn } from "./resource";

class ReviewModel {
  static async createReview(
    params: Partial<ReviewColumn> & { businessId: number },
  ) {
    try {
      const result = await db
        .insert(Review)
        .values(params as any)
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async listReviews(params: {
    businessId?: number;
    userId?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (Number(page) - 1) * Number(limit);

      const conditions = [];
      if (params.businessId) {
        conditions.push(eq(Review.businessId, params.businessId));
      }
      if (params.userId) {
        conditions.push(eq(Review.userId, params.userId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select(Repository.reviewSelectQuery)
        .from(Review)
        .where(whereClause)
        .orderBy(desc(Review.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(Review)
        .where(whereClause);

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

  static async findReviewById(id: number): Promise<ReviewColumn | null> {
    try {
      const result = await db
        .select(Repository.reviewSelectQuery)
        .from(Review)
        .where(eq(Review.id, id));
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async updateReview(
    id: number,
    params: Partial<ReviewColumn>,
  ): Promise<ReviewColumn | null> {
    try {
      const result = await db
        .update(Review)
        .set({ ...params} )
        .where(eq(Review.id, id))
        .returning();
      return result[0] ?? null;
    } catch (error) {
      throw error;
    }
  }

  static async deleteReview(id: number) {
    try {
      const result = await db
        .delete(Review)
        .where(eq(Review.id, id))
        .returning();
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default ReviewModel;
