import schema, { menuSchema } from "./schema";

const cateringSelectQuery = {
  id: schema.id,
  name: schema.name,
  perPlateprice: schema.perPlateprice,
  startDateTime: schema.startDateTime,
  noOfpax: schema.noOfpax,
  endDateTime: schema.endDateTime,
  eventId: schema.eventId,
  mealType: schema.mealType,
  isVeg: schema.isVeg,
  vendorId: schema.vendorId,
  createdAt: schema.createdAt,
  updatedAt: schema.updatedAt,
};

const menuSelectQuery = {
  id: menuSchema.id,
  name: menuSchema.name,
  description: menuSchema.description,
  note: menuSchema.note,
  guestCount: menuSchema.guestCount,
  type: menuSchema.type,
  cateringId: menuSchema.cateringId,
  createdAt: menuSchema.createdAt,
  updatedAt: menuSchema.updatedAt,
};

export default {
  cateringSelectQuery,
  menuSelectQuery,
};
