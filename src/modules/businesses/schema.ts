import { tableName, businessesAttribute } from "./attributes";
import { pgTable } from "drizzle-orm/pg-core";
const schema = pgTable(tableName, businessesAttribute);
export default schema;
