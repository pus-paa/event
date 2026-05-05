import schema from "./schema";

const reviewSelectQuery = {
  id: schema.id,
  businessId: schema.businessId,
  userId: schema.userId,
  rating: schema.rating,
  description: schema.description,
  createdAt: schema.createdAt,
  updatedAt: schema.updatedAt,
};

export default {
  reviewSelectQuery,
};
