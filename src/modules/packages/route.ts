import { IRoute } from "@/routes";
import Controller from "./controller";
import { validate } from "@/middlewares/zodValidation";
import {
  createPackageValidation,
  updatePackageValidation,
  packageIdParamValidation,
  businessIdParamValidation,
  packageAndItemIdParamValidation,
  addPackageItemValidation,
  updatePackageItemValidation,
} from "./validators";

const routes: IRoute[] = [

  {
    method: "post",
    controller: Controller.create,
    path: "package",
    authorization: true,
    validation: validate(createPackageValidation),
  },
  {
    method: "get",
    controller: Controller.getByBusinessId,
    path: "package/:businessId/business",
    authorization: true,
    validation: validate(businessIdParamValidation),
  },
  {
    method: "get",
    controller: Controller.get,
    path: "package/:id",
    authorization: true,
    validation: validate(packageIdParamValidation),
  },
  {
    method: "patch",
    controller: Controller.update,
    path: "package/:id",
    authorization: true,
    validation: validate(updatePackageValidation),
  },
  {
    method: "delete",
    controller: Controller.deletePackage,
    path: "package/:id",
    authorization: true,
    validation: validate(packageIdParamValidation),
  },
  {
    method: "post",
    controller: Controller.addItem,
    path: "package/:id/item",
    authorization: true,
    validation: validate(addPackageItemValidation),
  },
  {
    method: "get",
    controller: Controller.getItems,
    path: "package/item/:id",
    authorization: true,
    validation: validate(packageIdParamValidation),
  },
  {
    method: "get",
    controller: Controller.getItem,
    path: "package/:id/item/:itemId",
    authorization: true,
    validation: validate(packageAndItemIdParamValidation),
  },
  {
    method: "patch",
    controller: Controller.updateItem,
    path: "package/:id/item/:itemId",
    authorization: true,
    validation: validate(updatePackageItemValidation),
  },
  {
    method: "delete",
    controller: Controller.deleteItem,
    path: "package/:id/item/:itemId",
    authorization: true,
    validation: validate(packageAndItemIdParamValidation),
  },
];

export default routes;
