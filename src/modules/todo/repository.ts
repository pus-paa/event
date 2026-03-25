import todo from "./schema";

const selectQuery = {
	id: todo.id,
	eventId: todo.eventId,
	task: todo.task,
	isDone: todo.isDone,
	assigned_to: todo.assigned_to,
	title: todo.title,
	parentId: todo.parentId,
	dueDate: todo.dueDate,
	status: todo.status,
	created_at: todo.created_at,
	updated_at: todo.updated_at,
};

export default {
	selectQuery,
};
