import Controller from "./controller";
const routes = [
  {
    method: "get",
    controller: Controller.get,
    path: "user",
  },
  {
    method: "get",
    controller: Controller.findUserByPhone,
    path: "user/phone",
    authorization: true,
    authCheckType: ["user"]
  },
  {
    method: "get",
    controller: Controller.profile,
    path: "user/me",
    authorization: true,
    authCheckType: ["user"],
  },
  {
    method: "post",
    controller: Controller.create,
    path: "user",
  },
  {
    method: "patch",
    controller: Controller.changePassword,
    path: "user",
    authorization: true,
    authCheckType: ["user"],
  },
  {
    method: "patch",
    controller: Controller.updateProfile,
    path: "user/me",
    authorization: true,
  },
  {
    method: "delete",
    controller: Controller.deleteModule,
    path: "user/:id",
    authorization: true,
    authCheckType: ["user"],
  },
  {
    method: "post",
    controller: Controller.login,
    path: "user/login",
  },
];
export default routes;
