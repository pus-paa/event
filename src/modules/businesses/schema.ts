import {
  tableName,
  businessesAttribute,
  vendorVenueTableName,
  venueAttribute,
  vendorServicesAttribute,
  vendorServiceTableName,
} from "./attributes";
import { pgTable } from "drizzle-orm/pg-core";

const schema = pgTable(tableName, businessesAttribute);
const vendor_venue_schema = pgTable(vendorVenueTableName, venueAttribute);
const vendor_services_schema = pgTable(vendorServiceTableName, vendorServicesAttribute);

export { vendor_venue_schema, vendor_services_schema };
export default schema;
