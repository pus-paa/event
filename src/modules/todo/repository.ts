import user_repository from "@/modules/user/repository";
import todo from "./schema";

const selectQuery = {
  id: todo.id,
  eventId: todo.eventId,
  task: todo.task,
  doneByuserIds: todo.doneByuserIds,
  assignedTo: todo.assignedTo,
  assignedGroup: todo.assignedGroup,
  assignedUser: user_repository.selectQuery,
  createdBy: todo.createdBy,
  title: todo.title,
  parentId: todo.parentId,
  category: todo.category,
  dueDate: todo.dueDate,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
};

export default {
  selectQuery,
};
