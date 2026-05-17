import { TODO_CATEGORIES } from "@/constant";
import { z } from "zod";
import { dateSchema } from "@/utils/baseValidation";


const todoInputValidation = z.object({
  eventId: z.number(),
  task: z.string().max(200).optional().nullable(),
  doneByuserIds: z.array(z.number()).optional().nullable(),
  assignedTo: z.number().optional().nullable(),
  assignedGroup: z.enum(["Guest", "Planning Committee", "Vendor"]).nullable().optional(),
  title: z.string().optional().nullable(),
  category: z.enum(TODO_CATEGORIES).optional(),
  parentId: z.number().optional().nullable(),
  dueDate: dateSchema.optional(),
})

const todoValidationSchema = z.object({
  body: todoInputValidation
})

const todoUpdateValidationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Todo ID must be a positive number"),
  }),
  body: todoInputValidation.partial()
})

const todoPopulateDefaultValidationSchema = z.object({
  weddingDate: z.union([z.string(), z.date()]),
});

const todoBulkStatusValidationSchema = z.object({
  body: z.object({
    todos: z.array(
      z.object({
        todoId: z.number(),
        isDone: z.boolean(),
      })
    )
  }),
});



type TodoInputType = z.infer<typeof todoValidationSchema>
type UpdateTodoInputType = z.infer<typeof todoUpdateValidationSchema>["body"]
type BulkTodoType = z.infer<typeof todoBulkStatusValidationSchema>["body"]

export {
  todoValidationSchema,
  UpdateTodoInputType,
  BulkTodoType,
  TodoInputType,
  todoUpdateValidationSchema,
  todoPopulateDefaultValidationSchema,
  todoBulkStatusValidationSchema,
};
