import { role } from "@/constant";
import Controller from "./controller";

const routes = [
  {
    method: "get",
    controller: Controller.list,
    path: "business",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.create,
    path: "business",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "get",
    controller: Controller.findOne,
    path: "business/:id",
  },
  {
    method: "patch",
    controller: Controller.update,
    path: "business/:id",
    authorization: true,
  },
  {
    method: "delete",
    controller: Controller.remove,
    path: "business/:id",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.addVenueDetail,
    path: "business/:id/venue",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.addVendorServiceDetail,
    path: "business/:id/service",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.updateVendorVenueDetail,
    path: "business/venue/:venueId",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.updateVendorServiceDetail,
    path: "business/service/:serviceId",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.AddEventVendor,
    path: "vendor/event/:eventId",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.updateEventVendor,
    path: "vendor/:eventId/vendor/:vendorId",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getEventVendor,
    path: "event/vendor/:eventId",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getVendorEvents,
    path: "vendor/event/:vendorId",
    authorization: true,
  }
];

export default routes;
