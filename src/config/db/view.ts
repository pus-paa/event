import { pgView } from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";
import { event, invitation, user } from "./schema"

export const vwEventDetails = pgView("vw_event_details").as((qb) =>
  qb
    .select({
      eventId: sql`${event.id}`.as("eventId"),
      title: sql`${event.title}`.as("title"),
      type: sql`${event.type}`.as("type"),
      parentid: sql`${event.parentId}`.as("parentid"),
      startDateTime: sql`${event.startDateTime}`.as("startDateTime"),
      endDateTime: sql`${event.endDateTime}`.as("endDateTime"),
      budget: sql`${event.budget}`.as("budget"),
      rsvpDeadline: sql`${event.rsvp_deadline}`.as("rsvpDeadline"),
      visiblity: sql`${event.visiblity}`.as("visiblity"),
      eventStatus: sql`${event.status}`.as("eventStatus"),
      attire: sql`${event.attire}`.as("attire"),
      side: sql`${event.side}`.as("side"),
      invt: sql`${invitation.id}`.as("invt"),
      respondedBy: sql`${invitation.responded_by}`.as("respondedBy"),
      status: sql`${invitation.status}`.as("status"),
      respondedAt: sql`${invitation.responded_at}`.as("respondedAt"),
      invFamilyId: sql`${invitation.familyId}`.as("invFamilyId"),
      category: sql`${invitation.category}`.as("category"),
      invitationName: sql`${invitation.invitation_name}`.as("invitationName"),
      notes: sql`${invitation.notes}`.as("notes"),
      role: sql`${invitation.role}`.as("role"),
      invtUserId: sql`${user.id}`.as("invtUserId"),
      username: sql`${user.username}`.as("username"),
      phone: sql`${user.phone}`.as("phone"),
      email: sql`${user.email}`.as("email"),
      accountStatus: sql`${user.accountStatus}`.as("accountStatus"),
      familyId: sql`${user.familyId}`.as("familyId"),
      relation: sql`${user.relation}`.as("relation"),
    })
    .from(event)
    .leftJoin(invitation, eq(event.id, invitation.eventId))
    .leftJoin(user, eq(invitation.userId, user.id))
    .orderBy(event.id)
);
