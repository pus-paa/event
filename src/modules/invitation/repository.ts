
import event from "@/modules/event/schema"
import invitation from "./schema"
import user from "@/modules/user/schema";
const select = {
  id: invitation.id,
    userId: invitation.userId,
    eventId: invitation.eventId,
    familyId: invitation.familyId,
    invited_by: invitation.invited_by,
    role: invitation.role,
    status: invitation.status,
    notes: invitation.notes,
    category: invitation.category,
    arrival_date_time: invitation.arrival_date_time,
    departure_date_time: invitation.departure_date_time,
    isAccomodation: invitation.isAccomodation,
    joined_at: invitation.joined_at,
};
const selectInvitationEvent = {
  id: invitation.id,
  event_detail: {
    eventId: event.id,
    title: event.title,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location,
    venue: event.venue,
    imageUrl: event.imageUrl,
  },
  invited_by: invitation.invited_by,
  familyId: invitation.familyId,
  userId:invitation.userId,
  invitation_status: invitation.status,
  role: invitation.category
}


const selectInvitationResponse = {
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
    id: invitation.id,
    userId: invitation.userId,
    eventId: invitation.eventId,
    familyId: invitation.familyId,
    invited_by: invitation.invited_by,
    role: invitation.role,
    status: invitation.status,
    notes: invitation.notes,
    arrival_date_time: invitation.arrival_date_time,
    departure_date_time: invitation.departure_date_time,
    isAccomodation: invitation.isAccomodation,
    joined_at: invitation.joined_at,
  },
};

export default {
  select,
  selectInvitationEvent,
  selectInvitationResponse
};
