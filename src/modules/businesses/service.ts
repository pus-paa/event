import { throwErrorOnValidation, throwForbiddenError, throwNotFoundError } from "@/utils/error";
import Model from "./model";
import {
  CreateBusinessSchema,
  CreateBusinessType,
  CreateVendorServiceDetailSchema,
  CreateVendorServiceDetailType,
  CreateVenueDetailSchema,
  CreateVenueDetailType,
  PostEventVendorSchema,
  PostEventVendorType,
} from "./validators";
import { VendorBusinessCategoryTypes } from "@/constant";
import EventService from "@/modules/event/service";

const create = async (params: CreateBusinessType, ownerId: number) => {
  try {
    const { error, data } = CreateBusinessSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const result = await Model.create({ ...data, owner_id: ownerId });
    if (!result) {
      return throwErrorOnValidation("Failed to create business");
    }
    if (result.category == VendorBusinessCategoryTypes.Venue) {
      const venueResult = await Model.createVenueDetail({ ...data, business_id: result.id });
      if (!venueResult) {
        return throwErrorOnValidation("Failed to create venue details");
      }
    } else {
      const vendorServiceResult = await Model.createvendorServices({ ...data, business_id: result.id });
      if (!vendorServiceResult) {
        return throwErrorOnValidation("Failed to create vendor service details");
      }
    }
    return result;

  } catch (err) {
    throw err;
  }
}

const udpateVendorServiceDetail = async (params: CreateVendorServiceDetailType, vendorId: number, ownerId: number) => {
  try {
    const venue_service_data = await Model.listBusinessVendorService(vendorId);
    if (venue_service_data.length == 0 || venue_service_data == undefined) {
      return throwErrorOnValidation("Vendor attribute with the table was not found");
    }
    if (venue_service_data[0]?.owner_id != ownerId) {
      return throwForbiddenError("You are not authorized to update the business detail");
    }
    const result = await Model.udpatevendorService(params, vendorId);
    return result;
  }
  catch (err) {
    throw err;
  }
}

const updateVendorVenueDetail = async (params: Partial<CreateVenueDetailType>, venueId: number, ownerId: number) => {
  try {
    console.log("this is the updatevendor detail in this", params, venueId, ownerId);
    const venue_service_data = await Model.listBusinessVenueDetail(venueId);
    console.log(venue_service_data);
    if (venue_service_data.length == 0 || venue_service_data == undefined) {
      return throwErrorOnValidation("Venue details not found");
    }
    if (venue_service_data[0]?.owner_id != ownerId) {
      return throwForbiddenError("You are not authorized to update the business detail");
    }
    const result = await Model.updatevenueservice(venueId, params);
    return result;
  }
  catch (err) {
    throw err;
  }
}

const createVendorDetail = async (params: CreateVendorServiceDetailType, userId: number) => {
  try {
    const { error, data } = CreateVendorServiceDetailSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const business_detail = await find(params.businessesId);

    if (business_detail.business_information.category == VendorBusinessCategoryTypes.Venue) {
      return throwErrorOnValidation("Business is of type venue");
    }
    if (business_detail.business_information.owner_id != userId) {
      return throwForbiddenError("You are not authorized to add the business detail");
    }
    const result = await Model.createvendorServices(data);
    if (!result) {
      return throwErrorOnValidation("Failed to create vendor service details");
    }
    return result;

  } catch (err) {
    throw err;
  }
}

const addVenueDetail = async (params: CreateVenueDetailType & { business_id: number }, userId: number) => {
  try {
    const { error, data } = CreateVenueDetailSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const business_detail = await find(params.business_id);
    if (business_detail.business_information.category !== VendorBusinessCategoryTypes.Venue) {
      return throwErrorOnValidation("Business is not of type venue");
    }
    if (business_detail.business_information.owner_id != userId) {
      return throwForbiddenError("You are not authorized to add the venue detail");
    }
    const result = await Model.createVenueDetail({ ...data, business_id: params.business_id });
    if (!result) {
      return throwErrorOnValidation("Failed to create venue details");
    }
    return result;
  } catch (err) {
    throw err;
  }
}
const getEventVendor = async (eventId: number, userId: number) => {
  try {
    const result = await Model.findEventVendor(eventId);
    if (!result || result.length == 0) {
      throwNotFoundError("No vendors found for the event");
    }
    await EventService.checkAuthorized(eventId, userId);
    return result;
  } catch (err) {
    throw err;

  }
}
const getVendorEvent = async (vendorId: number, userId: number) => {
  try {
    const vendor = await find(vendorId);
    if (vendor.business_information.owner_id != userId) {
      throwForbiddenError("You are not allowed to see the information of the list of the event in the user");
    }
    const result = await Model.findVendorEvent(vendorId);
    return result;

  } catch (err) {
    throw err;
  }
}
const findEventVendor = async ({
  eventId,
  businessId
}: { eventId: number, businessId?: number }) => {
  try {
    const eventVendor = await Model.findEventVendor(eventId, businessId);
    if (!eventVendor) {
      throwNotFoundError("No aquired vendor was found");
    }
    return eventVendor ? eventVendor[0] : null;
  } catch (err) {
    throw err;
  }
}

