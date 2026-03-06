import event from "@/modules/event/schema"
import { eq, and, sql, or } from "drizzle-orm";
import rsvp from "./schema";
import db from "@/config/db";
import repository from "./repository";
import Resource from "./resource"

export default class Rsvp {
  static async list(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(rsvp)
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(rsvp);

    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async findAllInvitation(params: any) {
    const { page = 1, limit = 10, userId, familyId } = params;
    const offset = (page - 1) * limit;
    const conditions = or(eq(rsvp.userId, userId), (rsvp.familyId, familyId));

    const result = await db
      .select(repository.selectInvitationEvent)
      .from(rsvp)
      .innerJoin(event, eq(rsvp.eventId, event.id))
      .where(conditions)
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(rsvp)
      .where(eq(rsvp.userId, userId));

    return {
      items: Resource.invitationeventCollection(result),
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async create(params: any) {
    const result = await db
      .insert(rsvp)
      .values(params as any)
      .returning();
    return result[0];
  }

  static async update(params: any, id: number) {
    const result = await db
      .update(rsvp)
      .set(params as any)
      .where(eq(rsvp.id, id))
      .returning();
    return result[0];
  }

  static async updateInvitationStatus(id: number, status: string, respondedBy?: number) {
    const now = new Date().toISOString();
    const result = await db
      .update(rsvp)
      .set({
        status,
        respondedAt: now,
        updatedAt: now,
        responded_by: respondedBy,
      } as any)
      .where(eq(rsvp.id, id))
      .returning();
    return result[0];
  }

  static async find(params: {
    id: number,
    eventId?: number,
    userId?: number
  }) {
    const { id, eventId, userId } = params;
    const conditions = [];
    if (id !== undefined) {
      conditions.push(eq(rsvp.id, id));
    }
    if (eventId !== undefined) {
      conditions.push(eq(rsvp.eventId, eventId));
    }
    if (userId !== undefined) {
      conditions.push(eq(rsvp.userId, userId));
    }

    if (conditions.length === 0) return null;

    const result = await db
      .select()
      .from(rsvp)
      .where(and(...conditions));
    return result[0] || null;
  }
}



