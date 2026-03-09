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

const invitation_responceValidation = z.object({
  invitationId: z.number(),// For which the invitation is made
  usersId: z.number().array(),
})
const EventInvitation = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  role:z.string().optional(),
  invitation_name:z.string().nonempty("Invitation name is required"),
  isFamily: z.boolean().default(false)
});

type EventInvitationType = z.infer<typeof EventInvitation>;


export { validationRSVP, invitationStatusValidation, invitation_responceValidation, EventInvitation, EventInvitationType };
