import EventService from "@/modules/event/service";
import {
	throwErrorOnValidation,
	throwForbiddenError,
	throwNotFoundError,
	throwUnauthorizedError,
} from "@/utils/error";
import logger from "@/config/logger";
import Model from "./model";
import Resource from "./resource";
import type {
	CreateGiftCategoryInput,
	UpdateGiftCategoryInput,
	CreateGiftInput,
	UpdateGiftInput,
	AssignGiftToInvitationInput,
	UpdateAssignGiftToInvitationInput,
} from "./validators";
import BudgetModel from "@/modules/budget/model";
import BudgetService from "@/modules/budget/service";

const listCategories = async (params: any, userId: number, eventId: number) => {
	try {
		const isAuthorized = await EventService.checkAuthorized(eventId, userId);
		if (!isAuthorized) {
			throwForbiddenError("You do not have permission to view gift categories.");
		}

		const page = params?.page ? Number(params.page) : undefined;
		const limit = params?.limit ? Number(params.limit) : undefined;

		const data = await Model.listCategories({
			...params,
			...(page ? { page } : {}),
			...(limit ? { limit } : {}),
			eventId,
		});

		return {
			...data,
			items: Resource.categoryCollection(data.items),
		};
	} catch (err: any) {
		logger.error("Error in Gift Category listing:", err);
		throw err;
	}
};

const listCategoriesWithGifts = async (eventId: number, userId: number) => {
	try {
		const isAuthorized = await EventService.checkAuthorized(eventId, userId);
		if (!isAuthorized) {
			throwForbiddenError("You do not have permission to view gift categories.");
		}
		return await Model.listCategoriesWithGifts(eventId);
	} catch (err: any) {
		logger.error("Error in Gift Category with gifts listing:", err);
		throw err;
	}
};

const listGifts = async (params: any, userId: number, eventId: number) => {
	try {
		const isAuthorized = await EventService.checkAuthorized(eventId, userId);
		if (!isAuthorized) {
			throwForbiddenError("You do not have permission to view gifts.");
		}

		const page = params?.page ? Number(params.page) : undefined;
		const limit = params?.limit ? Number(params.limit) : undefined;

		const data = await Model.listGifts({
			...params,
			...(page ? { page } : {}),
			...(limit ? { limit } : {}),
			eventId,
		});

		return {
			...data,
			items: Resource.giftCollection(data.items),
		};
	} catch (err: any) {
		logger.error("Error in Gift listing:", err);
		throw err;
	}
};

const createGiftcategory = async (
	input: CreateGiftCategoryInput,
	userId: number,
	eventId: number,
) => {
	try {
		const isAuthorized = await EventService.checkAuthorized(eventId, userId);
		if (!isAuthorized) {
			return throwForbiddenError("You do not have permission to create gift categories.");
		}
		const data = await Model.createGiftcategory(input, userId, eventId);
		return Resource.toCategoryJson(data);
	} catch (err: any) {
		logger.error("Error in Gift Category creation:", err);
		throw err;
	}
};

const updateCategory = async (
	id: number,
	input: UpdateGiftCategoryInput,
	userId: number,
) => {
	try {
		const category = await Model.findCategoryById(id);
		if (!category) throwNotFoundError("Gift Category");
			const categoryData = category as NonNullable<typeof category>;
			const eventId = categoryData.eventId;
			if (eventId == null) throwNotFoundError("Event");
			const eventIdValue = eventId as number;

			const isAuthorized = await EventService.checkAuthorized(
				eventIdValue,
				userId,
			);
		if (!isAuthorized) {
			throwForbiddenError("You do not have permission to update this category.");
		}

		const data = await Model.updateCategory(id, input);
		return Resource.toCategoryJson(data!);
	} catch (err: any) {
		logger.error("Error in Gift Category update:", err);
		throw err;
	}
};

const deleteCategory = async (id: number, userId: number) => {
	try {
		const category = await Model.findCategoryById(id);
		if (!category) throwNotFoundError("Gift Category");
			const categoryData = category as NonNullable<typeof category>;
			const eventId = categoryData.eventId;
			if (eventId == null) throwNotFoundError("Event");
			const eventIdValue = eventId as number;

			const isAuthorized = await EventService.checkAuthorized(
				eventIdValue,
				userId,
			);
		if (!isAuthorized) {
			throwForbiddenError("You do not have permission to delete this category.");
		}

		return await Model.deleteCategory(id);
	} catch (err: any) {
		logger.error("Error in Gift Category deletion:", err);
		throw err;
	}
};

