import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwNotFoundError } from "@/utils/error";

const getGiftCategories = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const eventId = Number(req.params.eventId);
	if (!eventId) throwNotFoundError("Event");
	const result =  await Service.listCategories(req.query, userId, eventId);
	return result;
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
	const  result = await Service.listCategoriesWithGifts(eventId, userId);
  return result ;

};

const updateGiftCategory = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const categoryId = Number(req.params.categoryId);
	if (!categoryId) throwNotFoundError("Gift Category");
	const result = await Service.updateCategory(categoryId, req.body, userId);
	return result;
};

const deleteGiftCategory = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const categoryId = Number(req.params.categoryId);
	if (!categoryId) throwNotFoundError("Gift Category");
	const result = await Service.deleteCategory(categoryId, userId);
	return result;
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

const assignGiftToInvitation = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const giftId = Number(req.params.giftId);
	if (!giftId) throwNotFoundError("Gift");
	const result = await Service.assignGiftToInvitation(req.body, giftId, userId);
	return result;
};

const updateAssignedGift = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const giftId = Number(req.params.giftId);
	if (!giftId) throwNotFoundError("Gift");
	const result = await Service.updateAssignedGift(req.body, giftId, userId);
	return result;
};

const removeAssignedGift = async (req: IAuthRequest) => {
	const userId = req.user?.id;
	const assignedId = Number(req.params.assignedId);
	if (!assignedId) throwNotFoundError("Gift Assignment");
	const result = await Service.removeAssignGift(assignedId, userId);
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
	assignGiftToInvitation,
	updateAssignedGift,
	removeAssignedGift,
};
