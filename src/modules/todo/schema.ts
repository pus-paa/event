import { tableName, todoAttribute } from "./attributes";
import { pgTable } from "drizzle-orm/pg-core";
const todoSchema = pgTable(tableName, todoAttribute);
export default todoSchema;
