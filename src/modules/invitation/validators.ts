import z from "zod";
import { invitationStatus } from "@/constant";
import { generateRandomNumber } from "@/utils/helper";

const validationRSVP = z.object({
  eventId: z.number(),
  userId: z.number(),
  invited_by: z.number().optional(),
  familyId: z.number().optional(),
  category: z.enum(["friend", "family", "colleague", "vvip"]),
});
const invitationStatusValidation = z.enum([
  invitationStatus.draft,
  invitationStatus.accepted,
  invitationStatus.rejected,
  invitationStatus.pending
]);
const EventInvitation = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100)
    .default("Family Default"),
  email: z.preprocess(
    (val) => val || `${generateRandomNumber(5)}@gmail.com`,
    z.string().email("Invalid email address"),
  ),
  phone: z.preprocess(
    (val) => val || `+977-${generateRandomNumber(10)}`,
    z.string().max(15),
  ),
  isDraft: z.boolean(),
  role: z.string().max(16).optional(),
  invitation_name: z.string().min(1, "Invitation name is required").max(50),
  relation: z.string().optional(),
  isFamily: z.boolean().default(false),
  category: z.enum(["friend", "family", "colleague", "vvip"]).nonoptional(),
});
const setResponcevalidation = z.object({
  invited_by: z.number().int().positive().optional(),
  familyId: z.number().int().positive().optional().nullable(),
  userId: z.number().int().positive(),
  invitation_name: z.string().min(1).max(50).optional(),
  notes: z.string().max(40).optional().nullable(),
  status: z.string().min(1).max(10).optional().nullable(),
  arrival_date_time: z.coerce.date().optional().nullable(),
  departure_date_time: z.coerce.date().optional().nullable(),
  isAccomodation: z.boolean().optional().nullable(),
  isArrivalPickupRequired: z.boolean().optional().nullable(),
  isDeparturePickupRequired: z.boolean().optional().nullable(),
  arrival_info: z.string().max(200).optional().nullable(),
  departure_info: z.string().max(200).optional().nullable(),
  assigned_room: z.string().max(150).optional().nullable(),
  category: z.enum(["friend", "family", "colleague", "vvip"]).optional(),
});
const removeInvitationValidation = z.object({
  userId: z.number().nonoptional(),
});
type EventInvitationRemoveType = z.infer<typeof removeInvitationValidation>;
type EventInvitationType = z.infer<typeof EventInvitation>;
type setResponcevalidationType = z.infer<typeof setResponcevalidation>;

export {
  EventInvitationRemoveType,
  removeInvitationValidation,
  setResponcevalidation,
  setResponcevalidationType,
  validationRSVP,
  invitationStatusValidation,
  EventInvitation,
  EventInvitationType,
};
