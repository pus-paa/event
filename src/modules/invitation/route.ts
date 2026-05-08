import Controller from "./controller";
const route = [
  {
    method: "get",
    controller: Controller.getInvitations,
    path: "rsvp/invitations",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getInvitationResponse,
    path: "invitation/event-responses/:id",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.setResponce,
    path: "invitation/responce/:id",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getEventGuest, // get the guest of the event in the id
    path: "event/guest/:id",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.sendInvitation, // send the invitation to the guest in the evnt
    path: "event/:eventId/invite",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getEventGuest,
    path: "event/:id/invitation",
    authorization: true,
  },
  {
    method: "delete",
    controller: Controller.removeinvitation,
    path: "event/:id/invitation",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getHotelManegemt,
    path: "event/:id/hotel-management",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getGuestTransportationList,
    path: "event/:id/transportation",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getEventGuestCategory,
    path: "event/:id/guest-category",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.createGuestCategory,
    path: "event/:id/guest-category",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.updateGuestCategory,
    path: "guest-category/:id",
    authorization: true,
  },
  {
    method: "delete",
    controller: Controller.deleteGuestCategory,
    path: "guest-category/:id",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.toggleCheckInOut,
    path: "invitation/:id/check-status",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.importGuests,
    path: "event/:eventId/import-guests",
    authorization: true,
  },
];
export default route;
