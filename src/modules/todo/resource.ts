import UserResource from "@/modules/user/resource"
export interface TodoColumn {
  id?: number;
  eventId: number;
  task: string | null;
  doneByuserIds: number[];
  assignedTo: number | null;
  assignedGroup: string | null;
  title: string | null;
  assignedUser?: UserResource | null;
  parentId: number | null;
  category: string | null;
  dueDate: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

class Resource {
  static toJson(todo: Partial<TodoColumn>): Partial<TodoColumn> | null {
    if (!todo) return null;
    const data: Partial<TodoColumn> = {
      id: todo.id,
      eventId: todo.eventId,
      category: todo.category,
      task: todo.task,
      doneByuserIds: todo.doneByuserIds,
      assignedTo: todo.assignedTo,
      assignedGroup: todo.assignedGroup,
      assignedUser: todo.assignedUser,
      title: todo.title,
      parentId: todo.parentId,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
    return data;
  }

  static collection(todos: Partial<TodoColumn>[]) {
    return todos.map(this.toJson);
  }
}

export default Resource;
