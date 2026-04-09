import event from "@/modules/event/schema";
import invitation from "./schema";
import Family from "@/modules/family/repository";
import User from "@/modules/user/repository";

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
  isArrivalPickupRequired: invitation.isArrivalPickupRequired,
  isDeparturePickupRequired: invitation.isDeparturePickupRequired,
  arrival_date_time: invitation.arrival_date_time,
  departure_date_time: invitation.departure_date_time,
  isAccomodation: invitation.isAccomodation,
  joined_at: invitation.joined_at,
  assigned_room: invitation.assigned_room,
  arrival_info: invitation.arrival_info,
  departure_info: invitation.departure_info,
  createdAt: invitation.createdAt,
  updatedAt: invitation.updatedAt,
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
  userId: invitation.userId,
  invitation_status: invitation.status,
  role: invitation.category,
  category: invitation.category,
  invitation_name: invitation.invitation_name,
};

const selectInvitationResponse = {
  user_detail: User.selectQuery,
  event_guest: select,
  family_name: Family.selectQuery.familyName,
};
const selectHotelManagement = {
  user_detail: User.selectQuery,
  user_room: select.assigned_room,
  category: select.category,
};
export default {
  selectHotelManagement,
  select,
  selectInvitationEvent,
  selectInvitationResponse,
};
