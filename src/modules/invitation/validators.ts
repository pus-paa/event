import z from "zod";
import { invitationStatus } from "@/constant";

const validationRSVP = z.object({
  eventId: z.number(),
  userId: z.number(),
  invited_by: z.number().optional(),
  familyId: z.number().optional(),
  category: z.string().optional(),
});
const invitationStatusValidation = z.enum([
  invitationStatus.invited,
  invitationStatus.accepted,
  invitationStatus.rejected,
]);
const EventInvitation = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100)
    .default("Family Default"),
  email: z.string().email("Invalid email").max(255).optional(),
  phone: z.string().max(15),
  role: z.string().max(16).optional(),
  invitation_name: z.string().min(1, "Invitation name is required").max(50),
  relation: z.string().optional(),
  isFamily: z.boolean().default(false),
});
const setResponcevalidation = z.object({
  invited_by: z.number().int().positive().optional(),
  familyId: z.number().int().positive().optional().nullable(),
  userId: z.number().int().positive(),
  invitation_name: z.string().min(1).max(50).default("Family name"),
  notes: z.string().max(40).optional().nullable(),
  role: z.string().min(1).max(16).default("Guest"),
  category: z.string().min(1).max(10).default("Friend"),
  status: z.string().min(1).max(10).optional().nullable(),
  arrival_date_time: z.coerce.date().optional().nullable(),
  departure_date_time: z.coerce.date().optional().nullable(),
  isAccomodation: z.boolean().optional().nullable(),
  isArrivalPickupRequired: z.boolean().optional().nullable(),
  isDeparturePickupRequired: z.boolean().optional().nullable(),
  arrival_info: z.string().max(200).optional().nullable(),
  departure_info: z.string().max(200).optional().nullable(),
  assigned_room: z.string().max(150).optional().nullable(),
});

type EventInvitationType = z.infer<typeof EventInvitation>;
type setResponcevalidationType = z.infer<typeof setResponcevalidation>;

export {
  setResponcevalidation,
  setResponcevalidationType,
  validationRSVP,
  invitationStatusValidation,
  EventInvitation,
  EventInvitationType,
};
