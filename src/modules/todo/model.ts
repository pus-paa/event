import db from "@/config/db";
import event from "@/modules/event/schema"
import { and, asc, eq, inArray, or, sql } from "drizzle-orm";
import user from "@/modules/user/schema"
import todo from "./schema";
import repository from "./repository";
import type { TodoColumn } from "./resource";
import { TodoInputType, UpdateTodoInputType } from "./validators";

class Todo {
  static async findAllAndCount(params: any) {
    const conditions = [] as any[];
    if (params?.eventId !== undefined) {
      conditions.push(eq(todo.eventId, Number(params.eventId)));
    }

    if (params?.assigned_to !== undefined) {
      conditions.push(eq(todo.assignedTo, Number(params.assigned_to)));
    }
    if (params?.parentId !== undefined) {
      conditions.push(eq(todo.parentId, Number(params.parentId)));
    }


    const whereClause = conditions.length ? and(...conditions) : undefined;
    const baseQuery = db
      .select(repository.selectQuery)
      .from(todo)
      .leftJoin(user, eq(todo.assignedTo, user.id))
      .orderBy(asc(todo.dueDate))
    const result = whereClause
      ? await baseQuery.where(whereClause)
      : await baseQuery

    const baseCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(todo);
    const [{ count }]: any = whereClause
      ? await baseCountQuery.where(whereClause)
      : await baseCountQuery;

    return {
      items: result,
      totalItems: parseInt(count.toString(), 10),
    };
  }

  static async find(params: Partial<TodoColumn>) {
    const conditions = [] as any[];
    if (params?.id !== undefined) {
      conditions.push(eq(todo.id, params.id));
    }
    if (params?.eventId != null) {
      conditions.push(eq(todo.eventId, params.eventId));
    }
    if (params?.assignedTo != null) {
      conditions.push(eq(todo.assignedTo, params.assignedTo));
    }
    if (params?.parentId != null) {
      conditions.push(eq(todo.parentId, params.parentId));
    }

    if (conditions.length === 0) return null;

    const result = await db
      .select(repository.selectQuery)
      .from(todo).leftJoin(user, eq(todo.assignedTo, user.id))
      .where(and(...conditions));

    return result[0] || null;
  }

  static async findByIds(todoIds: number[]) {
    if (!todoIds.length) return [];
    const result = await db
      .select({
        id: todo.id,
        doneByuserIds: todo.doneByuserIds,
      })
      .from(todo)
      .where(inArray(todo.id, todoIds));

    return result;
  }

  static async update(params: UpdateTodoInputType | undefined, id: number) {
    const result = await db
      .update(todo)
      .set({ ...params })
      .where(eq(todo.id, id))
      .returning();
    return result[0] || null;
  }

  static async create(params: TodoInputType["body"], userId: number) {
    const result = await db.insert(todo).values({ ...params, createdBy: userId }).returning();
    return result[0] || null;
  }

  static async bulkToGuest(create: TodoInputType[]) {
    if (!create?.length) return [];
    const result = await db.insert(todo).values(create as any).returning();
    return result;
  }

  static async delete(id: number) {
    const result = await db.delete(todo).where(eq(todo.id, id));
    return result;

  }

  static async getByEventId(eventId: number, userId: number, userGroup: string) {
    const result = await db
      .select(repository.selectQuery)
      .from(todo)
      .leftJoin(user, eq(user.id, todo.assignedTo))
      .leftJoin(event, eq(event.id, todo.eventId))
      .where(
        and(
          or(// For the parent and child relation
            eq(todo.eventId, eventId),
            eq(event.parentId, eventId)
          ),
          or(
            eq(todo.assignedGroup, userGroup),
            eq(todo.createdBy, userId),
            eq(todo.assignedTo, userId)
          )
        )
      )
      .orderBy(asc(todo.dueDate))
    return result;

  }
}

export default Todo;


