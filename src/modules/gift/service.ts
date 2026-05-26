import EventService from "@/modules/event/service";
import { throwForbiddenError, throwNotFoundError, throwUnauthorizedError } from "@/utils/error";
import logger from "@/config/logger";
import Model from "./model";
import Resource from "./resource";
import type {
	CreateGiftCategoryInput,
	UpdateGiftCategoryInput,
	CreateGiftInput,
	UpdateGiftInput,
} from "./validators";

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
      return throwUnauthorizedError("You do not have permission to create gifts.") ;
    }
    const data = await Model.createGift(input,userId,eventId) ;
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
      return  throwNotFoundError("Unable to Find Gift with the given ID");
    }

    if(gift.eventId ){
      const isAuthorized  = await EventService.checkAuthorized(gift.eventId,userId) ; 
      if(!isAuthorized ) {
        return throwUnauthorizedError("You do not have permisssion to update Gifts")
      }
      const data = await Model.updateGift(giftId , input) ;
      return Resource.toGiftJson(data) ;
    }
    else{
      return throwNotFoundError("Event") ;
    }

  }catch(err){
    throw err ;

  }
}
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
};
