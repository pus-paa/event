import {
  throwErrorOnValidation,
  throwForbiddenError,
  throwNotFoundError,
} from "@/utils/error";
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
    const result = await Model.create({ ...data, ownerId: ownerId });
    if (!result || !result.id) {
      return throwErrorOnValidation("Failed to create business");
    }
    if (result.category == VendorBusinessCategoryTypes.Venue) {
      const venueResult = await Model.createVenueDetail({
        venueName: " Venue Name",
        businessId: result.id
      });
      if (!venueResult) {
        return throwErrorOnValidation("Failed to create venue details");
      }
    } else {
      const vendorServiceResult = await Model.createvendorServices({
        ...data,
        businessId: result.id,
      });
      if (!vendorServiceResult) {
        return throwErrorOnValidation(
          "Failed to create vendor service details",
        );
      }
    }
    return result;
  } catch (err) {
    throw err;
  }
};

const udpateVendorServiceDetail = async (
  params: CreateVendorServiceDetailType,
  vendorId: number,
  ownerId: number,
) => {
  try {
    const venueServiceData = await Model.listBusinessVendorService(vendorId);
    if (venueServiceData.length == 0 || venueServiceData == undefined) {
      return throwErrorOnValidation(
        "Vendor attribute with the table was not found",
      );
    }
    if (venueServiceData[0]?.ownerId != ownerId) {
      return throwForbiddenError(
        "You are not authorized to update the business detail",
      );
    }
    const result = await Model.udpatevendorService(params, vendorId);
    return result;
  } catch (err) {
    throw err;
  }
};

const updateVendorVenueDetail = async (
  params: Partial<CreateVenueDetailType>,
  venueId: number,
  ownerId: number,
) => {
  try {
    console.log(
      "this is the updatevendor detail in this",
      params,
      venueId,
      ownerId,
    );
    const venueServiceData = await Model.listBusinessVenueDetail(venueId);
    console.log(venueServiceData);
    if (venueServiceData.length == 0 || venueServiceData == undefined) {
      return throwErrorOnValidation("Venue details not found");
    }
    if (venueServiceData[0]?.ownerId != ownerId) {
      return throwForbiddenError(
        "You are not authorized to update the business detail",
      );
    }
    const result = await Model.updatevenueservice(venueId, params);
    return result;
  } catch (err) {
    throw err;
  }
};

const createVendorDetail = async (
  params: CreateVendorServiceDetailType,
  userId: number,
) => {
  try {
    const { error, data } = CreateVendorServiceDetailSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const businessDetail = await find(params.businessId);

    if (
      businessDetail.businessInformation.category ==
      VendorBusinessCategoryTypes.Venue
    ) {
      return throwErrorOnValidation("Business is of type venue");
    }
    if (businessDetail.businessInformation.ownerId != userId) {
      return throwForbiddenError(
        "You are not authorized to add the business detail",
      );
    }
    const result = await Model.createvendorServices(data);
    if (!result) {
      return throwErrorOnValidation("Failed to create vendor service details");
    }
    return result;
  } catch (err) {
    throw err;
  }
};