const createGift = async(
	input: CreateGiftInput,
	userId: number,
	eventId: number,
)=>{
  try{
    const isAuthorized = await EventService.checkAuthorized(eventId,userId) ;
    if(!isAuthorized){
      throwUnauthorizedError("You do not have permission to create gifts.") ;
    }
    const data = await Model.createGift(input,userId,eventId) ;
		if(!data) throw new Error("Error creating gift") ;

		// Only create budget expense if the gift has a value
		const totalCost = input.count * (input.value || 0);
		if (totalCost > 0) {
			const budgetNote = `giftId:${data.id}`;

			await BudgetService.createOrGetCategoryAndAddExpense({
				amount: totalCost,
				categoryName: "Gift",
				expenseName: data.name,
				giftId: data.id,
				eventId,
				userId,
				notes: budgetNote,
			});
		}

    return Resource.toGiftJson(data) ;
  }catch(err){
    throw err ;
  }
}

const findGift = async(giftId:number)=>{
  try{
    const gift = await Model.findGiftbyId(giftId) ;
    if(!gift) throwNotFoundError("Gift") ;
    return gift ;
  }catch(err){
    throw err ;
  }
}

const updateGift = async (
	input: UpdateGiftInput,
	userId : number,
	giftId: number,
)=>{
  try{
    const gift = await Model.findGiftbyId(giftId) ;
    if(!gift){
      return throwNotFoundError("Unable to Find Gift with the given ID");
    }

    if(gift.eventId ){
      const isAuthorized  = await EventService.checkAuthorized(gift.eventId,userId) ;
      if(!isAuthorized ) {
        throwUnauthorizedError("You do not have permisssion to update Gifts")
      }

			// Check if count or value changed - need to update budget
			const oldTotalCost = (gift.count || 0) * (gift.value || 0);
			const newCount = input.count !== undefined ? input.count : gift.count;
			const newValue = input.value !== undefined ? input.value : gift.value;
			const newTotalCost = (newCount || 0) * (newValue || 0);

			// Update the gift first
      const data = await Model.updateGift(giftId , input) ;

			// Update or create budget expense if value/count changed
			if (newTotalCost !== oldTotalCost && newTotalCost > 0) {
				const budgetNote = `giftId:${giftId}`;
				await BudgetService.updateOrCreateGiftExpense({
					giftId,
					amount: newTotalCost,
					expenseName: data?.name || gift.name,
					categoryName: "Gift",
					eventId: gift.eventId,
					userId,
					notes: budgetNote,
				});
			}

      return Resource.toGiftJson(data) ;
    }
    else{
      throwNotFoundError("Event") ;
    }

  }catch(err){
    throw err ;

  }
}

const assignGiftToInvitation = async( input:AssignGiftToInvitationInput ,  giftId:number , assignedBy:number )=>{
	try{
		const gift = await Model.findGiftbyId(giftId) ;
		if(!gift){
			return throwNotFoundError("Unable to Find Gift with the given ID");
		}
		const isAuthorized  = await EventService.checkAuthorized(gift.eventId,assignedBy) ;
		if(!isAuthorized ) {
			throwUnauthorizedError("You do not have permisssion to assign Gifts")
		}

		const assignment = await Model.assignGiftToInvitation(input,giftId ,  assignedBy) ;

		return assignment ;

	}catch(err){
		throw err ;
	}
}

const updateAssignedGift = async (
	input: UpdateAssignGiftToInvitationInput,
	giftId: number,
	userId: number,
) => {
	try {
		const gift = await Model.findGiftbyId(giftId);
		if (!gift) {
			return throwNotFoundError("Unable to Find Gift with the given ID");
		}
		const isAuthorized = await EventService.checkAuthorized(gift.eventId, userId);
		if (!isAuthorized) {
			return throwUnauthorizedError("You do not have permisssion to update assigned Gifts");
		}
		if (!input.invitationId) {
			return throwErrorOnValidation("Invitation ID is required to update assignment");
		}

		const { invitationId, totalCount } = input;
		if (totalCount === undefined) {
			return throwErrorOnValidation("Nothing to update for assignment");
		}

		const data = await Model.updateGiftAssignment(giftId, invitationId, {
			totalCount,
		});
		if (!data) return throwNotFoundError("Gift Assignment");

		return data;
	} catch (err) {
		throw err;
	}
};

const removeAssignGift = async (assignmentId: number, userId: number) => {
	try {
		const assignment = await Model.findGiftAssignmentById(assignmentId);
		if (!assignment) throwNotFoundError("Gift Assignment");
		const assignmentData = assignment as NonNullable<typeof assignment>;
		const gift = await Model.findGiftbyId(assignmentData.giftId);
		if (!gift) throwNotFoundError("Gift");
		const giftData = gift as NonNullable<typeof gift>;

		const isAuthorized = await EventService.checkAuthorized(giftData.eventId, userId);
		if (!isAuthorized) {
			throwUnauthorizedError("You do not have permisssion to remove assigned Gifts");
		}

		const data = await Model.removeGiftAssignment(assignmentId);
		return data;
	} catch (err) {
		throw err;
	}
};

export default {
  createGiftcategory ,
	listCategories,
	listCategoriesWithGifts,
	listGifts,
	updateCategory,
	deleteCategory,
  createGift ,
  findGift ,
  updateGift ,
	assignGiftToInvitation,
	updateAssignedGift,
	removeAssignGift,
};
