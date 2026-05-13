import { ZodObject, ZodRawShape, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export type ZodFlattenedErrors<T = any> = ReturnType<ZodError<T>["flatten"]>;

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
    (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const error = result.error;

        const errors: ZodFlattenedErrors = error.flatten();

        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }

      req.body = result.data.body as Request["body"];
      req.query = result.data.query as Request["query"];
      req.params = result.data.params as Request["params"];

      next();
    };
