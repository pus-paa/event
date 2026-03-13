import { serial, json, timestamp, varchar, integer } from "drizzle-orm/pg-core";
const tableName = "category";
type QuestionType = {
  question: string;
}[];
const attributes = {
  id: serial("id").primaryKey(),
  parentId: integer("parentId"),
  title: varchar("title", { length: 30 }),
  question: json("question").$type<QuestionType>(), // This will be dedkkk
  infos: json("infos"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};
export { tableName, attributes };
