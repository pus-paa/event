import Controller from "./controller";
import { validate } from "@/middlewares/zodValidation";
import {
  CreateCateringSchema,
  UpdateCateringSchema,
  GetCateringListSchema,
  GetSingleCateringSchema,
  DeleteCateringSchema,
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
  CreateCateringExpense,
} from "./validators";

const routes = [
  {
    method: "get" as const,
    controller: Controller.get,
    path: "catering",
    authorization: true,
    validation: validate(GetCateringListSchema),
  },
  {
    method: "get" as const,
    controller: Controller.findOne,
    path: "catering/:id",
    authorization: true,
    validation: validate(GetSingleCateringSchema),
  },
  {
    method: "post" as const,
    controller: Controller.create,
    path: "event/:eventId/catering",
    authorization: true,
    validation: validate(CreateCateringSchema),
  },
  {
    method: "patch" as const,
    controller: Controller.update,
    path: "catering/:id",
    authorization: true,
    validation: validate(UpdateCateringSchema),
  },
  {
    method: "delete" as const,
    controller: Controller.deleteModule,
    path: "catering/:id",
    authorization: true,
    validation: validate(DeleteCateringSchema),
  },

  {
    method: "post" as const,
    controller: Controller.createMenuItem,
    path: "catering/:cateringId/menu",
    authorization: true,
    validation: validate(CreateMenuItemSchema),
  },
  {
    method: "post" as const,
    controller: Controller.createCateringExpense,
    path: "catering/expense/:cateringId",
    authorization: true,
    validation: validate(CreateCateringExpense)
  },
  {
    method: "get" as const,
    controller: Controller.getMenuItems,
    path: "catering/:cateringId/menu",
    authorization: true,
  },
  {
    method: "patch" as const,
    controller: Controller.updateMenuItem,
    path: "menu/:id",
    authorization: true,
    validation: validate(UpdateMenuItemSchema),
  },
  {
    method: "delete" as const,
    controller: Controller.deleteMenuItem,
    path: "menu/:id",
    authorization: true,
  },
];

export default routes;
