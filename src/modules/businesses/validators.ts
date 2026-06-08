import { z } from "zod";
import { VendorBusinessCategoryTypes } from "@/constant";

export const CreateBusinessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  type: z.string().optional(),
  category: z.enum(VendorBusinessCategoryTypes).nonoptional(),
  avatar: z.string().optional(),
  instagramUrl: z.string().optional(),
  cover: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  legalDocument: z.string().optional(),
  description: z.string().optional(),
  priceStartingFrom: z.number().int().optional(),
  yearsOfExperience: z.number().int().optional(),
  teamSize: z.number().int().optional(),
  serviceArea: z.string().optional(),
  email: z.string().check(z.email()).optional(),
  contactPersonName: z.string().optional(),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  whatsappNumber: z.string().optional(),
  providesHomeService: z.boolean().optional(),
  travelPolicy: z.string().optional(),
  cancellationPolicy: z.string().optional(),
});

export const CreateVenueDetailSchema = z.object({
  venueType: z.string().optional(),
  venueName: z.string().nonempty(),
  capacity: z.number().int().optional(),
  areaSqft: z.string().optional(),
  minBookingHours: z.number().int().optional(),
  maxBookingHours: z.number().int().optional(),
  hasCatering: z.boolean().optional(),
  hasAvEquipment: z.boolean().optional(),
  isOutDoor: z.boolean().optional(),
  pricePerhour: z.number().int().optional(),
  parking: z.preprocess((v) => typeof v === 'boolean' ? String(v) : v, z.string().optional()),
  roomsAvailable: z.number().int().optional(),
  valetAvailable: z.boolean().optional(),
  alcoholAllowed: z.boolean().optional(),
  soundLimitDb: z.number().int().optional(),
});

export const CreateVendorServiceDetailSchema = z.object({
  artistType: z.string().optional(),
  stylesSpecialized: z.string().optional(),
  maxBookingsPerDay: z.number().int().optional(),
  advanceAmount: z.number().int().optional(),
  businessId: z.number().int().nonoptional(),
  usesOwnMaterial: z.boolean().optional(),
  travelCharges: z.number().int().optional(),
  portfolioLink: z.string().optional(),
  availableForDestination: z.boolean().optional(),
});
export const CreateFullBusinessSchema = CreateBusinessSchema.extend({
  venueDetail: CreateVenueDetailSchema.optional(),
  artistDetail: CreateVendorServiceDetailSchema.optional(),
});
export const PostEventVendorSchema = z.object({
  vendorId: z.number().int().positive(),
  notes: z.string().max(200).optional(),
  status: z.string().max(15).optional(),
  estimatedGuest: z.number().int().nonnegative().optional(),
});
export const UpdateVendorSchema = z.object({
  notes: z.string().optional(),
  estimatedGuest: z.number().optional(),
  note: z.string().optional(),
});
export const updateVenuevalidator = CreateVenueDetailSchema.partial();
export const updateVendorServiceDetail =
  CreateVendorServiceDetailSchema.partial();

export type UpdateEventVendorType = z.infer<typeof UpdateVendorSchema>;
export type CreateBusinessType = z.infer<typeof CreateBusinessSchema>;
export type UpdateVendorServiceDetail = z.infer<
  typeof updateVendorServiceDetail
>;
export type UpdateVendrorVenueDetail = z.infer<typeof CreateVenueDetailSchema>;
export type CreateVenueDetailType = z.infer<typeof CreateVenueDetailSchema>;
export type CreateVendorServiceDetailType = z.infer<
  typeof CreateVendorServiceDetailSchema
>;
export type CreateFullBusinessType = z.infer<typeof CreateFullBusinessSchema>;
export type PostEventVendorType = z.infer<typeof PostEventVendorSchema>;
