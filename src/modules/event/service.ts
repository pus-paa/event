import Model from "./model";
import UserService from "@/modules/user/service";
import InvitationModel from "@/modules/invitation/model";
import InvitationService from "@/modules/invitation/service"
import Resource from "./resource";
import logger from "@/config/logger";
import {
  AddEventMemberValidationSchema,
  removeEventMemberValidationSchema,
  removeEventMemberValidationType,
  AddEventMemberValidationSchemaType,
  EventUpdateValidationSchema,
  EventValidationSchema,
  UpdateEventType
} from "./validators";

import {
  throwNotFoundError,
  throwUnauthorizedError,
  throwErrorOnValidation,
  throwForbiddenError,
} from "@/utils/error";

const list = async (params: any) => {
  try {
    const data = await Model.findAllAndCount(params);
    const mapped_data = data.items.map((event) => {
      return {
        ...event,
        role:
          event.organizer == params.userId ? "Organizer" : event.role,
      };
    });
    return {
      items: Resource.collection(mapped_data),
    };
  } catch (err: any) {
    logger.error("Error in Category listing:", err);
    throw err;
  }
};

const getEventVendor = async (eventid: number) => {
  try {
    const event_information = find(eventid);
    if (!event_information) {
      return throwNotFoundError(
        "Event with the event id was not found in the db ",
      );
    }
    const eventVendor = await Model.getEventVendor(eventid);
    return eventVendor;
  } catch (err) {
    throw err;
  }
};

const create = async (input: any, userId: number) => {
  try {
    console.log(input);
    const result = EventValidationSchema.safeParse(input);
    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const eventData = {
      ...input,
      startDateTime: new Date(input.startDateTime),
      endDateTime: new Date(input.endDateTime),
    };
    const data = await Model.create(eventData);
    if (!data || !data.organizer) {
      throw new Error("Event creation failed");
    }
    const eventMember = await Model.makeEventOwner(
      data.id,
      userId,
      "Organizer",
    );
    if (data == undefined || eventMember == undefined) {
      throw new Error("Something went wrong ");
    }

    await InvitationModel.seedDefaultGuestCategories(data.id);

    return { ...Resource.toJson(data), ownerShipId: eventMember.id };
  } catch (err: any) {
    logger.error("Error in Event creation:", err);
    throw err;
  }
};

const find = async (id: number) => {
  try {
    console.log("finding the event with the id", id);
    const data = await Model.find({ id });
    logger.debug(`Searching the event with the id ${id}`);
    if (!data) throw new Error("Event not found");
    return Resource.toJson(data);
  } catch (err: any) {
    logger.error("Error in event finding:", err);
    throw err;
  }
};

const checkAuthorized = async (id: number, userId?: number) => {

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }
  const event = await find(id);
  if (!event) return throwNotFoundError("Event not found");
  let eventMember = [];
  if (event.parentId != null) {
    eventMember = await Model.getEventMember(event.parentId);
  }
  else {
    eventMember = await Model.getEventMember(id);
  }

  if (!event.organizer) {
    return throwUnauthorizedError("Unauthorized: Event organizer not found");
  }

  if (
    event.organizer === userId ||
    eventMember.some((member: any) => {
      return member.user.id === userId;
    })
  ) {
    return true;
  }
  if (event.organizer !== userId) {
    return false;
    //throw new Error("Unauthorized: You are not the organizer of this event");
  }

  return true;
};

const update = async (id: number, input: UpdateEventType, userId?: number) => {
  try {
    await checkAuthorized(id, userId);
    console.log(input);
    const result = EventUpdateValidationSchema.safeParse(input);

    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }


    const data = await Model.update(result.data, id); //TODO:
    if (!data) throw new Error("Event not found or update failed");
    return Resource.toJson(data as any);
  } catch (err: any) {
    logger.error("Error in event update:", err);
    throw err;
  }
};

const remove = async (id: number, userId?: number) => {
  try {
    await checkAuthorized(id, userId);
    const data = await Model.destroy(id);

    if (!data || data.length === 0) {
      throw new Error("Event not found or already deleted");
    }

    return {
      success: true,
      message: "Event deleted successfully",
      deletedEvent: Resource.toJson(data[0] as any),
    };
  } catch (err: any) {
    logger.error("Error in event deletion:", err);
    throw err;
  }
};