const postEventVendor = async (
  eventId: number,
  params: PostEventVendorType,
  userId: number,
) => {
  try {
    const { error, data } = PostEventVendorSchema.safeParse(params);
    if (error || !data) {
      return throwErrorOnValidation(error?.message || "Invalid payload");
    }

    await EventService.checkAuthorized(eventId, userId);

    const business = await find(data.businessId);
    if (!business?.business_information?.id) {
      return throwNotFoundError("Business not found");
    }

    const exists = await Model.findEventVendorLink(eventId, data.businessId);
    if (exists) {
      return throwErrorOnValidation("Vendor business already linked to this event");
    }

    const result = await Model.createEventVendorLink({
      event_id: eventId,
      vendor_buisness_id: data.businessId,
      acquired_by: userId,
      status: data.status,
      notes: data.notes,
    });

    if (!result) {
      return throwErrorOnValidation("Failed to link vendor business to event");
    }

    return result;

  } catch (err) {
    throw err;

  }
}

const updateEventVendor = async ({
  eventId, vendorId,
  ownerId, params
}: {
  eventId: number, vendorId: number,
  ownerId: number, params: any
}) => {
  try {
    const event_vendor = await findEventVendor({
      eventId: eventId,
      businessId: vendorId
    });
    const event = await EventService.checkAuthorized(eventId, ownerId)
    if (event_vendor?.owner_id != ownerId && !event.id) {
      throwForbiddenError(" You are not authorized to change in this field")
    }
    const updated_data = await Model.updateEventVendor(
      params, eventId, vendorId
    );
    return updated_data;
  } catch (err) {
    throw err;
  }
}

const find = async (id: number) => {
  try {
    const result = await Model.findById(id);
    if (!result) {
      return throwErrorOnValidation("Business not found");
    }
    return result;
  } catch (err) {
    throw err;
  }
}

const update = async (id: number, params: any, ownerId: number) => {
  try {
    const { error, data } = CreateBusinessSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const business_data = await find(id);

    if (business_data.business_information.owner_id != ownerId) {
      return throwForbiddenError("User cannot update the business");
    }
    const result = await Model.update(id, data);
    if (!result) {
      return throwErrorOnValidation("Failed to update business");
    }
    return result;

  } catch (err) {
    throw err;
  }
}

const updatebusinessInformation = async (id: number, params: any, ownerId: number) => {
  try {
    const business_data = await find(id);
    if (business_data.business_information.owner_id != ownerId) {
      return throwForbiddenError("User cannot update the business");
    }
    if (business_data.business_information.type == VendorBusinessCategoryTypes.Venue) {
      const result = await Model.updatevenueservice(id, params);
      if (!result) {
        return throwErrorOnValidation("Failed to update business");
      }
      return result;
    } else {
      const result = await Model.udpatevendorService(params, id);
      if (!result) {
        return throwErrorOnValidation("Failed to update business");
      }
      return result;
    }

  } catch (err) {
    throw err;
  }
}


const remove = async (id: number, ownerId: number) => {
  try {
    const existingData = await find(id);
    if (!existingData) {
      return throwNotFoundError('Business with the information was not found');
    }
    if (existingData.business_information.owner_id != ownerId) {
      return throwForbiddenError("User cannot delete the business");
    }
    const remove_business = await Model.destroy(id);
    return remove_business;

  } catch (err) {
    throw err;
  }
}

const findOne = async (id: number) => {
  try {
    const business = await Model.findById(id);
    return business;
  } catch (err) {
    throw err;
  }
}

const list = async (query: any) => {
  try {
    const business = await Model.findAll(query);
    return business;

  } catch (err) {
    throw err;
  }
}

export default {
  create,
  createVendorDetail,
  addVenueDetail,
  udpateVendorServiceDetail,
  updateVendorVenueDetail,
  getEventVendor,
  updateEventVendor,
  postEventVendor,
  update,
  findEventVendor,
  find,
  updatebusinessInformation,
  remove,
  findOne,
  getVendorEvent,
  list
};
