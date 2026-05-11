import Model from "./model";
import { createVehicleValidation, assignVehicleValidation, AssignVehicleType, updateVehicleValidation } from "./validators";
import Resource from "./resource";
import EventService from "@/modules/event/service";
import InvitationModel from "@/modules/invitation/model";
import logger from "@/config/logger";
import { throwErrorOnValidation } from "@/utils/error";

/**
 * Service to handle logistics (vehicles and assignments)
 */

const listVehicles = async (eventId: number, userId: number) => {
  try {
    await EventService.checkAuthorized(eventId, userId);

    const data = await Model.findAllVehicle({ eventId });
    console.log(data);
    const result = Resource.vehicleCollection(data);
    return result;

  } catch (err: any) {
    logger.error("Error in listVehicles:", err);
    throw err;
  }
};

const listVehiclesWithAssignments = async (eventId: number, userId: number) => {
  try {
    await EventService.checkAuthorized(eventId, userId);
    const data = await Model.findAllVehicleWithAssigned({ eventId });
    // Note: The mapping here might need to be more sophisticated depending on the grouped result structure
    return data;
  } catch (err: any) {
    logger.error("Error in listVehiclesWithAssignments:", err);
    throw err;
  }
};

const findVehicle = async (id: number) => {
  try {
    const data = await Model.find({ id });
    if (!data) throw new Error("Vehicle not found");
    return Resource.vehicleToJson(data);
  } catch (err: any) {
    logger.error("Error in findVehicle:", err);
    throw err;
  }
};

const createVehicle = async (input: any, userId: number, eventId: number) => {
  try {
    const { data: validateData, error } = createVehicleValidation.safeParse(input);
    if (error || !validateData || validateData == undefined) {
      return throwErrorOnValidation("Error while validating the data");
    }
    await EventService.checkAuthorized(eventId, userId);
    const result = await Model.createVehicle(validateData, eventId);
    return Resource.vehicleToJson(result);
  } catch (err: any) {
    logger.error("Error in createVehicle:", err);
    throw err;
  }
};

const updateVehicle = async (id: number, input: any, userId: number) => {
  try {
    const vehicle = await Model.find({ id });
    if (!vehicle) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const { data: validatedData, error } = updateVehicleValidation.safeParse(input);
    if (error || !validatedData) {
      return throwErrorOnValidation("Error while validating the update data");
    }

    console.log('This is the data to be updated in the udpate vehicle in the section ', vehicle, validatedData);
    const data = await Model.update(validatedData, id);
    console.log('this is the udpate vehicle in the db ', data);
    return Resource.vehicleToJson(data);
  } catch (err: any) {
    logger.error("Error in updateVehicle:", err);
    throw err;
  }
};

const deleteVehicle = async (id: number, userId: number) => {
  try {
    const vehicle = await Model.find({ id });
    if (!vehicle) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const data = await Model.deleteVehicle(id);
    return Resource.vehicleToJson(data);
  } catch (err: any) {
    logger.error("Error in deleteVehicle:", err);
    throw err;
  }
};

const assignVehicle = async (input: AssignVehicleType, userId: number) => {
  try {
    const parsedInput = assignVehicleValidation.safeParse(input);
    if (!parsedInput.success || !parsedInput.data) {
      return throwErrorOnValidation("Invalid assignment payload");
    }

    const vehicle = await Model.find({ id: parsedInput.data.vehicleId });
    if (!vehicle || !vehicle.eventId) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const data = await Model.assignVehicle(parsedInput.data);
    console.log('The data in the issue is in the service for the assign vehicle', input);
    const invitationUpdate: Record<string, string> = {};
    if (parsedInput.data.isArrival) {
      invitationUpdate.arrivalInfo = "assigned";
    }
    if (parsedInput.data.isDeparture) {
      invitationUpdate.departureInfo = "assigned";
    }

    if (Object.keys(invitationUpdate).length > 0) {
      await InvitationModel.update(invitationUpdate, parsedInput.data.invitationId);
    }

    return Resource.assignmentToJson(data);
  } catch (err: any) {
    logger.error("Error in assignVehicle:", err);
    throw err;
  }
};

const updateAssignment = async (vehicleId: number, invitationId: number, input: any, userId: number) => {
  try {
    const vehicle = await Model.find({ id: vehicleId });
    if (!vehicle) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const data = await Model.updateAssignedVehicle(input, vehicleId, invitationId);
    return Resource.assignmentToJson(data);
  } catch (err: any) {
    logger.error("Error in updateAssignment:", err);
    throw err;
  }
};

const removeAssignment = async (vehicleId: number, invitationId: number, userId: number) => {
  try {
    const vehicle = await Model.find({ id: vehicleId });
    if (!vehicle) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const data = await Model.removeAssignedVehicle(vehicleId, invitationId);
    await InvitationModel.update(
      { arrivalInfo: null, departureInfo: null },
      invitationId,
    );

    return Resource.assignmentToJson(data);
  } catch (err: any) {
    logger.error("Error in removeAssignment:", err);
    throw err;
  }
};

const listAssignmentsByVehicle = async (vehicleId: number, userId: number) => {
  try {
    const vehicle = await Model.find({ id: vehicleId });
    if (!vehicle) throw new Error("Vehicle not found");
    await EventService.checkAuthorized(vehicle.eventId, userId);

    const data = await Model.listAllAssignedVehicle({ vehicleId });

    return data;
  } catch (err: any) {
    logger.error("Error in listAssignmentsByVehicle:", err);
    throw err;
  }
};

export default {
  listVehicles,
  listVehiclesWithAssignments,
  findVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignVehicle,
  updateAssignment,
  removeAssignment,
  listAssignmentsByVehicle,
};
