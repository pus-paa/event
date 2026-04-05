import { validate } from "@/middlewares/zodValidation";
import Controller from "./controller";
import { EventInvitation } from "./validators";
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
  }
];
export default route;
