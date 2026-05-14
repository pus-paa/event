import { event } from "@/config/db/schema";
import schema, {
  vendor_venue_schema,
  vendor_services_schema,
  event_vendorTable,
} from "./schema";

const businessSelectQuery = {
  id: schema.id,
  businessName: schema.businessName,
  category: schema.category,
  avatar: schema.avatar,
  cover: schema.cover,
  location: schema.location,
  city: schema.city,
  country: schema.country,
  legalDocument: schema.legalDocument,
  isVerified: schema.isVerified,
  ownerId: schema.ownerId,
  description: schema.description,
  priceStartingFrom: schema.priceStartingFrom,
  yearsOfExperience: schema.yearsOfExperience,
  teamSize: schema.teamSize,
  serviceArea: schema.serviceArea,
  contactPersonname: schema.contactPersonName,
  email: schema.email,
  contactPhone: schema.contactPhone,
  websiteUrl: schema.websiteUrl,
  instagramUrl: schema.instagramUrl,
  whatsappNumber: schema.whatsappNumber,
  providesHomeService: schema.providesHomeService,
  travelPolicy: schema.travelPolicy,
  cancellationPolicy: schema.cancellationPolicy,
  createdAt: schema.createdAt,
  updatedAt: schema.updatedAt,
};

const venueSelectQuery = {
  venueId: vendor_venue_schema.id,
  venueName: vendor_venue_schema.venueName,
  venueType: vendor_venue_schema.venueType,
  capacity: vendor_venue_schema.capacity,
  areaSqft: vendor_venue_schema.areaSqft,
  minBookingHours: vendor_venue_schema.minBookingHours,
  maxBookingHours: vendor_venue_schema.maxBookingHours,
  hasCatering: vendor_venue_schema.hasCatering,
  hasAvEquipment: vendor_venue_schema.hasAvEquipment,
  isOutDoor: vendor_venue_schema.isOutDoor,
  pricePerhour: vendor_venue_schema.pricePerhour,
  parking: vendor_venue_schema.parking,
  roomsAvailable: vendor_venue_schema.roomsAvailable,
  valetAvailable: vendor_venue_schema.valetAvailable,
  alcoholAllowed: vendor_venue_schema.alcoholAllowed,
  soundLimitDb: vendor_venue_schema.soundLimitDb,
  businessId: vendor_venue_schema.businessId,
  ownerId: businessSelectQuery.ownerId,
};
const vendorServiceselectQuery = {
  serviceId: vendor_services_schema.id,
  artistType: vendor_services_schema.artistType,
  ownerId: businessSelectQuery.ownerId,
  stylesSpecialized: vendor_services_schema.stylesSpecialized,
  maxBookingsPerDay: vendor_services_schema.maxBookingsPerDay,
  customizationAvailable: vendor_services_schema.customizationAvailable,
  advanceAmount: vendor_services_schema.advanceAmount,
  usesOwnMaterial: vendor_services_schema.usesOwnMaterial,
  travelCharges: vendor_services_schema.travelCharges,
  portfoliolink: vendor_services_schema.portfolioLink,
  availableForDestination: vendor_services_schema.availableForDestination,
  businessId: vendor_services_schema.businessId,
};

const selectWithBusiness = {
  businessInformation: businessSelectQuery,
  venueInformation: venueSelectQuery,
  vendorServicesinformation: vendorServiceselectQuery,
};

const eventVendorWithBusiness = {
  id: event_vendorTable.id,
  eventId: event_vendorTable.eventId,
  vendorBusinessid: event_vendorTable.vendorBusinessid,
  eventTitle: event.title,
  eventLocation: event.location,
  eventStartDateTime: event.startDateTime,
  eventEndDateTime: event.endDateTime,
  eventImage: event.imageUrl,
  businessName: businessSelectQuery.businessName,
};

const eventVendorSelectQuery = {
  id: event_vendorTable.id,
  eventId: event_vendorTable.eventId,
  vendorBusinessid: event_vendorTable.vendorBusinessid,
  acquiredBy: event_vendorTable.acquiredBy,
  estimatedGuest: event_vendorTable.estimatedGuest,
  status: event_vendorTable.status,
  notes: event_vendorTable.notes,
  createdAt: event_vendorTable.createdAt,
  updatedAt: event_vendorTable.updatedAt,
    
};
export default {
  selectWithBusiness,
  businessSelectQuery,
  venueSelectQuery,
  vendorServiceselectQuery,
  eventVendorWithBusiness,
  eventVendorSelectQuery,
};
