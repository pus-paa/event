import { z } from "zod";

const todoValidationSchema = z.object({
	eventId: z.number().optional().nullable(),
	task: z.string().max(200).optional().nullable(),
	isDone: z.boolean().optional().nullable(),
	assigned_to: z.number().optional().nullable(),
	title: z.string().optional().nullable(),
	parentId: z.number().optional().nullable(),
	dueDate: z.union([z.string(), z.date()]).optional().nullable(),
	status: z.string().max(30).optional().nullable(),
});

const todoUpdateValidationSchema = todoValidationSchema.partial();

const todoPopulateDefaultValidationSchema = z.object({
	weddingDate: z.union([z.string(), z.date()]),
});

export {
	todoValidationSchema,
	todoUpdateValidationSchema,
	todoPopulateDefaultValidationSchema,
};
