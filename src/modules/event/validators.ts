import { dateSchema } from "@/utils/baseValidation";
import { z } from "zod";
const EventValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dressCode: z.string().optional(),
  imageUrl: z
    .string()
    .optional()
    .default(
      "https://images.unsplash.com/photo-1522673607200-1645062cd5d1?w=800&q=80",
    ),
  type: z.string().default("WEDDING"),
  startDateTime: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      // if this is not the valid date fformat then
      message: "Invalid date format",
    })
    .optional(),
  endDateTime: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  budget: z.number().int().min(0).optional(),
  theme: z.string().optional(),
  parentId: z.number().int().optional(),
  location: z.string().optional(),
  rsvpDeadline: dateSchema.optional(),
});

const getSubEVenntOfEventValidationSchema = z.object({
  params: z.object({
    id: z.string().refine((id) => !isNaN(Number(id)), {
      message: "Invalid event ID",
    }),
  }),
});
const AddEventMemberValidationSchema = z.object({
  userId: z.number(),
  role: z.string(),
})
type AddEventMemberValidationSchemaType = z.infer<typeof AddEventMemberValidationSchema>
const EventUpdateValidationSchema = EventValidationSchema.partial();

//Type extraction from the zod
type createEventType = z.infer<typeof EventValidationSchema>;
type updateEventType = z.infer<typeof EventUpdateValidationSchema>;

export {
  AddEventMemberValidationSchema,
  EventValidationSchema,
  AddEventMemberValidationSchemaType,
  EventUpdateValidationSchema,
  getSubEVenntOfEventValidationSchema,
  type createEventType,
  type updateEventType,
};
