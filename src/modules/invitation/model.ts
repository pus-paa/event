import { eq, and, sql, or, isNull, ne } from "drizzle-orm";
import invitation from "./schema";
import family from "@/modules/family/schema";
import event from "@/modules/event/schema";
import db from "@/config/db";
import repository from "./repository";
import Resource from "./resource";
import { InvitationColumn } from "./resource";
import user from "@/modules/user/schema";
import { invitationStatus } from "@/constant"
import { setResponcevalidationType } from "./validators";

export default class Invitation {
  static async list(params: any) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(invitation)
      .where(ne(invitation.status, invitationStatus.draft))
      .limit(limit)
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(invitation)
      .where(ne(invitation.status, invitationStatus.draft));

    return {
      items: result,
      page,
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }

  static async getEventGuest(eventId: number) {
    const event_guest = await db
      .select(repository.selectInvitationResponse)
      .from(invitation)
      .leftJoin(user, eq(invitation.userId, user.id))
      .leftJoin(family, eq(family.id, invitation.familyId))
      .where(eq(invitation.eventId, eventId));

    console.log(event_guest);
    return event_guest;
  }

  //get the family event or the user event based on the user id and family id
  static async listAllInvitationEvent(params: any) {
    const { page = 1, limit = 10, userId, familyId, eventId } = params;
    const offset = (page - 1) * limit;

    const invitationConditions = [];
    if (userId !== undefined && familyId !== undefined) {
      invitationConditions.push(
        or(eq(invitation.userId, userId), eq(invitation.familyId, familyId)),
      );
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
    //Yesma eventId ko max id bhako invitation ra event euta row banera CTE banxa
    const distinctEventInvitations = db
      .select({
        eventId: invitation.eventId,
        latestInvitationId: sql<number>`max(${invitation.id})`.as(
          "latestInvitationId",
        ),
      })
      .from(invitation)
      .where(and(whereCondition, ne(invitation.status, invitationStatus.draft)))
      .groupBy(invitation.eventId)
      .as("distinct_event_invitations");
    //Tyo pako CTE table bata eventId ani , invitation ko detail hamlai tannera chaini kura linxa
    const result = await db
      .select(repository.selectInvitationEvent)
      .from(distinctEventInvitations)
      .leftJoin(
        invitation,
        eq(invitation.id, distinctEventInvitations.latestInvitationId),
      )
      .leftJoin(event, eq(event.id, distinctEventInvitations.eventId))
      .limit(limit)
      .offset(offset);

    let countQuery = db
      .select({ count: sql<number>`count(distinct ${invitation.eventId})` })
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
      invitationConditions.push(
        or(eq(invitation.userId, userId), eq(invitation.familyId, familyId)),
      );
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
      .where(whereCondition);

    const result = await query;

    return result[0] || null;
  }

  static async create(params: any) {
    const result = await db.insert(invitation).values(params).returning();
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

  static async getInvitationResponces({
    eventId,
    userId,
    familyId,
  }: {
    eventId: number;
    userId?: number;
    familyId?: number;
  }) {
    if (!userId && !familyId) return [];

    const invite = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.eventId, eventId),
          or(
            userId
              ? and(eq(invitation.userId, userId), isNull(invitation.familyId))
              : undefined,
            familyId ? eq(invitation.familyId, familyId) : undefined,
          ),
        ),
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
        and(eq(invitation.eventId, eventId), eq(invitation.userId, user.id)),
      )
      .leftJoin(family, eq(family.id, invitation.familyId))
      .where(
        isFamilyInvite
          ? eq(user.familyId, targetFamilyId!)
          : eq(user.id, invite[0]?.userId!),
      );

    return {
      responses: data,
      isFamily: isFamilyInvite ? true : false,
    };
  }

  static async find(params: {
    id?: number;
    eventId?: number;
    userId?: number;
    familyId?: number;
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
  static async makeEventGuest({
    eventId,
    guestId,
    invited_by,
    familyId,
    params,
  }: {
    eventId: number;
    guestId: number;
    invited_by: number;
    params: setResponcevalidationType;
    familyId?: number | null;
  }) {
    const existingGuest = await db
      .select({ id: invitation.id, isFamily: invitation.familyId })
      .from(invitation)
      .leftJoin(event, eq(invitation.eventId, event.id))
      .where(
        and(eq(invitation.eventId, eventId), eq(invitation.userId, guestId)),
      )
      .limit(1);

    if (existingGuest[0]?.id) {
      const updated = await db
        .update(invitation)
        .set({
          ...params,
          userId: guestId,
          eventId,
          updatedAt: new Date(),
        })
        .where(eq(invitation.id, existingGuest[0].id))
        .returning();
      return updated[0] ?? null;
    }

    const inserted = await db
      .insert(invitation)
      .values({
        ...params,
        category: params.category!,
        eventId,
        userId: guestId,
        familyId: params.familyId ?? familyId ?? null,
        invited_by: invited_by,
      })
      .returning();
    return inserted;
  }

  static async removeEventGuestWhileRemovingFamilyMember(
    familyId: number,
    userId: number,
  ) {
    const deleted = await db
      .delete(invitation)
      .where(
        and(eq(invitation.familyId, familyId), eq(invitation.userId, userId)),
      )
      .returning();

    return deleted;
  }
  static async removeinvitation(userId: number, eventId: number) {
    const deletedEvent_guest = await db
      .delete(invitation)
      .where(
        and(eq(invitation.eventId, eventId), eq(invitation.userId, userId)),
      )
      .returning();
    return deletedEvent_guest;
  }
  static async EventHotelManagent(eventId: number) {
    const hotel_management = await db.select(repository.selectHotelManagement).from(invitation).leftJoin(user, eq(invitation.userId, user.id)).where(eq(invitation.eventId, eventId))
    return hotel_management;
  }

}
