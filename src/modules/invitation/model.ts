
import { eq, and, sql, or, isNull } from "drizzle-orm";
import invitation from "./schema";
import event from "@/modules/event/schema"
import db from "@/config/db";
import repository from "./repository";
import Resource from "./resource"
import { InvitationColumn } from "./resource";
import user from "@/modules/user/schema";

export default class Invitation {
  static async list(params: any) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(invitation)
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(invitation);

    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }
  static async getEventGuest(eventId: number) {
    const event_guest = await db
      .select(repository.selectEventGuest)
      .from(invitation)
      .leftJoin(user, eq(invitation.userId, user.id))
      .where(eq(invitation.eventId, eventId));
    return event_guest;
  }
  static async getInvitedGuest(eventId: number) {
    const result = await db
      .select({
        user: repository.selectInvitationResponse.user_detail,
        status: invitation.status,
        familyId: invitation.familyId,
        category: invitation.category,
        invited_by: invitation.invited_by,
      })
      .from(invitation)
      .leftJoin(user, eq(user.id, invitation.userId))
      .where(eq(invitation.eventId, eventId));
    return result;
  }
  //get the family event or the user event based on the user id and family id
  static async listAllInvitationEvent(params: any) {
    const { page = 1, limit = 10, userId, familyId, eventId } = params;
    const offset = (page - 1) * limit;

    const invitationConditions = [];
    if (userId !== undefined && familyId !== undefined) {
      invitationConditions.push(or(eq(invitation.userId, userId), eq(invitation.familyId, familyId)));
    } else if (userId !== undefined) {
      invitationConditions.push(eq(invitation.userId, userId));
    } else if (familyId !== undefined) {
      invitationConditions.push(eq(invitation.familyId, familyId));
    }
    if (eventId !== undefined) {
      invitationConditions.push(eq(invitation.eventId, Number(eventId)));
    }

    const whereCondition = invitationConditions.length
      ? and(...invitationConditions)
      : undefined;

    let query = db
      .selectDistinct(repository.selectInvitationEvent)
      .from(invitation)
      .leftJoin(event, eq(event.id, invitation.eventId))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    const result = await query;

    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(invitation);

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

  static async findInvitationEvent({
    userId,
    familyId,
    eventId,
  }: {
    userId?: number;
    familyId?: number;
    eventId: number;
  }) {
    const invitationConditions = [];
    if (userId !== undefined && familyId !== undefined) {
      invitationConditions.push(or(eq(invitation.userId, userId), eq(invitation.familyId, familyId)));
    } else if (userId !== undefined) {
      invitationConditions.push(eq(invitation.userId, userId));
    } else if (familyId !== undefined) {
      invitationConditions.push(eq(invitation.familyId, familyId));
    }
    if (eventId !== undefined) {
      invitationConditions.push(eq(invitation.eventId, Number(eventId)));
    }


    const whereCondition = invitationConditions.length
      ? and(...invitationConditions)
      : undefined;

    let query = db
      .select(repository.selectInvitationEvent)
      .from(invitation)
      .leftJoin(event, eq(event.id, invitation.eventId))
      .where(whereCondition)

    const result = await query;
    return result[0] || null;
  }

  static async create(params: any) {
    const result = await db
      .insert(invitation)
      .values(params)
      .returning();
    return result[0];
  }

  static async update(params: Partial<InvitationColumn>, id: number) {
    const result = await db
      .update(invitation)
      .set(params as any)
      .where(eq(invitation.id, id))
      .returning();
    return result[0];
  }


  static async getInvitationResponces({ eventId, userId, familyId }: { eventId: number, userId?: number, familyId?: number }) {

    if (!userId && !familyId) return [];

    const invite = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.eventId, eventId),
          or(
            userId ? and(
              eq(invitation.userId, userId),
              isNull(invitation.familyId)
            ) : undefined
            ,
            familyId ? eq(invitation.familyId, familyId) : undefined
          )
        )
      )
      .limit(1);
    if (!invite.length) return [];
    const isFamilyInvite = invite[0]?.familyId !== null;
    const targetFamilyId = invite[0]?.familyId;

    const data = await db
      .select(repository.selectInvitationResponse)
      .from(user)
      .leftJoin(
        invitation,
        and(
          eq(invitation.eventId, eventId),
          eq(invitation.userId, user.id)
        )
      )
      .where(
        isFamilyInvite
          ? eq(user.familyId, targetFamilyId!)
          : eq(user.id, invite[0]?.userId!)
      );

    return data;
  }

  static async find(params: {
    id?: number,
    eventId?: number,
    userId?: number,
    familyId?: number
  }) {
    const { id, eventId, userId, familyId } = params;
    const conditions = [];
    if (id !== undefined) {
      conditions.push(eq(invitation.id, id));
    }
    if (eventId !== undefined) {
      conditions.push(eq(invitation.eventId, eventId));
    }
    if (userId !== undefined) {
      conditions.push(eq(invitation.userId, userId));
    }
    if (familyId !== undefined) {
      conditions.push(eq(invitation.familyId, familyId));
    }

    if (conditions.length === 0) return null;

    const result = await db
      .select(repository.select)
      .from(invitation)
      .where(and(...conditions));
    return result[0] || null;
  }
  static async makeEventGuest(
    {
      eventId,
      guestId,
      invited_by,
      familyId,
      params
    }: {
      eventId: number,
      guestId: number,
      invited_by: number,
      params: any
      familyId?: number | null
    }
  ) {
    console.log('the params i am getting in the make event guest is ', { eventId, guestId, invited_by, familyId, params })
    const normalizeNullable = (value: any) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      if (typeof value === "string") {
        const trimmed = value.trim().toLowerCase();
        if (trimmed === "null" || trimmed === "") return null;
      }
      return value;
    };

    const parseDate = (value: any) => {
      const normalized = normalizeNullable(value);
      if (normalized === undefined) return undefined;
      if (normalized === null) return null;
      const date = normalized instanceof Date ? normalized : new Date(normalized);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const parseBoolean = (value: any) => {
      const normalized = normalizeNullable(value);
      if (normalized === undefined) return undefined;
      if (normalized === null) return null;
      if (typeof normalized === "boolean") return normalized;
      if (typeof normalized === "string") {
        const lowered = normalized.toLowerCase();
        if (lowered === "true") return true;
        if (lowered === "false") return false;
      }
      return Boolean(normalized);
    };
    const rawName = params?.invitation_name ?? params?.invitationName;

    const invitationName =
      typeof rawName === "string" && rawName.trim().length > 0
        ? rawName.trim()
        : (params?.familyId ?? params?.family_id) != null
          ? "Family"
          : "Guest";
    const guestPayload = {
      invited_by,
      eventId: eventId,
      familyId: familyId ?? null,
      userId: guestId,
      invitation_name: invitationName,
      notes: normalizeNullable(params.note ?? params.notes),
      role: normalizeNullable(params.role),
      arrival_date_time: parseDate(params.arrival_date_time ?? params.arrivalDateTime),
      departure_date_time: parseDate(params.departure_date_time ?? params.departureDateTime),
      isAccomodation: parseBoolean(params.isAccomodation ?? params.isAccommodation),
      status: normalizeNullable(params.status),
    };
    console.log("😂😂 the guest payload after parsing is ", guestPayload)

    const existingGuest = await db
      .select({ id: invitation.id })
      .from(invitation).leftJoin(event, eq(invitation.eventId, eventId))
      .where(
        and(
          eq(invitation.eventId, eventId),
          eq(invitation.userId, guestId),
        ),
      )
      .limit(1);

    if (existingGuest[0]?.id) {
      const updatePayload = Object.fromEntries(
        Object.entries(guestPayload).filter(([, value]) => value !== undefined),
      );
      const updated = await db
        .update(invitation)
        .set(updatePayload)
        .where(eq(invitation.id, existingGuest[0].id))
        .returning();
      return updated[0] ?? null;
    }

    const insertPayload = Object.fromEntries(
      Object.entries(guestPayload).map(([key, value]) => [key, value === undefined ? null : value]),
    );

    const inserted = await db
      .insert(invitation)
      .values({
        ...(insertPayload as any),
        joined_at: new Date().toISOString(),
      })
      .returning();
    return inserted[0] ?? null;
  }
}



