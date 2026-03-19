import { dateSchema } from "@/utils/baseValidation";
import { generateRandomNumber } from "@/utils/helper";
import z from "zod";

const familyIdParamValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Family ID must be a positive number"),
  }),
});

const familyAndMemberIdParamValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Family ID must be a positive number"),
    memberId: z.coerce
      .number()
      .int()
      .positive("Member ID must be a positive number"),
  }),
});

const createFamilyValidation = z.object({
  body: z.object({
    familyName: z
      .string()
      .min(3, "Family name must be at least 3 characters long"),
  }),
});

const updateFamilyValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Family ID must be a positive number"),
  }),
  body: z
    .object({
      familyName: z
        .string()
        .min(3, "Family name must be at least 3 characters long")
        .optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required to update family",
    }),
});

const addMemberValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Family ID must be a positive number"),
  }),
  body: z.object({
    email: z.preprocess(
      (val) => val || `${generateRandomNumber(5)}@gmail.com`,
      z.string().email("Invalid email address")
    ),
    username: z.string().min(2, "Name must be at least 2 characters long").optional(),
    relation: z.string().min(2).nullable().optional(),
    dob: dateSchema.nonoptional(),
    foodPreference: z.string().min(2).nullable().optional(),
    phone: z.preprocess(
      (val) => val || generateRandomNumber(10).toString(),
      z.string().length(10)
    ),
  }),
});

const updateMemberValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Family ID must be a positive number"),
    memberId: z.coerce
      .number()
      .int()
      .positive("Member ID must be a positive number"),
  }),
  body: z
    .object({
      relation: z
        .string()
        .min(2, "Relation must be at least 2 characters long")
        .nullable()
        .optional(),
      username: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .optional(),
      foodPreference: z.string().min(2).nullable().optional(),
      email: z.string().optional(),
      dob: dateSchema.optional(),
      phone: z.string().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field is required to update member",
    }),
});

type CreateFamilyValidation = z.infer<typeof createFamilyValidation>;
type UpdateFamilyValidation = z.infer<typeof updateFamilyValidation>;
type AddMemberValidation = z.infer<typeof addMemberValidation>;
type UpdateMemberValidation = z.infer<typeof updateMemberValidation>;
type FamilyIdParamValidation = z.infer<typeof familyIdParamValidation>;
type FamilyAndMemberIdParamValidation = z.infer<
  typeof familyAndMemberIdParamValidation
>;

export {
  familyIdParamValidation,
  familyAndMemberIdParamValidation,
  createFamilyValidation,
  updateFamilyValidation,
  addMemberValidation,
  updateMemberValidation,
};

export type {
  CreateFamilyValidation,
  UpdateFamilyValidation,
  AddMemberValidation,
  UpdateMemberValidation,
  FamilyIdParamValidation,
  FamilyAndMemberIdParamValidation,
};
