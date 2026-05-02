import logger from "@/config/logger";
import z from "zod";
import Model from "./model";
import Resource from "./resource";
import {
  throwErrorOnValidation,
  throwForbiddenError,
  throwNotFoundError,
} from "@/utils/error";
import EventService from "@/modules/event/service";
import BusinessModel from "@/modules/businesses/model";
import {
  CreateCateringType,
  UpdateCateringType,
  CreateMenuItemType,
  UpdateMenuItemType,
} from "./validators";

const isAuthorized = async (
  eventId: number,
  cateringId: number | null,
  userId: number,
): Promise<boolean> => {
  try {
    const authorized = await EventService.checkAuthorized(eventId, userId);
    if (authorized) {
      return true;
    }

    if (cateringId) {
      const catering = await Model.findCateringById(cateringId);
      if (catering?.vendorId) {
        const vendor = await BusinessModel.findById(catering.vendorId);
        if (vendor && vendor.ownerId === userId) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

const listCaterings = async (params: any) => {
  try {
    const { page, limit, eventId } = params;

    await EventService.find(Number(eventId));

    const caterings = await Model.listCaterings({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      eventId: Number(eventId),
    });

    return {
      ...caterings,
      items: caterings.items.map((item) => Resource.toJson(item)),
    };
  } catch (error: any) {
    logger.error(`Error fetching caterings: ${error.message}`);
    throw error;
  }
};

const createCatering = async (
  input: CreateCateringType["body"],
  eventId: number,
  userId: number,
) => {
  try {
    console.log(input);
    const authorized = await isAuthorized(eventId, null, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to add catering to this event",
      );
    }

    if (input.endDateTime <= input.startDateTime) {
      return throwErrorOnValidation("End date must be after start date");
    }

    const catering = await Model.createCatering({
      ...input,
      vendorId: input.vendorId ?? null,
      eventId,
    });

    if (!catering) {
      return throwErrorOnValidation("Failed to create catering");
    }

    logger.info(`Catering created successfully: ${catering.id}`);
    return Resource.toJson(catering);
  } catch (error: any) {
    logger.error(`Error creating catering: ${error.message}`);
    throw error;
  }
};

const findCateringById = async (cateringId: number) => {
  try {
    const catering = await Model.findCateringById(cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }
    return Resource.toJson(catering);
  } catch (error: any) {
    logger.error(`Error finding catering: ${error.message}`);
    throw error;
  }
};

const updateCatering = async (
  cateringId: number,
  input: UpdateCateringType["body"],
  userId: number,
) => {
  try {
    const catering = await Model.findCateringById(cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const authorized = await isAuthorized(catering.eventId, cateringId, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to update this catering",
      );
    }

    if (input.startDateTime || input.endDateTime) {
      const startDateTime = new Date(
        input.startDateTime || catering.startDateTime,
      );
      const endDateTime = new Date(input.endDateTime || catering.endDateTime);

      if (endDateTime <= startDateTime) {
        return throwErrorOnValidation("End date must be after start date");
      }
    }

    const updatedCatering = await Model.updateCatering(cateringId, input);

    if (!updatedCatering) {
      return throwErrorOnValidation("Failed to update catering");
    }
    logger.info(`Catering updated successfully: ${cateringId}`);
    return Resource.toJson(updatedCatering);
  } catch (error: any) {
    logger.error(`Error updating catering: ${error.message}`);
    throw error;
  }
};

const deleteCatering = async (cateringId: number, userId: number) => {
  try {
    const catering = await Model.findCateringById(cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const authorized = await isAuthorized(catering.eventId, cateringId, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to delete this catering",
      );
    }

    await Model.deleteCatering(cateringId);
    logger.info(`Catering deleted successfully: ${cateringId}`);
    return { id: cateringId, message: "Catering deleted successfully" };
  } catch (error: any) {
    logger.error(`Error deleting catering: ${error.message}`);
    throw error;
  }
};

const createMenuItem = async (
  input: CreateMenuItemType["body"],
  cateringId: number,
  userId: number,
) => {
  try {
    const catering = await Model.findCateringById(cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const authorized = await isAuthorized(catering.eventId, cateringId, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to add menu items to this catering",
      );
    }

    const menuItem = await Model.createMenuItem({
      ...input,
      cateringId,
    });

    if (!menuItem) {
      return throwErrorOnValidation("Failed to create menu item");
    }

    logger.info(`Menu item created successfully: ${menuItem.id}`);
    return Resource.toJsonMenu(menuItem);
  } catch (error: any) {
    logger.error(`Error creating menu item: ${error.message}`);
    throw error;
  }
};

const listMenuItems = async (cateringId: number) => {
  try {
    const catering = await Model.findCateringById(cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const menuItems = await Model.listMenuItems(cateringId);
    return menuItems.map((item) => Resource.toJsonMenu(item));
  } catch (error: any) {
    logger.error(`Error fetching menu items: ${error.message}`);
    throw error;
  }
};

const updateMenuItem = async (
  menuItemId: number,
  input: UpdateMenuItemType["body"],
  userId: number,
) => {
  try {
    const menuItem = await Model.findMenuItemById(menuItemId);
    if (!menuItem) {
      return throwNotFoundError("Menu item not found");
    }

    const catering = await Model.findCateringById(menuItem.cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const authorized = await isAuthorized(
      catering.eventId,
      catering.id,
      userId,
    );
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to update this menu item",
      );
    }

    const updatedMenuItem = await Model.updateMenuItem(menuItemId, input);

    if (!updatedMenuItem) {
      return throwErrorOnValidation("Failed to update menu item");
    }
    logger.info(`Menu item updated successfully: ${menuItemId}`);
    return Resource.toJsonMenu(updatedMenuItem);
  } catch (error: any) {
    logger.error(`Error updating menu item: ${error.message}`);
    throw error;
  }
};

const deleteMenuItem = async (menuItemId: number, userId: number) => {
  try {
    const menuItem = await Model.findMenuItemById(menuItemId);
    if (!menuItem) {
      return throwNotFoundError("Menu item not found");
    }

    const catering = await Model.findCateringById(menuItem.cateringId);
    if (!catering) {
      return throwNotFoundError("Catering not found");
    }

    const authorized = await isAuthorized(
      catering.eventId,
      catering.id,
      userId,
    );
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to delete this menu item",
      );
    }

    await Model.deleteMenuItem(menuItemId);
    logger.info(`Menu item deleted successfully: ${menuItemId}`);
    return { id: menuItemId, message: "Menu item deleted successfully" };
  } catch (error: any) {
    logger.error(`Error deleting menu item: ${error.message}`);
    throw error;
  }
};

export {
  listCaterings,
  createCatering,
  findCateringById,
  updateCatering,
  deleteCatering,
  createMenuItem,
  listMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
