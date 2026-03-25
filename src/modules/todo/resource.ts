export interface TodoColumn {
	id?: number;
	eventId: number | null;
	task: string | null;
	isDone: boolean | null;
	assigned_to: number | null;
	title: string | null;
	parentId: number | null;
	dueDate: Date | string | null;
	status: string | null;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
}

class Resource {
	static toJson(todo: Partial<TodoColumn>): Partial<TodoColumn> | null {
		if (!todo) return null;
		const data: Partial<TodoColumn> = {
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
		return data;
	}

	static collection(todos: Partial<TodoColumn>[]) {
		return todos.map(this.toJson);
	}
}

export default Resource;
