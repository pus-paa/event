import { and, eq } from "drizzle-orm";
import { giftCategory, gift } from "./schema";
import type { GiftCategoryColumn, GiftColumn } from "./resource";

const giftCategorySelectQuery = {
  id: giftCategory.id,
  name: giftCategory.name,
  eventId: giftCategory.eventId,
  createdBy: giftCategory.createdBy,
  createdAt: giftCategory.createdAt,
  updatedAt: giftCategory.updatedAt,
};

const giftSelectQuery = {
  id: gift.id,
  name: gift.name,
  category: gift.category,
  eventId: gift.eventId,
  value: gift.value,
  createdBy: gift.createdBy,
  createdAt: gift.createdAt,
  updatedAt: gift.updatedAt,
};

const buildGiftCategoryFilters = (params: Partial<GiftCategoryColumn>) => {
  const conditions = [] as any[];
  if (params?.id !== undefined) {
    conditions.push(eq(giftCategory.id, params.id));
  }
  if (params?.eventId !== undefined && params?.eventId !== null) {
    conditions.push(eq(giftCategory.eventId, params.eventId));
  }
  if (params?.createdBy !== undefined && params?.createdBy !== null) {
    conditions.push(eq(giftCategory.createdBy, params.createdBy));
  }
  if (params?.name !== undefined && params?.name !== null) {
    conditions.push(eq(giftCategory.name, params.name));
  }
  return conditions.length ? and(...conditions) : undefined;
};

const buildGiftFilters = (params: Partial<GiftColumn>) => {
  const conditions = [] as any[];
  if (params?.id !== undefined) {
    conditions.push(eq(gift.id, params.id));
  }
  if (params?.eventId !== undefined && params?.eventId !== null) {
    conditions.push(eq(gift.eventId, params.eventId));
  }
  if (params?.createdBy !== undefined && params?.createdBy !== null) {
    conditions.push(eq(gift.createdBy, params.createdBy));
  }
  if (params?.category !== undefined && params?.category !== null) {
    conditions.push(eq(gift.category, params.category));
  }
  if (params?.name !== undefined && params?.name !== null) {
    conditions.push(eq(gift.name, params.name));
  }
  return conditions.length ? and(...conditions) : undefined;
};

export default {
  giftCategorySelectQuery,
  giftSelectQuery,
  buildGiftCategoryFilters,
  buildGiftFilters,
};
