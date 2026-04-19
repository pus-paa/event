import Model from "./model";
import UserService from "@/modules/user/service";
import TodoService from "@/modules/todo/service";
import InvitationModel from "@/modules/invitation/model";
import Resource from "./resource";
import logger from "@/config/logger";
import {
  AddEventMemberValidationSchema,
  AddEventMemberValidationSchemaType,
  EventUpdateValidationSchema,
  EventValidationSchema,
  type updateEventType,
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
          event.organizer && event.event_member_userId == params.userId
            ? event.role || "Organizer"
            : "Guest",
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
  //if the event organizer is not the person also check the organizer family and then also

  const eventMember = await Model.getEventMember(id);
  if (!event.organizer) {
    return throwUnauthorizedError("Unauthorized: Event organizer not found");
  }

  if (
    event.organizer === userId ||
    eventMember.some((member: any) => {
      return member.user.id === userId
    })
  ) {
    return event;
  }
  if (event.organizer !== userId) {
    throw new Error("Unauthorized: You are not the organizer of this event");
  }

  return event;
};

const update = async (id: number, input: updateEventType, userId?: number) => {
  try {
    await checkAuthorized(id, userId);
    const result = EventUpdateValidationSchema.safeParse(input);
    console.log(result);

    if (!result.success) {
      throw new Error(
        result.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const eventData = {
      ...input,
      ...(input.startDateTime && {
        startDateTime: new Date(input.startDateTime),
      }),
      ...(input.endDateTime && { endDateTime: new Date(input.endDateTime) }),
    };

    const data = await Model.update(eventData as any, id); //TODO:
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
        role: item.user_event?.role,
      })),
    };
  } catch (err: any) {
    logger.error("Error in Event listing by user:", err);
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

const getSubEventOfEvent = async (eventId: number) => {
  try {
    await find(eventId);
    const data = await Model.getSubEventOfEvent(eventId);

    if (data.length === 0) {
      return [];
    }

    return Resource.collection(data);
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
  getSubEventOfEvent,
};
