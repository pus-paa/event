import UserModel from "@/modules/user/model";
import EventModel from "@/modules/event/model";
import RsvpModel from "./model";
import {
  throwForbiddenError,
  throwNotFoundError,
  throwErrorOnValidation,
} from "@/utils/error";

const canUserModifyInvitation = async (eventId: number, actorUserId: number) => {
  const invitation = await RsvpModel.find({ id: eventId  , userId: actorUserId });

  if (!invitation) {
    throwNotFoundError("Invitation");
  }

  const invitationData = invitation as NonNullable<typeof invitation>;

  const [event, user] = await Promise.all([
    EventModel.find({ id: invitationData.eventId }),
    UserModel.find({ id: actorUserId }),
  ]);

  if (!event) {
    throwNotFoundError("Event");
  }

  if (!user) {
    throwNotFoundError("User");
  }

  const userData = user as NonNullable<typeof user>;

  if (!invitationData.userId && !invitationData.familyId) {
    throwErrorOnValidation("Invalid invitation. Missing invited user/family");
    return false ; 
  }

  if (invitationData.userId && invitationData.userId === actorUserId) {
    return true;
  }

  if (invitationData.familyId) {
    if (!userData.familyId) {
      throwForbiddenError("You are not part of any family for this invitation");
      return false ; 
    }

    if (Number(userData.familyId) !== Number(invitationData.familyId)) {
        return false ; 

    }

    return true;
  }

  throwForbiddenError("You cannot modify this invitation");
};

export default {
  canUserModifyInvitation,
};
