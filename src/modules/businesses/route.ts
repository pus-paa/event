import { role } from "@/constant";
import Controller from "./controller";

const routes = [
  {
    method: "get",
    controller: Controller.list,
    path: "business",
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
    authCheckType: [role.user],
  },
  {
    method: "delete",
    controller: Controller.remove,
    path: "business/:id",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "post",
    controller: Controller.addVenueDetail,
    path: "business/:id/venue",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "post",
    controller: Controller.addVendorServiceDetail,
    path: "business/:id/service",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "patch",
    controller: Controller.updateVendorVenueDetail,
    path: "business/venue/:venueId",
    authorization: true,
    authCheckType: [role.user],
  },
  {
    method: "patch",
    controller: Controller.updateVendorServiceDetail,
    path: "business/service/:serviceId",
    authorization: true,
    authCheckType: [role.user],
  },
];

export default routes;
