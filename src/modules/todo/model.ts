import db from "@/config/db";
import { and, desc, eq, sql } from "drizzle-orm";
import todo from "./schema";
import repository from "./repository";
import type { TodoColumn } from "./resource";

class Todo {
	static async findAllAndCount(params: any) {
		const page = Math.max(1, Number(params?.page) || 1);
		const limit = Math.max(1, Number(params?.limit) || 10);
		const offset = (page - 1) * limit;

		const conditions = [] as any[];
		if (params?.eventId !== undefined) {
			conditions.push(eq(todo.eventId, Number(params.eventId)));
		}

		if (params?.assigned_to !== undefined) {
			conditions.push(eq(todo.assigned_to, Number(params.assigned_to)));
		}
		if (params?.parentId !== undefined) {
			conditions.push(eq(todo.parentId, Number(params.parentId)));
		}
		if (params?.status !== undefined) {
			conditions.push(eq(todo.status, params.status));
		}
		if (params?.isDone !== undefined) {
			const isDoneValue =
				typeof params.isDone === "string"
					? params.isDone === "true"
					: Boolean(params.isDone);
			conditions.push(eq(todo.isDone, isDoneValue));
		}

		const whereClause = conditions.length ? and(...conditions) : undefined;

		const baseQuery = db.select(repository.selectQuery).from(todo);
		const result = whereClause
			? await baseQuery.where(whereClause).orderBy(desc(todo.id)).limit(limit).offset(offset)
			: await baseQuery.orderBy(desc(todo.id)).limit(limit).offset(offset);

		const baseCountQuery = db
			.select({ count: sql<number>`count(*)` })
			.from(todo);
		const [{ count }]: any = whereClause
			? await baseCountQuery.where(whereClause)
			: await baseCountQuery;

		return {
			items: result,
			page,
			totalItems: parseInt(count.toString(), 10),
			totalPages: Math.ceil(count / limit),
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

		if (params?.assigned_to != null) {
			conditions.push(eq(todo.assigned_to, params.assigned_to));
		}
		if (params?.parentId != null) {
			conditions.push(eq(todo.parentId, params.parentId));
		}

		if (conditions.length === 0) return null;

		const result = await db
			.select()
			.from(todo)
			.where(and(...conditions));

		return result[0] || null;
	}

	static async update(params: Partial<TodoColumn>, id: number) {
		const result = await db
			.update(todo)
			.set({ ...params } as any)
			.where(eq(todo.id, id))
			.returning();
		return result[0] || null;
	}

	static async create(params: Partial<TodoColumn>) {
		const result = await db.insert(todo).values(params as any).returning();
		return result[0] || null;
	}

	static async bulkCreate(params: Partial<TodoColumn>[]) {
		if (!params?.length) return [];
		const result = await db.insert(todo).values(params as any).returning();
		return result;
	}
}

export default Todo;


