import db from "@/config/db";
import { sql, eq, or, and, isNull } from "drizzle-orm";
import event from "./schema";
import { event_vendorTable } from "@/config/db/schema";
import { event_member_schema } from "./schema";
import repository from "./repository";

import { EventColumn } from "./resource";
import { rsvp, user } from "@/config/db/schema";

class Event {
  static async findAllAndCount(params: any) {
    const { page = 1, limit = 10, userId } = params;
    const offset = (page - 1) * limit;

    const whereClause = and(
      or(eq(event.organizer, userId), eq(event_member_schema.userId, userId)),
      isNull(event.parentId), // TODO: update the check to also include the event member
    );

    const result = await db
      .selectDistinct(repository.selectQuery)
      .from(event)
      .leftJoin(
        event_member_schema,
        and(
          eq(event_member_schema.eventId, event.id),
          eq(event_member_schema.userId, userId),
        ),
      )
      .where(whereClause)
      .orderBy(event.startDateTime)
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(DISTINCT ${event.id})` })
      .from(event)
      .leftJoin(event_member_schema, eq(event_member_schema.eventId, event.id))
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
      .where(
        and(eq(event_member_schema.userId, userId), isNull(event.parentId)),
      )
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
  static async getEventMember(eventId: number) {
    const result = await db
      .select(repository.SelectEventOwners)
      .from(event_member_schema)
      .where(eq(event_member_schema.eventId, eventId))
      .leftJoin(user, eq(user.id, event_member_schema.userId));
    return result;
  }

  static async isUserEventAdmin(eventId: number, userId: number) {
    const result = await db
      .select()
      .from(event_member_schema)
      .where(
        and(
          eq(event_member_schema.eventId, eventId),
          eq(event_member_schema.userId, userId),
          or(
            eq(event_member_schema.role, "Organizer"),
            eq(event_member_schema.role, "co-host"),
          ),
        ),
      );
    return result.length > 0;
  }

  static async makeEventOwner(
    eventId: number,
    eventMemberId: number,
    role: string,
  ) {
    const event_member_returning = await db
      .insert(event_member_schema)
      .values({
        eventId: eventId,
        userId: eventMemberId,
        role: role,
      })
      .returning();
    return event_member_returning[0];
  }
  static async getEventVendor(eventId: number) {
    const event_vendor = await db
      .select()
      .from(event_vendorTable)
      .where(eq(event_vendorTable.event_id, eventId));
    return event_vendor;
  }

  static async getSubEventOfEvent(eventId: number) {
    const subEvents = await db
      .select()
      .from(event)
      .where(eq(event.parentId, eventId));
    return subEvents;
  }
}

export default Event;
