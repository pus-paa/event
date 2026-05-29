import db from "@/config/db";
import { and, eq, sql } from "drizzle-orm";
import repository from "./repository";
import Resource, { GiftCategoryColumn } from "./resource";
import { gift, giftCategory  , giftAssignmentTable} from "./schema";
import { AssignGiftToInvitationInput } from "./validators";

export default class Gift {
	static async listCategories(params: {
		page?: number;
		limit?: number;
		id?: number;
		eventId?: number;
		createdBy?: number;
		name?: string;
	}) {
		const { page = 1, limit = 10 } = params;
		const offset = (page - 1) * limit;

		const whereClause = repository.buildGiftCategoryFilters(params);

		const baseQuery = db
			.select(repository.giftCategorySelectQuery)
			.from(giftCategory);

		const items = whereClause
			? await baseQuery.where(whereClause).limit(limit).offset(offset)
			: await baseQuery.limit(limit).offset(offset);

		const baseCountQuery = db
			.select({ count: sql<number>`count(*)` })
			.from(giftCategory);

		const [{ count }]: any = whereClause
			? await baseCountQuery.where(whereClause)
			: await baseCountQuery;

		return {
			items,
			page,
			totalItems: parseInt(count.toString(), 10),
			totalPages: Math.ceil(count / limit),
		};
	}

	static async listGifts(params: {
		page?: number;
		limit?: number;
		id?: number;
		eventId?: number;
		createdBy?: number;
		category?: string;
		name?: string;
	}) {
		const { page = 1, limit = 10 } = params;
		const offset = (page - 1) * limit;

		const whereClause = repository.buildGiftFilters(params);

		const baseQuery = db.select(repository.giftSelectQuery).from(gift);

		const items = whereClause
			? await baseQuery.where(whereClause).limit(limit).offset(offset)
			: await baseQuery.limit(limit).offset(offset);

		const baseCountQuery = db
			.select({ count: sql<number>`count(*)` })
			.from(gift);

		const [{ count }]: any = whereClause
			? await baseCountQuery.where(whereClause)
			: await baseCountQuery;

		return {
			items,
			page,
			totalItems: parseInt(count.toString(), 10),
			totalPages: Math.ceil(count / limit),
		};
	}

  static async createGiftcategory(input:any , userId:number ,eventId:number ){
    const result = await db.insert(giftCategory).values({
       ...input , 
      createdBy:userId ,
      eventId:eventId 
    }).returning() ;
    return result[0] ||null ; 

  }

	static async updateCategory(
		id: number,
		params: Partial<GiftCategoryColumn>,
	) {
		const result = await db
			.update(giftCategory)
			.set({ ...params })
			.where(eq(giftCategory.id, id))
			.returning();
		return result[0] || null;
	}

	static async findCategoryById(id: number) {
		const result = await db
			.select(repository.giftCategorySelectQuery)
			.from(giftCategory)
			.where(eq(giftCategory.id, id))
			.limit(1);
		return result[0] || null;
	}

	static async deleteCategory(id: number) {
		const result = await db
			.delete(giftCategory)
			.where(eq(giftCategory.id, id))
			.returning();
		return result[0] || null;
	}

	static async listCategoriesWithGifts(eventId: number) {
		const categories = await db
			.select(repository.giftCategorySelectQuery)
			.from(giftCategory)
			.where(eq(giftCategory.eventId, eventId));

		const gifts = await db
			.select(repository.giftSelectQuery)
			.from(gift)
			.where(eq(gift.eventId, eventId));

		return Resource.groupByCategory(
			categories ,
			gifts ,
		);
	}

  static async createGift(input:any , userId:number ,eventId:number ){
    const result = await db.insert(gift).values({
      ...input ,
      createdBy:userId ,
      eventId:eventId
    }).returning() ;
    return result[0] || null ;
  }
  static async updateGift(id:number , input:any ){
    const result = await db.update(gift).set({
      ...input ,
    }).where(eq(gift.id , id)).returning() ;
    return result[0] || null ;
  }
  static async findGiftbyId(giftId:number){
    const result = await db.select(repository.giftSelectQuery).from(gift).where(eq(gift.id , giftId)).limit(1) ;
    return result[0] || null ;
  }
  static async assignGiftToInvitation(assignValidationBody: AssignGiftToInvitationInput, giftId:number ,  assignedBy:number){
	 const result = await db.insert(giftAssignmentTable).values({
		 giftId:giftId ,
		...assignValidationBody , 
		assignedBy,
	 }).returning() ;
	 return result[0] || null ;
  }

  static async findGiftAssignmentById(assignmentId: number) {
	const result = await db
		.select()
		.from(giftAssignmentTable)
		.where(eq(giftAssignmentTable.id, assignmentId))
		.limit(1);
	return result[0] || null;
  }

  static async updateGiftAssignment(
	giftId: number,
	invitationId: number,
	params: Partial<{ totalCount: number }>,
  ) {
	const result = await db
		.update(giftAssignmentTable)
		.set({ ...params, updatedAt: new Date() })
		.where(
			and(
				eq(giftAssignmentTable.giftId, giftId),
				eq(giftAssignmentTable.invitationId, invitationId),
			),
		)
		.returning();
	return result[0] || null;
  }

  static async removeGiftAssignment(assignmentId:number){
	 const result = await db.delete(giftAssignmentTable).where(eq(giftAssignmentTable.id , assignmentId)).returning() ;
	 return result[0] || null ;
  }
}
