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
	body:createGiftCategorySchema.shape.body.partial() ,
});

const createGiftSchema = z.object({
	params: z.object({
		eventId: z.coerce.number().positive(),
	}),
	body: z.object({
		name: z.string().min(1).max(255),
		category: z.string().min(1).max(255),
		value: z.coerce.number().int().optional(),
		count:z.number().nonoptional() ,
	}),
});

const updateGiftSchema = z.object({
	params: z.object({
		giftId: z.coerce.number().positive(),
	}),
	body: createGiftSchema.shape.body.partial(),
});

const assignGiftToInvitationSchema = z.object({
	params: z.object({
		giftId: z.coerce.number().positive(),
	}),
	body: z.object({
		invitationId: z.coerce.number().positive(),
		totalCount: z.coerce.number().int().positive(),
	}),
});

const updateAssignGiftToInvitationSchema = z.object({
	params: z.object({
		giftId: z.coerce.number().positive(),
	}),
	body: assignGiftToInvitationSchema.shape.body.partial() ,
});

const removeAssignment = z.object({
	params: z.object({
		assignedId: z.coerce.number().positive(),
	})

});

type CreateGiftCategoryInput = z.infer<
	typeof createGiftCategorySchema
>["body"];
type UpdateGiftCategoryInput = z.infer<
	typeof updateGiftCategorySchema
>["body"];
type CreateGiftInput = z.infer<typeof createGiftSchema>["body"];
type UpdateGiftInput = z.infer<typeof updateGiftSchema>["body"];

type AssignGiftToInvitationInput = z.infer<
	typeof assignGiftToInvitationSchema
>["body"];

type UpdateAssignGiftToInvitationInput = z.infer<
	typeof updateAssignGiftToInvitationSchema
>["body"];

type RemoveAssignmentInput = z.infer<typeof removeAssignment>["params"] ;
export {
	createGiftCategorySchema,
	updateGiftCategorySchema,
	createGiftSchema,
	updateGiftSchema,
	assignGiftToInvitationSchema,
	updateAssignGiftToInvitationSchema,
	type CreateGiftCategoryInput,
	type UpdateGiftCategoryInput,
	type CreateGiftInput,
	type UpdateGiftInput,
	type AssignGiftToInvitationInput,
	type UpdateAssignGiftToInvitationInput,
	removeAssignment,
	type RemoveAssignmentInput ,
};
