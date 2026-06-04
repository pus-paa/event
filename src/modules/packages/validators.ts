import z from "zod";

// Package item validation schema - using string for numeric fields (Drizzle numeric type)
const packageItemSchema = z.object({
  id: z.number().optional(),
  group: z.string().min(1, "Group is required"),
  title: z.string().min(1, "Title is required"),
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  amount: z.string().min(1, "Amount is required"),
  remark: z.number().optional(),
});

// Create package validation with nested items
const createPackageValidation = z.object({
  body: z.object({
    businessId: z.number().int().positive("Business ID is required"),
    title: z.string().min(1, "Title is required"),
    totalAmount: z.string().optional(),
    currency: z.string().optional(),
    items: z.array(packageItemSchema).optional(),
  }),
});

// Update package item schema - allows partial updates
const updatePackageItemSchema = z.object({
  id: z.number().optional(),
  group: z.string().min(1, "Group is required").optional(),
  title: z.string().min(1, "Title is required").optional(),
  quantity: z.string().optional(),
  rate: z.string().optional(),
  amount: z.string().optional(),
  remark: z.number().optional(),
});

const updatePackageValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Package ID must be a positive number"),
  }),
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    totalAmount: z.string().optional(),
    currency: z.string().optional(),
    items: z.array(updatePackageItemSchema).optional(),
  }).refine((body) => Object.keys(body).length > 0, {
    message: "At least one field is required to update package",
  }),
});

const packageIdParamValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Package ID must be a positive number"),
  }),
});

// Business ID param validation for listing packages
const businessIdParamValidation = z.object({
  params: z.object({
    businessId: z.coerce.number().int().positive("Business ID must be a positive number"),
  }),
});

// Package and item ID param validation
const packageAndItemIdParamValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Package ID must be a positive number"),
    itemId: z.coerce.number().int().positive("Item ID must be a positive number"),
  }),
});

// Add single item to package validation
const addPackageItemValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Package ID must be a positive number"),
  }),
  body: packageItemSchema.omit({ id: true }),
});

// Update single item validation
const updatePackageItemValidation = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Package ID must be a positive number"),
    itemId: z.coerce.number().int().positive("Item ID must be a positive number"),
  }),
  body: updatePackageItemSchema.omit({ id: true }),
});

type CreatePackageValidation = z.infer<typeof createPackageValidation>;
type UpdatePackageValidation = z.infer<typeof updatePackageValidation>;
type PackageIdParamValidation = z.infer<typeof packageIdParamValidation>;
type BusinessIdParamValidation = z.infer<typeof businessIdParamValidation>;
type PackageAndItemIdParamValidation = z.infer<typeof packageAndItemIdParamValidation>;
type AddPackageItemValidation = z.infer<typeof addPackageItemValidation>;
type UpdatePackageItemValidation = z.infer<typeof updatePackageItemValidation>;

export {
  createPackageValidation,
  updatePackageValidation,
  packageIdParamValidation,
  businessIdParamValidation,
  packageAndItemIdParamValidation,
  addPackageItemValidation,
  updatePackageItemValidation,
};

export type {
  CreatePackageValidation,
  UpdatePackageValidation,
  PackageIdParamValidation,
  BusinessIdParamValidation,
  PackageAndItemIdParamValidation,
  AddPackageItemValidation,
  UpdatePackageItemValidation,
};
