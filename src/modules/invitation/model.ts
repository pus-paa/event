import event, { event_guest_schema } from "@/modules/event/schema"
import { eq, and, sql, or } from "drizzle-orm";
import rsvp from "./schema";
import db from "@/config/db";
import repository from "./repository";
import Resource from "./resource"
import user from "@/modules/user/schema";

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
    const { page = 1, limit = 10, userId, familyId, eventId } = params;
    const offset = (page - 1) * limit;

    const invitationConditions = [];
    if (userId !== undefined && familyId !== undefined) {
      invitationConditions.push(or(eq(rsvp.userId, userId), eq(rsvp.familyId, familyId)));
    } else if (userId !== undefined) {
      invitationConditions.push(eq(rsvp.userId, userId));
    } else if (familyId !== undefined) {
      invitationConditions.push(eq(rsvp.familyId, familyId));
    }
    if (eventId !== undefined) {
      invitationConditions.push(eq(rsvp.eventId, Number(eventId)));
    }

    const whereCondition = invitationConditions.length
      ? and(...invitationConditions)
      : undefined;

    let query = db
      .select(repository.selectInvitationEvent)
      .from(rsvp)
      .innerJoin(event, eq(rsvp.eventId, event.id))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);
    const result = await query;



    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(rsvp);

    if (whereCondition) {
      countQuery = countQuery.where(whereCondition) as any;
    }

    const [{ count }]: any = await countQuery;

    return {
      items: Resource.invitationeventCollection(result as any),
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async listFamilyInvitationResponse(eventId: number, familyId: number) {
    return this.listInvitationResponse(eventId, { familyId });
  }

  static async listInvitationResponse(
    eventId: number,
    filters: { familyId?: number; userId?: number },
  ) {
    const { familyId, userId } = filters;
    const userFilters = [];

    if (familyId !== undefined) {
      userFilters.push(eq(user.familyId, familyId));
    }

    if (userId !== undefined) {
      userFilters.push(eq(user.id, userId));
    }

    const whereCondition = userFilters.length === 1
      ? userFilters[0]
      : userFilters.length > 1
        ? or(...userFilters)
        : undefined;

    const rows = db
      .select(repository.selectFamilyInvitationResponse)
      .from(user)
      .leftJoin(
        event_guest_schema,
        and(
          eq(event_guest_schema.userId, user.id),
          eq(event_guest_schema.eventId, eventId),
        ),
      );

    const filteredRows = whereCondition
      ? await rows.where(whereCondition as any)
      : await rows;

    const normalized = filteredRows.map((row: any) => ({
      ...row,
      event_guest: row?.event_guest?.id ? row.event_guest : null,
    }));

    return Resource.familyInvitationResponseCollection(normalized);
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
  static async getInvitationResponce(id: number, userId: number, familyId: number) {
    void familyId;
    const data = await db.select(repository.selectguestResponce).from(event_guest_schema).where(and(eq(event_guest_schema.eventId, id), (eq(event_guest_schema.userId, userId))));
    return data[0];

  }
  static async find(params: {
    id?: number,
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



