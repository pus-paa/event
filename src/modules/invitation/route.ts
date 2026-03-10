import { role } from "@/constant";
import Controller from "./controller"
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
    authorization: true
  },
  {
    method: "get",
    controller: Controller.getEventGuest, // get the guest of the event in the id
    path: "event/guest/:id",
    authorization: true,
    authCheckType: [role.user],
  },
  // {
  //   method: "get",
  //   controller: Controller.getEventInvitation,
  //   path: "event/event/:id/invitation",
  //   authorization: true,
  //   authCheckType: [role.user]
  // },
  {
    method: "post",
    controller: Controller.sendInvitation, // send the invitation to the guest in the evnt 
    path: "event/:eventId/invite",
    authorization: true,
    authCheckType: [role.user],
  },
]
export default route; 
