import { z } from "zod";
import { VendorBusinessCategoryTypes } from "@/constant";

export const CreateBusinessSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  type: z.string().optional(),
  category: z.enum(VendorBusinessCategoryTypes).nonoptional(),
  avatar: z.string().optional(),
  cover: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  legal_document: z.string().optional(),
  description: z.string().optional(),
  price_starting_from: z.number().int().optional(),
  years_of_experience: z.number().int().optional(),
  team_size: z.number().int().optional(),
  service_area: z.string().optional(),
  contact_person_name: z.string().optional(),
  contact_phone: z.string().optional(),
  website_url: z.string().url().optional(),
  instagram_url: z.string().url().optional(),
  whatsapp_number: z.string().optional(),
  provides_home_service: z.boolean().optional(),
  travel_policy: z.string().optional(),
  cancellation_policy: z.string().optional(),
});

export const CreateVenueDetailSchema = z.object({
  venue_type: z.string().optional(),
  capacity: z.number().int().optional(),
  area_sqft: z.string().optional(),
  min_booking_hours: z.number().int().optional(),
  max_booking_hours: z.number().int().optional(),
  has_catering: z.boolean().optional(),
  has_av_equipment: z.boolean().optional(),
  is_outDoor: z.boolean().optional(),
  price_per_hour: z.number().int().optional(),
  parking: z.boolean().optional(),
  rooms_available: z.number().int().optional(),
  valet_available: z.boolean().optional(),
  alcohol_allowed: z.boolean().optional(),
  sound_limit_db: z.number().int().optional(),
});

export const CreateVendorServiceDetailSchema = z.object({
  artist_type: z.string().optional(),
  styles_specialized: z.string().optional(),
  max_bookings_per_day: z.number().int().optional(),
  advance_amount: z.number().int().optional(),
  businessesId: z.number().int().nonoptional(),
  uses_own_material: z.boolean().optional(),
  travel_charges: z.number().int().optional(),
  portfolio_link: z.string().optional(),
  available_for_destination: z.boolean().optional(),
});
export const CreateFullBusinessSchema = CreateBusinessSchema.extend({
  venue_detail: CreateVenueDetailSchema.optional(),
  artist_detail: CreateVendorServiceDetailSchema.optional(),
});
export const updateVenuevalidator = CreateVenueDetailSchema.partial();
export const updateVendorServiceDetail = CreateVendorServiceDetailSchema.partial();

export type CreateBusinessType = z.infer<typeof CreateBusinessSchema>;
export type UpdateVendorServiceDetail = z.infer<typeof updateVendorServiceDetail>;
export type UpdateVendrorVenueDetail = z.infer<typeof CreateVenueDetailSchema>;
export type CreateVenueDetailType = z.infer<typeof CreateVenueDetailSchema>;
export type CreateVendorServiceDetailType = z.infer<typeof CreateVendorServiceDetailSchema>;
export type CreateFullBusinessType = z.infer<typeof CreateFullBusinessSchema>;
