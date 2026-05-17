import Model from "./model";
import Eventservice from "@/modules/event/service"

import Resource from "./resource";
import logger from "@/config/logger";
import {
  UpdateTodoInputType,
  TodoInputType,
  BulkTodoType,
} from "./validators";
import { throwNotFoundError } from "@/utils/error";

const list = async (params: any) => {
  try {
    const data = await Model.findAllAndCount({ ...params });
    return {
      ...data,
      items: Resource.collection(data.items),
    };
  } catch (err: any) {
    logger.error("Error in Todo listing:", err);
    throw err;
  }
};

const findByEventId = async (eventId: number, userId: number) => {
  try {
    //Get the invitation for the eventId given the group and the userId
    const isOrganizer = await Eventservice.checkAuthorized(eventId, userId);
    const role = isOrganizer ? "Planning Committee" : "Guest"


    const data = await Model.getByEventId(eventId, userId, role);

    return data;

  } catch (err: any) {
    logger.error("Error in Todo findByEventId:", err);
    throw err;
  }
};

const create = async (input: TodoInputType["body"], userId: number) => {
  try {

    const data = await Model.create(input, userId);
    if (!data) throw new Error("Todo creation failed");

    return Resource.toJson(data);
  } catch (err: any) {
    logger.error("Error in Todo create:", err);
    throw err;
  }
};

const find = async (id: number) => {
  try {
    const data = await Model.find({ id });
    if (!data) throw new Error("Todo not found");

    return Resource.toJson(data);
  } catch (err: any) {
    logger.error("Error in Todo finding:", err);
    throw err;
  }
};

const update = async (id: number, input: UpdateTodoInputType) => {
  try {

    const existing = await Model.find({ id });
    if (!existing) throw new Error("Todo not found");



    const data = await Model.update(input ?? undefined, id);
    if (!data) throw new Error("Todo not found or update failed");
    return Resource.toJson(data);
  } catch (err: any) {
    logger.error("Error in Todo update:", err);
    throw err;
  }
};

const calculateDueDate = (
  weddingDate: Date,
  monthsBeforeWedding = 0,
  dayOffset = 0,
) => {
  const dueDate = new Date(weddingDate);
  if (monthsBeforeWedding > 0) {
    dueDate.setMonth(dueDate.getMonth() - monthsBeforeWedding);
  }
  if (dayOffset !== 0) {
    dueDate.setDate(dueDate.getDate() + dayOffset);
  }
  return dueDate;
};


const deleteTodo = async (id: number) => {
  try {
    const exist = find(id);
    if (!exist) {
      throwNotFoundError("Todo with the id was not found ")

    }
    const deleted_data = await Model.delete(id);
    return deleted_data;
  }
  catch (err) {
    throw err;

  }
}
const bulkUpdate = async (
  body: BulkTodoType
  ,
  userId: number
) => {
  const parsedList = body?.todos;
  try {
    if (!parsedList.length) {
      return {
        completed: [],
        incompleted: [],
      };
    }
    const todoIds = [...new Set(parsedList.map((item) => item.todoId))];
    const existingTodos = await Model.findByIds(todoIds);

    const todoMap = new Map(existingTodos.map((todo) => [todo.id, todo]));

    await Promise.all(
      parsedList.map(async (item) => {
        const existing = todoMap.get(item.todoId);
        if (!existing) return;

        const currentDoneBy = Array.isArray(existing.doneByuserIds)
          ? existing.doneByuserIds
          : [];

        const normalizedUserId = Number(userId);
        const nextDoneBy = item.isDone ?? currentDoneBy.push(userId)
          ? currentDoneBy.includes(normalizedUserId)
            ? currentDoneBy
            : [...currentDoneBy, normalizedUserId]
          : currentDoneBy.filter((id) => id !== normalizedUserId);
        //TODO: fix this 
        await Model.update({ doneByuserIds: nextDoneBy }, item.todoId);
      })
    );

    const toComplete = parsedList.filter((u) => u.isDone).map((v) => v.todoId);
    const toUncomplete = parsedList.filter((u) => u.isDone === false).map((u) => u.todoId);
    return {
      completed: toComplete,
      incompleted: toUncomplete
    }

  } catch (err) {
    throw err;

  }
}

export default {
  bulkUpdate,
  list,
  deleteTodo,
  findByEventId,
  create,
  find,
  update,
};
