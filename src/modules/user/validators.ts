import { dateSchema } from "@/utils/baseValidation";
import z from "zod";
const loginValidationSchema = z.object({
  phone: z.string().nonempty(),
  password: z.string().nonempty(),
  // deviceToken: z.string().nonempty(),
});
const changePasswordValidationSchema = z.object({
  currentPassword: z.string().min(8).nonempty(),
  newPassword: z.string().min(8).nonempty(),
  confirmPassword: z.string(),
});

const updateProfileValidationSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    location: z.string().optional(),
    dob: dateSchema.optional(),
    bio: z.string().optional(),
    photo: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    zip: z.string().optional(),
    relation: z.string().optional(),
    foodPreference: z.string().optional(),
    coverPhoto: z.string().optional(),
    info: z.any().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for profile update",
  });

const validationSchema = z.object({
  username: z.string(),
  password: z.string().min(8).optional(),
  email: z.string().optional().default(`${Date.now()}_${(Math.random() * 1000) % 100}guest@email.com`),
  relation: z.string().optional().default("User"),
  phone: z.string().min(10).max(15).default(`${Date.now()}`),
  dob: dateSchema.optional(),
});

type createUserType = z.infer<typeof validationSchema>;
type loginType = z.infer<typeof loginValidationSchema>;
type updateProfileType = z.infer<typeof updateProfileValidationSchema>;
export {
  changePasswordValidationSchema, loginValidationSchema, updateProfileValidationSchema, validationSchema, type createUserType,
  type loginType,
  type updateProfileType
};