const addVenueDetail = async (
  params: CreateVenueDetailType & { businessId: number },
  userId: number,
) => {
  try {
    const { error, data } = CreateVenueDetailSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const businessDetail = await find(params.businessId);
    if (
      businessDetail.businessInformation.category !==
      VendorBusinessCategoryTypes.Venue
    ) {
      return throwErrorOnValidation("Business is not of type venue");
    }
    if (businessDetail.businessInformation.ownerId != userId) {
      return throwForbiddenError(
        "You are not authorized to add the venue detail",
      );
    }
    const result = await Model.createVenueDetail({
      ...data,
      businessId: params.businessId,
    });
    if (!result) {
      return throwErrorOnValidation("Failed to create venue details");
    }
    return result;
  } catch (err) {
    throw err;
  }
};
const getEventVendor = async (eventId: number, userId: number) => {
  try {
    const result = await Model.findEventVendor(eventId);
    await EventService.checkAuthorized(eventId, userId);
    return result;
  } catch (err) {
    throw err;
  }
};
const getVendorEvent = async (vendorId: number, userId: number) => {
  try {
    const vendor = await find(vendorId);
    if (vendor.businessInformation.ownerId != userId) {
      throwForbiddenError(
        "You are not allowed to see the information of the list of the event in the user",
      );
    }
    const result = await Model.findVendorEvent(vendorId);
    return result;
  } catch (err) {
    throw err;
  }
};
const findEventVendor = async ({
  eventId,
  businessId,
}: {
  eventId: number;
  businessId?: number;
}) => {
  try {
    const eventVendor = await Model.findEventVendor(eventId, businessId);
    return eventVendor ? eventVendor[0] : null;
  } catch (err) {
    throw err;
  }
};

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

    const business = await find(data.vendorId);
    if (!business?.businessInformation.id) {
      return throwNotFoundError("Business not found");
    }

    const exists = await Model.findEventVendorLink(eventId, data.vendorId);
    if (exists) {
      return throwErrorOnValidation(
        "Vendor business already linked to this event",
      );
    }

    const result = await Model.createEventVendorLink({
      event_id: eventId,
      vendor_buisness_id: data.vendorId,
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
};

const updateEventVendor = async ({
  eventId,
  vendorId,
  ownerId,
  params,
}: {
  eventId: number;
  vendorId: number;
  ownerId: number;
  params: any;
}) => {
  try {
    const eventVendor = await findEventVendor({
      eventId: eventId,
      businessId: vendorId,
    });
    const event = await EventService.checkAuthorized(eventId, ownerId);
    if (eventVendor?.ownerId != ownerId && !event) {
      throwForbiddenError(" You are not authorized to change in this field");
    }
    const updatedData = await Model.updateEventVendor(
      params,
      eventId,
      vendorId,
    );
    return updatedData;
  } catch (err) {
    throw err;
  }
};

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
};

const update = async (id: number, params: any, ownerId: number) => {
  try {
    const { error, data } = CreateBusinessSchema.safeParse(params);
    if (error || data == undefined) {
      return throwErrorOnValidation(error.message);
    }
    const businessData = await find(id);

    if (businessData.businessInformation.ownerId != ownerId) {
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
};

const updatebusinessInformation = async (
  id: number,
  params: any,
  ownerId: number,
) => {
  try {
    const businessData = await find(id);
    if (businessData.businessInformation.ownerId != ownerId) {
      return throwForbiddenError("User cannot update the business");
    }
    if (
      businessData.businessInformation.category ==
      VendorBusinessCategoryTypes.Venue
    ) {
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
};

const remove = async (id: number, ownerId: number) => {
  try {
    const existingData = await find(id);
    if (!existingData) {
      return throwNotFoundError("Business with the information was not found");
    }
    if (existingData.businessInformation.ownerId != ownerId) {

      return throwForbiddenError("User cannot delete the business");
    }
    const removeBusiness = await Model.destroy(id);
    return removeBusiness;
  } catch (err) {
    throw err;
  }
};

const findOne = async (id: number) => {
  try {
    const business = await Model.findById(id);
    return business;
  } catch (err) {
    throw err;
  }
};

const list = async (query: any) => {
  try {
    const business = await Model.findAll(query);
    return business;
  } catch (err) {
    throw err;
  }
};

const listEventOfMyBusiness = async (businessIds: number[], status: string) => {
  try {
    const events = await Model.getEventOfMyBusiness(businessIds, status);
    return events;
  } catch (err) {
    throw err;
  }
};

const getMyBusinesses = async (userId: number) => {
  try {
    const businesses = await Model.getMyBusinesses(userId);
    return businesses;
  } catch (err) {
    throw err;
  }
};

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
  list,
  listEventOfMyBusiness,
  getMyBusinesses,
};
