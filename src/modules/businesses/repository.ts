import schema, { vendor_venue_schema, vendor_services_schema } from "./schema";

const businessSelectQuery = {
  id: schema.id,
  business_name: schema.business_name,
  type: schema.type,
  category: schema.category,
  avatar: schema.avatar,
  cover: schema.cover,
  location: schema.location,
  city: schema.city,
  country: schema.country,
  legal_document: schema.legal_document,
  is_verified: schema.is_verified,
  owner_id: schema.owner_id,
  description: schema.description,
  price_starting_from: schema.price_starting_from,
  years_of_experience: schema.years_of_experience,
  team_size: schema.team_size,
  service_area: schema.service_area,
  contact_person_name: schema.contact_person_name,
  contact_phone: schema.contact_phone,
  website_url: schema.website_url,
  instagram_url: schema.instagram_url,
  whatsapp_number: schema.whatsapp_number,
  provides_home_service: schema.provides_home_service,
  travel_policy: schema.travel_policy,
  cancellation_policy: schema.cancellation_policy,
  createdAt: schema.createdAt,
  updatedAt: schema.updatedAt,
};


const venueSelectQuery = {
  venue_id: vendor_venue_schema.id,
  venue_name: vendor_venue_schema.venue_name,
  venue_type: vendor_venue_schema.venue_type,
  capacity: vendor_venue_schema.capacity,
  area_sqft: vendor_venue_schema.area_sqft,
  min_booking_hours: vendor_venue_schema.min_booking_hours,
  max_booking_hours: vendor_venue_schema.max_booking_hours,
  has_catering: vendor_venue_schema.has_catering,
  has_av_equipment: vendor_venue_schema.has_av_equipment,
  is_outDoor: vendor_venue_schema.is_outDoor,
  price_per_hour: vendor_venue_schema.price_per_hour,
  parking: vendor_venue_schema.parking,
  rooms_available: vendor_venue_schema.rooms_available,
  valet_available: vendor_venue_schema.valet_available,
  alcohol_allowed: vendor_venue_schema.alcohol_allowed,
  sound_limit_db: vendor_venue_schema.sound_limit_db,
  business_id: vendor_venue_schema.business_id,
  owner_id: businessSelectQuery.owner_id,
};
const vendor_services_select_query = {
  service_id: vendor_services_schema.id,
  artist_type: vendor_services_schema.artist_type,
  owner_id: businessSelectQuery.owner_id,
  styles_specialized: vendor_services_schema.styles_specialized,
  max_bookings_per_day: vendor_services_schema.max_bookings_per_day,
  advance_amount: vendor_services_schema.advance_amount,
  uses_own_material: vendor_services_schema.uses_own_material,
  travel_charges: vendor_services_schema.travel_charges,
  portfolio_link: vendor_services_schema.portfolio_link,
  available_for_destination: vendor_services_schema.available_for_destination,
  business_id: vendor_services_schema.business_id,
}

const selectWithBusiness = {
  business_information: businessSelectQuery,
  venue_information: venueSelectQuery,
  vendor_services_information: vendor_services_select_query
}



export default {
  selectWithBusiness,
  businessSelectQuery,
  venueSelectQuery,
  vendor_services_select_query
};
