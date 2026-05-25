import Controller from "./controller";

const routes = [
	{
		method: "get",
		path: "event/:eventId/gift-categories",
		controller: Controller.getGiftCategories,
		authorization: true,
	},
	{
		method: "post",
		path: "event/:eventId/gift-categories",
		controller: Controller.createGiftCategory,
		authorization: true,
	},
	{
		method: "get",
		path: "event/:eventId/gift-categories-with-gifts",
		controller: Controller.getGiftCategoriesWithGifts,
		authorization: true,
	},
	{
		method: "patch",
		path: "gift-category/:categoryId",
		controller: Controller.updateGiftCategory,
		authorization: true,
	},
	{
		method: "delete",
		path: "gift-category/:categoryId",
		controller: Controller.deleteGiftCategory,
		authorization: true,
	},
	{
		method: "get",
		path: "event/:eventId/gifts",
		controller: Controller.listGifts,
		authorization: true,
	},
	{
		method: "post",
		path: "event/:eventId/gifts",
		controller: Controller.createGift,
		authorization: true,
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
	},
];

export default routes;
