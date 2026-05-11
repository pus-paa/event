import schema from "./schema";
import user from "@/modules/user/schema";

const reviewSelectQuery = {
  id: schema.id,
  businessId: schema.businessId,
  userId: schema.userId,
  username: user.username,
  rating: schema.rating,
  description: schema.description,
  createdAt: schema.createdAt,
  updatedAt: schema.updatedAt,
};

export default {
  reviewSelectQuery,
};
