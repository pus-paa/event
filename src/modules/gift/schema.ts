import { pgTable } from "drizzle-orm/pg-core";
import {
	giftCategoryTableName,
	giftTableName,
	giftCategoryattributes,
	giftsAttributes,
} from "./attributes";

const giftCategory = pgTable(giftCategoryTableName, giftCategoryattributes);
const gift = pgTable(giftTableName, giftsAttributes);

export { giftCategory, gift };
export default giftCategory;
