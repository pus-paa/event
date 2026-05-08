import event from "@/modules/event/schema";
import invitation from "./schema";
import Family from "@/modules/family/repository";
import User from "@/modules/user/repository";

const select = {
  id: invitation.id,
  userId: invitation.userId,
  hasCheckedIn: invitation.hasCheckedIn,
  hasCheckedOut: invitation.hasCheckedOut,
  eventId: invitation.eventId,
  familyId: invitation.familyId,
  respondedBy: invitation.respondedBy,
  respondedAt: invitation.respondedAt,
  invitedBy: invitation.invitedBy,
  role: invitation.role,
  unInvitedSubevent: invitation.unInvitedSubevent,
  status: invitation.status,
  notes: invitation.notes,
  category: invitation.category,
  isArrivalPickupRequired: invitation.isArrivalPickupRequired,
  isDeparturePickupRequired: invitation.isDeparturePickupRequired,
  organizerNote: invitation.organizerNote,
  arrivalDatetime: invitation.arrivalDatetime,
  departureDatetime: invitation.departureDatetime,
  arrivalLocation: invitation.arrivalLocation,
  departureLocation: invitation.departureLocation,
  isAccomodation: invitation.isAccomodation,
  joinedAt: invitation.joinedAt,
  assignedRoom: invitation.assignedRoom,
  arrivalInfo: invitation.arrivalInfo,
  departureInfo: invitation.departureInfo,
  createdAt: invitation.createdAt,
  updatedAt: invitation.updatedAt,
};

const selectInvitationEvent = {
  id: invitation.id,
  event: {
    id: event.id,
    title: event.title,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    location: event.location,
    venue: event.venue,
    imageUrl: event.imageUrl,
  },
  invitedBy: invitation.invitedBy,
  familyId: invitation.familyId,
  userId: invitation.userId,
  status: invitation.status,
  organizerNote: invitation.organizerNote,
  role: invitation.category,
  category: invitation.category,
  invitationName: invitation.invitationName,
};

const selectInvitationResponse = {
  user: User.selectQuery,
  eventGuest: select,
  familyName: Family.selectQuery.familyName,
};
const selectHotelManagement = {
  user: User.selectQuery,
  room: select.assignedRoom,
  hasCheckedIn: select.hasCheckedIn,
  hasCheckedOut: select.hasCheckedOut,
  category: select.category,
  invitationId: select.id
};

const selectTransportation = {
  id: invitation.id,
  user: {
    name: User.selectQuery.username,
    familyId: User.selectQuery.familyId,
    foodPreference: User.selectQuery.foodPreference,
    phone: User.selectQuery.phone,
    email: User.selectQuery.email,
  },
  isArrivalPickupRequired: invitation.isArrivalPickupRequired,
  isDeparturePickupRequired: invitation.isDeparturePickupRequired,
  arrivalDatetime: invitation.arrivalDatetime,
  departureDatetime: invitation.departureDatetime,
  arrivalInfo: invitation.arrivalInfo,
  arrivalLocation: invitation.arrivalLocation,
  departureLocation: invitation.departureLocation,
  departureInfo: invitation.departureInfo,
  isAccomodation: invitation.isAccomodation,
  eventId: invitation.eventId,
};

export default {
  selectHotelManagement,
  select,
  selectInvitationEvent,
  selectInvitationResponse,
  selectTransportation,
};
