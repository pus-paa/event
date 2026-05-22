import { throwNotFoundError } from "@/utils/error";
import Model from "./model";
import BusinessModel from "@/modules/businesses/model";

const list = async (userId: number) => {
  return await Model.findByUser(userId);
};

const add = async (userId: number, businessId: number) => {
  const business = await BusinessModel.findById(businessId);
  if (!business) return throwNotFoundError("Business not found");

  const existing = await Model.findOne(userId, businessId);
  if (existing) return existing;

  return await Model.create(userId, businessId);
};

const remove = async (userId: number, businessId: number) => {
  const existing = await Model.findOne(userId, businessId);
  if (!existing) return throwNotFoundError("Favourite not found");

  return await Model.destroy(userId, businessId);
};

export default { list, add, remove };
