import { pgTable } from "drizzle-orm/pg-core";
import { reviewAttributes, tableName } from "./attributes";

const schema = pgTable(tableName, reviewAttributes);

export default schema;