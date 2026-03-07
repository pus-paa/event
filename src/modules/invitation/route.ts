import Controller from "./controller"
const route = [
  {
    method: "post",
    controller: Controller.accept,
    path: "rsvp/accept/:id",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.reject,
    path: "rsvp/reject/:id",
    authorization: true,
  },
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
  }

]
export default route; 
