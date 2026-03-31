import db from "@/config/db";
import { eq, sql, or } from "drizzle-orm";
import schema, { vendor_venue_schema, vendor_services_schema } from "./schema";
import repository from "./repository";
import { CreateBusinessType, CreateVenueDetailType } from "./validators";
import { VendorBusinessCategoryTypes } from "@/constant";

class BusinessModel {
  static async create(params: CreateBusinessType & { owner_id: number }) {
    const result = await db
      .insert(schema)
      .values(params as any)
      .returning();
    return result[0] ?? null;
  }
  static async createVenueDetail(params: CreateVenueDetailType & { business_id: number }) {
    const result = await db
      .insert(vendor_venue_schema)
      .values(params)
      .returning();
    return result[0] ?? null;
  }
  static async createvendorServices(params: any) {
    const result = await db
      .insert(vendor_services_schema)
      .values(params)
      .returning();
    return result[0] ?? null;
  }
  static async udpatevendorService(params: any, vendorServiceId: number) {
    const result = await db.update(vendor_services_schema).set(params).where(eq(vendor_services_schema.id, vendorServiceId)).returning();
    return result;
  }
  static async updatevenueservice(id: number, params: any) {
    const result = await db.update(vendor_venue_schema).set(params).where(eq(vendor_venue_schema.id, id)).returning();
    return result;
  }
  static async findAll(params: any,) {
    const { page = 1, limit = 10, userId } = params;
    const offset = (Number(page) - 1) * Number(limit);
    let condition = []
    if (userId) {
      condition.push(eq(schema.owner_id, userId));

    }

    const items = await db
      .select(repository.businessSelectQuery)
      .from(schema)
      .limit(Number(limit))
      .where(or(...condition))
      .offset(offset);

    const [{ count }]: any = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema);

    return {
      items,
      page: Number(page),
      totalItems: parseInt(count.toString(), 10),
      totalPages: Math.ceil(count / limit),
    };
  }


  static async findById(id: number) {
    const business = await db
      .select(repository.businessSelectQuery)
      .from(schema)
      .where(eq(schema.id, id));

    if (!business[0]) return null;
    if (business[0].category == VendorBusinessCategoryTypes.Venue) {
      const venues = await db
        .select(repository.venueSelectQuery)
        .from(vendor_venue_schema).leftJoin(
          schema,
          eq(vendor_venue_schema.business_id, schema.id)
        )
        .where(eq(vendor_venue_schema.business_id, id));
      return {
        business_information: business[0],
        venue_information: venues
      }
    } else {
      const services = await db
        .select(repository.vendor_services_select_query)
        .from(vendor_services_schema).leftJoin(
          schema,
          eq(vendor_services_schema.business_id, schema.id)
        )
        .where(eq(vendor_services_schema.business_id, id));
      return {
        business_information: business[0],
        services
      };
    }
  }

  static async update(id: number, params: Record<string, any>) {
    const result = await db
      .update(schema)
      .set({ ...params, updatedAt: new Date() } as any)
      .where(eq(schema.id, id))
      .returning();
    return result[0] ?? null;
  }

  static async destroy(id: number) {
    const result = await db
      .delete(schema)
      .where(eq(schema.id, id))
      .returning();
    return result;
  }

  static async listBusinessVenueDetail(businessId: number) {
    const rows = await db
      .select(repository.venueSelectQuery)
      .from(vendor_venue_schema).leftJoin(
        schema,
        eq(vendor_venue_schema.business_id, schema.id),
      )
      .where(eq(vendor_venue_schema.business_id, businessId));
    return rows;
  }
  static async listBusinessVendorService(businessId: number) {
    const rows = await db
      .select(repository.vendor_services_select_query)
      .from(vendor_services_schema).leftJoin(
        schema,
        eq(vendor_services_schema.business_id, schema.id),
      )
      .where(eq(vendor_services_schema.business_id, businessId));
    return rows;
  }
}

export default BusinessModel;
