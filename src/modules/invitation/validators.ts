import z from "zod";
import { invitationStatus } from "@/constant";
import { generateRandomNumber } from "@/utils/helper";

const validationRSVP = z.object({
  eventId: z.number(),
  userId: z.number(),
  invited_by: z.number().optional(),
  familyId: z.number().optional(),
  category: z.string(),
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
  invitationName: z.string().max(50).optional(),
  isFamily: z.boolean().default(false),
  category: z.string().nonoptional(),
  numberOfGuests: z.number().int().positive().optional(),
});
const setResponcevalidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("User Id must be valid positive number ")
  }),
  body: z.object({
    invitedBy: z.number().int().positive().optional(),
    userId: z.number().int().positive(),
    invitationName: z.string().min(1).max(50).optional(),
    notes: z.string().max(40).optional().nullable(),
    hasCheckedIn: z.boolean().optional(),
    familyId: z.number().int().positive().optional().nullable(),
    hasCheckedOut: z.boolean().optional(),
    status: invitationStatusValidation.optional().nullable(),
    arrivalDatetime: z.coerce.date().optional().nullable(),
    departureDatetime: z.coerce.date().optional().nullable(),
    isAccomodation: z.boolean().optional().nullable(),
    isArrivalPickupRequired: z.boolean().optional().nullable(),
    isDeparturePickupRequired: z.boolean().optional().nullable(),
    organizerNote: z.string().optional().nullable(),
    arrivalLocation: z.string().optional(),
    departureLocation: z.string().optional(),
    unInvitedSubevent: z.number().array().optional(),
    arrivalInfo: z.string().max(200).optional().nullable(),
    departureInfo: z.string().max(200).optional().nullable(),
    assignedRoom: z.string().max(150).optional().nullable(),
    category: z.string().optional(),
    numberOfGuests: z.number().int().positive().optional(),
  })

});
const removeInvitationValidation = z.object({
  userId: z.number().nonoptional(),
});

const guestCategoryValidation = z.object({
  category_title: z.string().min(1).max(100),
  priority: z.number().int().optional(),
});

const updateGuestCategoryValidation = z.object({
  category_title: z.string().min(1).max(100).optional(),
  priority: z.number().int().optional(),
});

const invitationGiftAssignmentsValidation = z.object({
  params: z.object({
    invitationId: z.coerce.number().int().positive(),
  }),
});

type GuestCategoryType = z.infer<typeof guestCategoryValidation>;
type UpdateGuestCategoryType = z.infer<typeof updateGuestCategoryValidation>;

type EventInvitationRemoveType = z.infer<typeof removeInvitationValidation>;
type EventInvitationType = z.infer<typeof EventInvitation>;
type setResponcevalidationType = z.infer<typeof setResponcevalidation>;
type InvitationGiftAssignmentsValidationType = z.infer<
  typeof invitationGiftAssignmentsValidation
>;

export {
  EventInvitationRemoveType,
  removeInvitationValidation,
  setResponcevalidation,
  setResponcevalidationType,
  validationRSVP,
  invitationStatusValidation,
  EventInvitation,
  EventInvitationType,
  guestCategoryValidation,
  updateGuestCategoryValidation,
  GuestCategoryType,
  UpdateGuestCategoryType,
  invitationGiftAssignmentsValidation,
  InvitationGiftAssignmentsValidationType,
};
