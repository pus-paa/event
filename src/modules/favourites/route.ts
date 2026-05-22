import Controller from "./controller";

const routes = [
  {
    method: "get",
    path: "favourites",
    controller: Controller.list,
    authorization: true,
  },
  {
    method: "post",
    path: "favourites/:businessId",
    controller: Controller.add,
    authorization: true,
  },
  {
    method: "delete",
    path: "favourites/:businessId",
    controller: Controller.remove,
    authorization: true,
  },
];

export default routes;
