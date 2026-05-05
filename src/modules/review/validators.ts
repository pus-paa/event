import { z } from "zod";

export const CreatereviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    description: z.string().max(200).optional(),
  }),
  params: z.object({
    businessId: z.coerce.number().int().positive("Valid business ID required"),
  }),
  query: z.object({}).optional(),
});

export const UpdatereviewSchema = z.object({
  body: z
    .object({
      rating: z.number().int().min(1).max(5).optional(),
      description: z.string().max(200).optional(),
    })
    .strict(),
  params: z.object({
    id: z.coerce.number().int().positive("Valid review ID required"),
  }),
  query: z.object({}).optional(),
});

export const GetreviewListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().default(10),
      businessId: z.coerce.number().int().optional(),
      userId: z.coerce.number().int().optional(),
    })
    .optional(),
});

export const GetSinglereviewSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.coerce.number().int().positive("Valid review ID required"),
  }),
  query: z.object({}).optional(),
});

export const DeletereviewSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.coerce.number().int().positive("Valid review ID required"),
  }),
  query: z.object({}).optional(),
});

export type CreatereviewType = z.infer<typeof CreatereviewSchema>;
export type UpdatereviewType = z.infer<typeof UpdatereviewSchema>;
export type GetreviewListType = z.infer<typeof GetreviewListSchema>;
export type GetSinglereviewType = z.infer<typeof GetSinglereviewSchema>;
export type DeletereviewType = z.infer<typeof DeletereviewSchema>;
