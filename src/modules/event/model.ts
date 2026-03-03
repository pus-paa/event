import db from "@/config/db";
import { sql, eq, or } from "drizzle-orm";
import event, { event_guest_schema, event_vendor_schema } from "./schema";
import { event_member_schema } from "./schema";
import repository from "./repository";

import { EventColumn } from "./resource";
import { rsvp, user } from "@/config/db/schema";

class Event {
  static async findAllAndCount(params: any) {
    const { page = 1, limit = 10, userId } = params;
    const offset = (page - 1) * limit;

    const whereClause = or(
      eq(event.organizer, userId),
      sql`${rsvp.userId} = ${userId} AND ${rsvp.status} != 'Pending'`
    );

    const result = await db
      .selectDistinct(repository.selectQuery)
      .from(event)
      .leftJoin(rsvp, eq(rsvp.eventId, event.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(DISTINCT ${event.id})` })
      .from(event)
      .leftJoin(rsvp, eq(rsvp.eventId, event.id))
      .where(whereClause);

    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }
  static async create(params: EventColumn) {
    const result = await db
      .insert(event)
      .values(params as any)
      .returning();
    return result[0];
  }

  static async find(params: Partial<EventColumn>) {
    const { id, title } = params;
    const conditions = [];
    if (id !== undefined) {
      conditions.push(eq(event.id, id));
    }
    if (title !== undefined) {
      conditions.push(eq(event.title, title as string));
    }

    if (conditions.length === 0) return null;

    const result = await db
      .select()
      .from(event)
      .where(or(...conditions));
    return result[0] || null;
  }

  static async update(params: Partial<EventColumn>, id: number) {
    const result = await db
      .update(event)
      .set({ ...params, updatedAt: new Date() } as any)
      .where(eq(event.id, id))
      .returning();
    return result[0] || null;
  }

  static async destroy(id: number) {
    const result = await db.delete(event).where(eq(event.id, id)).returning();
    return result;
  }

  static async findByUser(userId: number, params: any) {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const result = await db
      .select(repository.selectQuery)
      .from(event_member_schema)
      .where(eq(event_member_schema.userId, userId))
      .leftJoin(event, eq(event.id, event_member_schema.eventId))
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(event_member_schema)
      .where(eq(event_member_schema.userId, userId));

    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async getInvitedGuest(eventId: number) {
    const result = await db
      .select({
        user: repository.selectEventGuest.user,
        status: rsvp.status,
        familyId: rsvp.familyId,
        category: rsvp.category,
        invited_by: rsvp.invited_by,
      })
      .from(rsvp)
      .innerJoin(user, eq(rsvp.userId, user.id))
      .where(eq(rsvp.eventId, eventId));
    return result;
  }
  static async getEventMember(eventId: number) {
    const result = await db
      .select(repository.SelectEventOwners)
      .from(event_member_schema)
      .where(eq(event_member_schema.eventId, eventId))
      .leftJoin(user, eq(user.id, event_member_schema.userId));
    return result;
  }

  static async getEventGuest(eventId: number) {
    console.log("This is the event id of the event geust ", eventId);
    const event_guest = await db
      .select(repository.selectEventGuest)
      .from(event_guest_schema).leftJoin(
        user, eq(event_guest_schema.userId, user.id)
      ).leftJoin(rsvp, eq(rsvp.eventId, eventId))
      .where(eq(event_guest_schema.eventId, eventId));
    return event_guest;
  }

  static async makeeEventOwner(eventId: number, eventMemberId: number) {
    const event_member_returning = await db
      .insert(event_member_schema)
      .values({
        eventId: eventId,
        userId: eventMemberId,
      })
      .returning();
    return event_member_returning[0];
  }
  static async getEventVendor(eventId: number) {
    const event_vendor = await db
      .select()
      .from(event_vendor_schema)
      .where(eq(event_vendor_schema.event_id, eventId));
    return event_vendor;
  }
  static async makeEventGuest(
    eventId: number,
    guestId: number,
    invited_by: number
    ,
    familyId: number | null
  ) {
    const event_guest = await db
      .insert(event_guest_schema)
      .values({
        invited_by: invited_by,
        joined_at: "",
        eventId: eventId,
        familyId: familyId,
        userId: guestId,
      })
      .returning();
    return event_guest;
  }
}

export default Event;
