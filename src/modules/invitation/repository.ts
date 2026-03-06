import rsvp from "./schema";
import event from "@/modules/event/schema"
import { event_guest_schema } from "@/modules/event/schema"
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

export default {
  select,
  selectInvitationEvent,
  selectguestResponce
};
