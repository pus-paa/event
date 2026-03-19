import db from "@/config/db/index";
import users from "@/modules/user/schema";
import { family } from "./schema";
import type { FamilyInsert } from "./resource";
import Repository from "./repository";
import { and, eq, isNotNull } from "drizzle-orm";
import {
  type AddMemberValidation,
  type UpdateMemberValidation,
} from "./validators";

class Family {
  static async create(params: FamilyInsert) {
    const result = await db.insert(family).values(params).returning();
    return result[0];
  }

  static async find(params: number) {
    const returnedFamily = await db
      .select(Repository.selectQuery)
      .from(family)
      .where(eq(family.id, params));

    return returnedFamily[0] || null;
  }

  static async update(params: Partial<FamilyInsert>, id: number) {
    const result = await db
      .update(family)
      .set({ ...params, updatedAt: new Date() } as any)
      .where(eq(family.id, id))
      .returning();
    return result[0] || null;
  }

  static async destroy(id: number) {
    const result = await db.delete(family).where(eq(family.id, id)).returning();
    return result;
  }

  static async destroyWithMembers(familyId: number) {
    return db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          familyId: null,
          relation: null,
          updatedAt: new Date(),
        })
        .where(eq(users.familyId, familyId));

      const deletedFamily = await tx
        .delete(family)
        .where(eq(family.id, familyId))
        .returning();

      return deletedFamily;
    });
  }

  static async addMemberIfUser(
    familyId: number,
    addedMemberId: number,
    params: AddMemberValidation["body"],
  ) {
    const payload: any = {
      familyId,
      relation: params.relation ?? null,
      foodPreference: params.foodPreference ?? null,
      updatedAt: new Date(),
    };

    const result = await db
      .update(users)
      .set(payload)
      .where(eq(users.id, addedMemberId))
      .returning();

    return result[0] || null;
  }

  static async getMembers(familyId: number) {
    return db
      .select(Repository.selectMemersQuery)
      .from(users)
      .where(eq(users.familyId, familyId));
  }

  static async getMember(familyId: number, memberId: number) {
    const result = await db
      .select(Repository.selectMemersQuery)
      .from(users)
      .where(and(eq(users.familyId, familyId), eq(users.id, memberId)));

    console.log(result);

    return result[0] || null;
  }

  static async updateMember(
    familyId: number,
    memberId: number,
    params: UpdateMemberValidation["body"],
  ) {
    const result = await db
      .update(users)
      .set(params)
      .where(and(eq(users.familyId, familyId), eq(users.id, memberId)))
      .returning();

    return result[0] || null;
  }

  static async removeMember(familyId: number, memberId: number) {
    const result = await db
      .update(users)
      .set({
        familyId: null,
        relation: null,
        updatedAt: new Date(),
      })
      .where(and(eq(users.familyId, familyId), eq(users.id, memberId)))
      .returning();

    return result[0] || null;
  }

  static async findIfUserHasFamily(userId: number) {
    const result = await db
      .select(Repository.selectMemersQuery)
      .from(users)
      .where(and(eq(users.id, userId), isNotNull(users.familyId)));

    return result[0] || null;
  }

  static async findIfMemberOfFamily(familyId: number, userId: number) {
    console.log(familyId, userId);
    const user = await db.select().from(users).where(eq(users.id, userId));

    console.log(user);
    const result = await db
      .select(Repository.selectMemersQuery)
      .from(users)
      .where(and(eq(users.familyId, familyId), eq(users.id, userId)));

    console.log(result);
    return result[0] || null;
  }

  static async findByUserId(userId: number) {
    const user = await db
      .select({ familyId: users.familyId, userid: users.id })
      .from(users)
      .where(eq(users.id, userId));

    if (!user[0] || !user[0].familyId) {
      return [];
    }

    const family = await this.find(user[0].familyId);

    return family;
  }
}

export default Family;
