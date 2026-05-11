import Controller from "./controller";
import { validate } from "@/middlewares/zodValidation";
import {
  CreatereviewSchema,
  UpdatereviewSchema,
  GetreviewListSchema,
  GetSinglereviewSchema,
  DeletereviewSchema,
} from "./validators";

const routes = [
  {
    method: "get" as const,
    controller: Controller.get,
    path: "review",
    authorization: true,
    validation: validate(GetreviewListSchema),
  },
  {
    method: "get" as const,
    controller: Controller.findOne,
    path: "review/:id",
    authorization: true,
    validation: validate(GetSinglereviewSchema),
  },
  {
    method: "post" as const,
    controller: Controller.create,
    path: "business/:businessId/review",
    authorization: true,
    validation: validate(CreatereviewSchema),
  },
  {
    method: "patch" as const,
    controller: Controller.update,
    path: "review/:id",
    authorization: true,
    validation: validate(UpdatereviewSchema),
  },
  {
    method: "delete" as const,
    controller: Controller.deleteModule,
    path: "review/:id",
    authorization: true,
    validation: validate(DeletereviewSchema),
  },
];

export default routes;
