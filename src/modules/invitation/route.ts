import { validate } from "@/middlewares/zodValidation";
import Controller from "./controller";
import { setResponcevalidation } from "./validators";
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
    controller: Controller.importGuest,
    path: "invitation/import-guest",
    authorization: true
  },
  {
    method: "post",
    controller: Controller.setResponce,
    path: "invitation/responce/:id",
    authorization: true,
    validation: validate(setResponcevalidation)
  },
  {
    method: "get",
    controller: Controller.getEventGuest,
    path: "event/guest/:id",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.sendInvitation, 
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

];
export default route;