const listMyEvents = async (userId: number, params: any) => {
  try {
    const allParams = { ...params, organizer: userId };
    const data = await Model.findByUser(userId, allParams);
    return {
      ...data,
      items: data.items.map((item: any) => ({
        ...Resource.toJson(item.event as any),
        role: item.organizer == userId ? "Organizer" : item.user_event?.role,
      })),
    };
  } catch (err: any) {
    logger.error("Error in Event listing by user:", err);
    throw err;
  }
};



const duplicateSubevent = async (eventId: number, userId: number) => {
  try {
    await checkAuthorized(eventId, userId);
    const originalEvent = await find(eventId);
    if (!originalEvent) {
      throwNotFoundError("Event not found");
    }

    const {
      id,
      createdAt,
      updatedAt,
      ...eventPayload
    } = originalEvent as any;

    const newEvent = await Model.create(eventPayload);
    if (!newEvent) {
      throw new Error("Something went wrong while duplicating the event");
    }

    return Resource.toJson(newEvent);
  } catch (err: any) {
    logger.error("Error in duplicating the event", err);
    throw err;
  }
};
const getUserRelatedToEvent = async (eventId: number, userId: number) => {
  try {
    await checkAuthorized(eventId, userId);

    const data = await Model.getEventMember(eventId);
    return data;
  } catch (error: any) {
    logger.error("Error in getting users related to event:", error);
    throw error;
  }
};

const getUserwithRole = async (eventId: number, userId: number) => {
  try {
    const user: {
      userId: string,
      role: string,
      isMember: boolean,
      isInvited: boolean
    }[] = await Model.getRoleforUser(eventId, userId);
    return user;

  } catch (err) {
    throw err;
  }

}

const makeEventMember = async (
  eventId: number,
  userId: number,
  params: AddEventMemberValidationSchemaType,
) => {
  try {
    const { error, data } = AddEventMemberValidationSchema.safeParse(params);
    if (error) {
      throwErrorOnValidation(error.message);
    }
    await checkAuthorized(eventId, userId);
    const eventMembers = await getUserRelatedToEvent(eventId, userId);
    const userInfo = await UserService.find({ id: params.userId });
    if (!userInfo || !userInfo.id) {
      return throwNotFoundError("User with the phone was not found");
    }
    console.log("This is the event", userInfo);
    const eventIsOwner = eventMembers.find(
      (member: any) => member.user?.id == userInfo.id,
    );

    if (eventIsOwner) {
      return throwForbiddenError("Already event member");
    }
    const event_owner_data = await Model.makeEventOwner(
      eventId,
      userInfo.id,
      data?.role ?? "Host",
    );
    return event_owner_data;
  } catch (err: any) {
    logger.error("Error in getting the user with the info");
    throw err;
  }
};

const removeEventMember = async (params: removeEventMemberValidationType["params"], userId: number) => {
  try {
    const eventAuthorized = await checkAuthorized(Number(params.eventId), userId);

    if (eventAuthorized) {
      const removeEventMember = await Model.removeEventMember(Number(params.eventId), Number(params.eventMemberId));
      return removeEventMember;
    }
    else {
      throwErrorOnValidation("User cannot change the planning Committe")
    }
  } catch (err) {
    throw err;
  }
}

const getSubEventOfEvent = async (eventId: number, userId: number) => {
  try {
    //Check the user or tge guest for the invitaiton or the event member table lookup in the db 
    let hasPermission = false;
    let unSubscribedsubEvent: number[] = [];
    //Seaerch the list of the invitation of the event 
    const invitationEvent = await InvitationService.findInvitationforEvent(
      userId, eventId
    );
    if (!!invitationEvent) {
      hasPermission = true;
    }
    unSubscribedsubEvent = invitationEvent?.unInvitedSubevent ?? [];
    if (!hasPermission) {
      //Check the user to be the admin of the event
      hasPermission = await checkAuthorized(eventId, userId);
    }

    //IF permission then get the sub event with the list of the unwanted event to the guest
    if (hasPermission) {
      const data = await Model.getSubEventOfEvent(eventId, unSubscribedsubEvent);
      if (data.length === 0) {
        return [];
      }
      return Resource.collection(data);
    }
    else {
      throwForbiddenError("Error While getting data this user cannot access the data ");
    }
  } catch (error) {
    throw error;
  }
};


export default {
  makeEventMember,
  list,
  create,
  find,
  update,
  remove,
  listMyEvents,
  checkAuthorized,
  getUserRelatedToEvent,
  getEventVendor,
  duplicateSubevent,
  removeEventMember,
  getSubEventOfEvent,
  getUserwithRole,
};
