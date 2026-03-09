
import { eq, and, sql, or , isNull } from "drizzle-orm";
import invitation from "./schema";
import db from "@/config/db";
import repository from "./repository";
import Resource from "./resource"
import { InvitationColumn } from "./resource";
import user from "@/modules/user/schema";

export default class Invitation {
  static async list(params:any) {
    const {  page , limit  } = params ; 
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
      .select(repository.selectInvitationResponse)
      .from(invitation)
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
      .where(eq(invitation.eventId, eventId));
    return result;
  }
  //get the family event or the user event based on the user id and family id
  static async listAllInvitationEvent(params:any){
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
      ? or(...invitationConditions)
      : undefined;

    let query = db
      .selectDistinct(repository.selectInvitationEvent)
      .from(invitation)
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
    userId , 
    familyId , 
    eventId  ,
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
      .where(whereCondition)

    const result = await query;
    return result [0] || null  ; 
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

 
  static async getInvitationResponces({eventId, userId, familyId}:{eventId: number, userId?: number, familyId?: number}) {
  
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
          ):undefined
          ,
          familyId? eq(invitation.familyId, familyId):undefined  
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
    familyId?:number 
  }) {
    const { id, eventId, userId , familyId } = params;
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
      conditions.push(eq(invitation.familyId,familyId));
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
    const event_guest = await db
      .insert(invitation)
      .values({
        invited_by: invited_by,
        joined_at: new Date().toISOString(),
        eventId: eventId,
        familyId: familyId ?? null,
        userId: guestId,
        notes: params.note ?? params.notes ?? null,
        role: params.role ?? null, 
      } as any)
      .returning().onConflictDoNothing();
    return event_guest;
  }
}



