import { type IAuthRequest } from "@/routes/index";
import Service from "./service"
import { throwErrorOnValidation } from "@/utils/error";

const list = async (req: IAuthRequest) => {
  try {
    const userId = req.user.id;
    return await Service.list(req.query, userId);
  } catch (err) {
    throw err;
  }
};

const create = async (req: IAuthRequest) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.create(req.body, ownerId);
  } catch (err) {
    throw err;
  }
};

const findOne = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) throwErrorOnValidation("Invalid business ID");
    return await Service.find(Number(id));
  } catch (err) {
    throw err;
  }
};

const update = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;
    if (!id || isNaN(Number(id))) throwErrorOnValidation("Invalid business ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.update(Number(id), req.body, ownerId);
  } catch (err) {
    throw err;
  }
};

const remove = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?.id;
    if (!id || isNaN(Number(id))) throwErrorOnValidation("Invalid business ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.remove(Number(id), ownerId);
  } catch (err) {
    throw err;
  }
};

const addVenueDetail = async (req: IAuthRequest) => {
  try {
    const { id: businessId } = req.params;
    const ownerId = req.user?.id;
    if (!businessId || isNaN(Number(businessId))) throwErrorOnValidation("Invalid business ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.addVenueDetail({ ...req.body, business_id: Number(businessId) }, ownerId);
  } catch (err) {
    throw err;
  }
};

const addVendorServiceDetail = async (req: IAuthRequest) => {
  try {
    const { id: businessId } = req.params;
    const ownerId = req.user?.id;
    if (!businessId || isNaN(Number(businessId))) throwErrorOnValidation("Invalid business ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.createVendorDetail({ ...req.body, businessesId: Number(businessId) }, ownerId);
  } catch (err) {
    throw err;
  }
};

const updateVendorVenueDetail = async (req: IAuthRequest) => {
  try {
    const { venueId } = req.params;
    const ownerId = req.user?.id;
    if (!venueId || isNaN(Number(venueId))) throwErrorOnValidation("Invalid venue ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.updateVendorVenueDetail(req.body, Number(venueId), ownerId);
  } catch (err) {
    throw err;
  }
};

const updateVendorServiceDetail = async (req: IAuthRequest) => {
  try {
    const { serviceId } = req.params;
    const ownerId = req.user?.id;
    if (!serviceId || isNaN(Number(serviceId))) throwErrorOnValidation("Invalid service ID");
    if (!ownerId) throwErrorOnValidation("User not authenticated");
    return await Service.udpateVendorServiceDetail(req.body, Number(serviceId), ownerId);
  } catch (err) {
    throw err;
  }
};

export default { list, create, findOne, update, remove, addVenueDetail, addVendorServiceDetail, updateVendorVenueDetail, updateVendorServiceDetail };
