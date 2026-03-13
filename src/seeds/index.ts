// import bcrypt from "bcryptjs";
import db from "@/config/db/index";
import adminSchema from "@/modules/admin/schema";
import logger from "@/config/logger";
export async function seedAdmins() {
  db;
  logger.info("Admin seed completed");
}
const seed = async () => {
  await seedAdmins();
  const data = await db
    .insert(adminSchema)
    .values({
      email: "admin@gmail.com",
      password: "admin@123",
    })
    .returning()
    .onConflictDoNothing();
  console.log(data);
};
//seed();
export default seed;
