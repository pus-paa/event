import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwNotFoundError } from "@/utils/error";

const getGiftCategories = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const eventId = Number(req.params.eventId);
	if (!eventId) throwNotFoundError("Event");
	return await Service.listCategories(req.query, userId, eventId);
};

const createGiftCategory = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const eventId = Number(req.params.eventId);
	if (!eventId) throwNotFoundError("Event");
	const result = await Service.createGiftcategory(req.body, userId, eventId);
	return result;
};

const getGiftCategoriesWithGifts = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const eventId = Number(req.params.eventId);
	// if (!eventId) throwNotFoundError("Event"); (validation will handle this )
	return await Service.listCategoriesWithGifts(eventId, userId);
};

const updateGiftCategory = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const categoryId = Number(req.params.categoryId);
	if (!categoryId) throwNotFoundError("Gift Category");
	return await Service.updateCategory(categoryId, req.body, userId);
};

const deleteGiftCategory = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const categoryId = Number(req.params.categoryId);
	if (!categoryId) throwNotFoundError("Gift Category");
	return await Service.deleteCategory(categoryId, userId);
};

const createGift = async(req:IAuthRequest)=>{
	const userId = req.user?.id; 
	const eventId = Number(req.params.eventId); 
	if (!eventId) throwNotFoundError("Event");
	const result = await Service.createGift(req.body, userId, eventId);
	return result; 
}
const updateGift = async(req:IAuthRequest)=>{
	const giftId = Number(req.params.giftId);  
	if (!giftId) throwNotFoundError("Gift");
	const result = await Service.updateGift(req.body, req.user?.id, giftId);
	return result; 
}

const findGift = async(req:IAuthRequest)=>{
	const giftId = Number(req.params.giftId);  
	if (!giftId) throwNotFoundError("Gift");
	const result = await Service.findGift(giftId);
	return result; 
}

const listGifts = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const eventId = Number(req.params.eventId);
	if (!eventId) throwNotFoundError("Event");
	const result = await Service.listGifts(req.query, userId, eventId);
	return result;
};
export default {
	getGiftCategories, 
  createGiftCategory  , 
	getGiftCategoriesWithGifts,
	updateGiftCategory,
	deleteGiftCategory,
  createGift   , 
  updateGift , 
	listGifts,
  findGift , 
};
