
import { validate } from "@/middlewares/zodValidation";
import Controller from "./controller";
import { todoBulkStatusValidationSchema, todoUpdateValidationSchema, todoValidationSchema } from "./validators";

const routes = [
  {
    method: "get",
    controller: Controller.get,
    path: "todo",
    authorization: true,
  },
  {
    method: "get",
    controller: Controller.getByEventId,
    path: "todo/event/:eventId",
    authorization: true,
  },
  {
    method: "post",
    controller: Controller.create,
    path: "todo",
    authorization: true,
    validation: validate(todoValidationSchema)
  },
  {
    method: "get",
    controller: Controller.findOne,
    path: "todo/:id",
    authorization: true,
  },
  {
    method: "patch",
    controller: Controller.update,
    path: "todo/:id",
    authorization: true,
    validation: validate(todoUpdateValidationSchema)
  },
  {
    method: "delete",
    controller: Controller.deleteTodo,
    path: "todo/:id",
    authorization: true,
  }
  ,
  {
    method: "post",
    controller: Controller.bulkStatus,
    path: "todo/bulk",
    authorization: true,
    validation: validate(todoBulkStatusValidationSchema)
  }
];

export default routes;
