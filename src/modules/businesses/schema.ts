import { tableName, businessesAttribute } from "./attributes";
import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
const schema = pgTable(tableName, businessesAttribute);

export default schema;
