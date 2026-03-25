
import Controller from "./controller";

const routes = [
	{
		method: "get",
		controller: Controller.get,
		path: "todo",
		authorization: true,

	},
	{
		method: "get",
		controller: Controller.getByEventId,
		path: "todo/event/:eventId",
		authorization: true,
	},
	{
		method: "post",
		controller: Controller.create,
		path: "todo",
		authorization: true,
	},
	{
		method: "get",
		controller: Controller.findOne,
		path: "todo/:id",
		authorization: true,
	},
	{
		method: "patch",
		controller: Controller.update,
		path: "todo/:id",
		authorization: true,
	}
    
	// {
	// 	method: "post",
	// 	controller: Controller.populateDefaultChecklist,
	// 	path: "todo/event/:eventId/populate-default",
	// 	authorization: true,
	// },
];

export default routes;
