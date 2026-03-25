import Model from "./model";
import Resource from "./resource";
import logger from "@/config/logger";
import {
  todoValidationSchema,
  todoPopulateDefaultValidationSchema,
  todoUpdateValidationSchema,
} from "./validators";
import { DEFAULT_WEDDING_TODO_TEMPLATE } from "./constants";
import { throwErrorOnValidation } from "@/utils/error";

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

const findByEventId = async (eventId: number, params: any) => {
  try {
    const data = await Model.findAllAndCount({
      ...params,
      eventId,
    });

    return {
      ...data,
      items: Resource.collection(data.items),
    };
  } catch (err: any) {
    logger.error("Error in Todo findByEventId:", err);
    throw err;
  }
};

const create = async (input: any, userId: number) => {
  try {
    const parsed = todoValidationSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
    }
    const parsedData = parsed.data;

    if (!parsedData.eventId || Number.isNaN(Number(parsedData.eventId))) {
      throwErrorOnValidation("eventId is required");
    }

    const createInput = {
      ...parsedData,
      eventId: Number(parsedData.eventId),
      assigned_to: userId,
      ...(parsedData.dueDate && {
        dueDate: new Date(parsedData.dueDate),
      }),
    };

    const data = await Model.create(createInput as any);
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

const update = async (id: number, input: any) => {
  try {
    todoUpdateValidationSchema.parse(input);

    const existing = await Model.find({ id });
    if (!existing) throw new Error("Todo not found");

    const updateInput = {
      ...input,
      ...(input.dueDate && {
        dueDate: new Date(input.dueDate),
      }),
    };

    const data = await Model.update(updateInput, id);
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

const populateDefaultChecklist = async (eventId: number, input: any, userId?: number) => {
  try {
    if (!eventId || Number.isNaN(Number(eventId))) {
      throw new Error("Invalid eventId");
    }

    const parsed = todoPopulateDefaultValidationSchema.parse(input);
    const weddingDate = new Date(parsed.weddingDate);

    if (Number.isNaN(weddingDate.getTime())) {
      throw new Error("Invalid weddingDate");
    }

    const existing = await Model.findAllAndCount({ eventId: Number(eventId), page: 1, limit: 1 });
    if (existing.totalItems > 0) {
      return {
        count: 0,
        items: [],
        message: "Todos already exist for this event",
      };
    }

    const todoRows = DEFAULT_WEDDING_TODO_TEMPLATE.map((item) => {
      const dueDate = calculateDueDate(
        weddingDate,
        item.monthsBeforeWedding ?? 0,
        item.dayOffset ?? 0,
      );

      return {
        eventId: Number(eventId),
        title: item.title,
        task: item.task ?? item.title,
        isDone: false,
        assigned_to: userId ?? null,
        status: item.status ?? "pending",
        dueDate,
      };
    });

    const inserted = await Model.bulkCreate(todoRows as any);

    return {
      count: inserted.length,
      items: Resource.collection(inserted as any),
    };
  } catch (err: any) {
    logger.error("Error in Todo populateDefaultChecklist:", err);
    throw err;
  }
};

export default {
  list,
  findByEventId,
  create,
  find,
  update,
  populateDefaultChecklist,
};
