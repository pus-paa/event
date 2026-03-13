import { role } from "@/constant";
import Controller from "./controller";
import { getSubEVenntOfEventValidationSchema } from "./validators";
import { validate } from "@/middlewares/zodValidation";

const routes = [
  {
    method: "get",
    controller: Controller.get,
    path: "event",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "post",
    controller: Controller.create,
    path: "event",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "post",
    controller: Controller.makeUserRelatedToEvent,
    path: "event/:eventId/member",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "get",
    controller: Controller.listMyEvents,
    path: "event/my-events",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "get",
    controller: Controller.get, // will update this to have the only the famliy get request
    path: "event/my-family",
    authorization: true,
    authCheckType: [role.user],
  },

  {
    method: "get",
    controller: Controller.getUserRelatedToEvent, // get the SelectEventOwners[]
    path: "event/:eventId/users",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "get",
    controller: Controller.get,
    path: "event/:eventId/subevent",
    authorization: true,
    authCheckType: [role.user],
  },

  // ─── Bare :id routes (always last) ───────────────────────
  {
    method: "get",
    controller: Controller.findOne,
    path: "event/:id",
  },
  {
    method: "patch",
    controller: Controller.update,
    path: "event/:id",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "delete",
    controller: Controller.deleteModule,
    path: "event/:id",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "get",
    controller: Controller.getSubEventOfEvent,
    path: "event/:id/sub-events",
    authorization: true,
    validation: validate(getSubEVenntOfEventValidationSchema),
  },
];

export default routes;
