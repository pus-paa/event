import rsvp from "./schema";
import event from "@/modules/event/schema"
import { event_guest_schema } from "@/modules/event/schema"
import user from "@/modules/user/schema";
import UserRepository from "@/modules/user/repository"
const select = {
  id: rsvp.id,
  eventId: rsvp.eventId,
  familyId: rsvp.familyId,
  category: rsvp.category,
  updatedAt: rsvp.updatedAt,
  invited_by: rsvp.invited_by,
  status: rsvp.status, // accepted, declined, pending
};
const selectInvitationEvent = {
  id: rsvp.id,
  event_detail: {
    eventId: event.id,
    title: event.title,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location,
    venue: event.venue,
    imageUrl: event.imageUrl,
  },
  invited_by: rsvp.invited_by,
  familyId: rsvp.familyId,
  invitation_status: rsvp.status,
  role: rsvp.category
}

const selectguestResponce = {
  user: UserRepository.selectQuery,
  responce: {
    status: event_guest_schema.status,
    notes: event_guest_schema.notes,
    arrival_date_time: event_guest_schema.arrival_date_time,
    departure_date_time: event_guest_schema.departure_date_time,
    isAccomodation: event_guest_schema.isAccomodation,
    joined_at: event_guest_schema.joined_at,
  }
}

const selectFamilyInvitationResponse = {
  user_detail: {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    photo: user.photo,
    familyId: user.familyId,
    relation: user.relation,
  },
  event_guest: {
    id: event_guest_schema.id,
    userId: event_guest_schema.userId,
    eventId: event_guest_schema.eventId,
    familyId: event_guest_schema.familyId,
    invited_by: event_guest_schema.invited_by,
    role: event_guest_schema.role,
    status: event_guest_schema.status,
    notes: event_guest_schema.notes,
    arrival_date_time: event_guest_schema.arrival_date_time,
    departure_date_time: event_guest_schema.departure_date_time,
    isAccomodation: event_guest_schema.isAccomodation,
    joined_at: event_guest_schema.joined_at,
  },
};

export default {
  select,
  selectInvitationEvent,
  selectguestResponce,
  selectFamilyInvitationResponse
};
