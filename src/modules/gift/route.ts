import { validate } from "@/middlewares/zodValidation";
import Controller from "./controller";
import {
	createGiftCategorySchema,
	updateGiftCategorySchema,
	createGiftSchema,
	updateGiftSchema,
} from "./validators";

const routes = [
	{
		method: "get",
		path: "gift-categories/event/:eventId",
		controller: Controller.getGiftCategories,
		authorization: true,
	},
	{
		method: "post",
		path: "gift-categories/event/:eventId",
		controller: Controller.createGiftCategory,
		authorization: true,
		validation: validate(createGiftCategorySchema),
	},
	{
		method: "get",
		path: "gift-categories/event/:eventId/gifts",
		controller: Controller.getGiftCategoriesWithGifts,
		authorization: true,
	},
	{
		method: "patch",
		path: "gift-category/:categoryId",
		controller: Controller.updateGiftCategory,
		authorization: true,
		validation: validate(updateGiftCategorySchema),
	},
	{
		method: "delete",
		path: "gift-category/:categoryId",
		controller: Controller.deleteGiftCategory,
		authorization: true,
	},
	{
		method: "get",
		path: "gift/event/:eventId",
		controller: Controller.listGifts,
		authorization: true,
	},
	{
		method: "post",
		path: "gift/event/:eventId",
		controller: Controller.createGift,
		authorization: true,
		validation: validate(createGiftSchema),
	},
	{
		method: "get",
		path: "gift/:giftId",
		controller: Controller.findGift,
		authorization: true,
	},
	{
		method: "patch",
		path: "gift/:giftId",
		controller: Controller.updateGift,
		authorization: true,
		validation: validate(updateGiftSchema),
	},
];

export default routes;
