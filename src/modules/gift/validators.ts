import { z } from "zod";

const createGiftCategorySchema = z.object({
	params: z.object({
		eventId: z.coerce.number().positive(),
	}),
	body: z.object({
		name: z.string().min(1).max(255),
	}),
});

const updateGiftCategorySchema = z.object({
	params: z.object({
		categoryId: z.coerce.number().positive(),
	}),
	body: z.object({
		name: z.string().min(1).max(255).optional(),
	}),
});

const createGiftSchema = z.object({
	params: z.object({
		eventId: z.coerce.number().positive(),
	}),
	body: z.object({
		name: z.string().min(1).max(255),
		category: z.string().min(1).max(255),
		value: z.coerce.number().int().optional(),
	}),
});

const updateGiftSchema = z.object({
	params: z.object({
		giftId: z.coerce.number().positive(),
	}),
	body: z.object({
		name: z.string().min(1).max(255).optional(),
		category: z.string().min(1).max(255).optional(),
		value: z.coerce.number().int().optional(),
	}),
});

type CreateGiftCategoryInput = z.infer<
	typeof createGiftCategorySchema
>["body"];
type UpdateGiftCategoryInput = z.infer<
	typeof updateGiftCategorySchema
>["body"];
type CreateGiftInput = z.infer<typeof createGiftSchema>["body"];
type UpdateGiftInput = z.infer<typeof updateGiftSchema>["body"];

export {
	createGiftCategorySchema,
	updateGiftCategorySchema,
	createGiftSchema,
	updateGiftSchema,
	type CreateGiftCategoryInput,
	type UpdateGiftCategoryInput,
	type CreateGiftInput,
	type UpdateGiftInput,
};
