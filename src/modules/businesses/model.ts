import db from "@/config/db";
import businessSchema from "@/modules/businesses/schema";
import eventSchema from "@/modules/event/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import EventRepository from "@/modules/event/repository";
import schema, {
  vendor_venue_schema,
  vendor_services_schema,
  event_vendorTable,
} from "./schema";
import repository from "./repository";
import {
  CreateBusinessType,
  CreateVenueDetailType,
  CreateVendorServiceDetailType,
} from "./validators";
import { VendorBusinessCategoryTypes } from "@/constant";
import event from "@/modules/event/schema";

class BusinessModel {
  static async create(params: CreateBusinessType & { ownerId: number }) {
    const result = await db
      .insert(schema)
      .values(params)
      .returning();
    return result[0] ?? null;
  }
  static async createVenueDetail(
    params: CreateVenueDetailType & { businessId: number },
  ) {
    const result = await db
      .insert(vendor_venue_schema)
      .values(params)
      .returning();
    return result[0] ?? null;
  }
  static async createvendorServices(params: CreateVendorServiceDetailType) {
    const result = await db
      .insert(vendor_services_schema)
      .values(params)
      .returning();
    return result[0] ?? null;
  }
  static async udpatevendorService(params: any, vendorServiceId: number) {
    const result = await db
      .update(vendor_services_schema)
      .set(params)
      .where(eq(vendor_services_schema.id, vendorServiceId))
      .returning();
    return result;
  }
  static async updatevenueservice(id: number, params: any) {
    const result = await db
      .update(vendor_venue_schema)
      .set(params)
      .where(eq(vendor_venue_schema.id, id))
      .returning();
    return result;
  }
  static async findAll(params: any) {
    const { page = 1, limit = 10, userId } = params;
    const offset = (Number(page) - 1) * Number(limit);
    let condition = [];
    if (!!userId) {
      condition.push(eq(schema.ownerId, userId));
    }

    const items = await db
      .select(repository.businessSelectQuery)
      .from(schema)
      //.limit(Number(limit))
      //.where(or(...condition))
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
        .from(vendor_venue_schema)
        .leftJoin(schema, eq(vendor_venue_schema.businessId, schema.id))
        .where(eq(vendor_venue_schema.businessId, id));
      return {
        businessInformation: business[0],
        venueInformation: venues,
      };
    } else {
      const services = await db
        .select(repository.vendorServiceselectQuery)
        .from(vendor_services_schema)
        .leftJoin(schema, eq(vendor_services_schema.businessId, schema.id))
        .where(eq(vendor_services_schema.businessId, id));
      return {
        businessInformation: business[0],
        vendorServicesInformation: services,
        ownerId: business[0].ownerId,
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
    const result = await db.delete(schema).where(eq(schema.id, id)).returning();
    return result;
  }

  static async listBusinessVenueDetail(businessId: number) {
    console.log(
      "This is the business id that is being searched in the thing ",
      businessId,
    );
    const rows = await db
      .select(repository.venueSelectQuery)
      .from(vendor_venue_schema)
      .leftJoin(schema, eq(vendor_venue_schema.businessId, schema.id))
      .where(eq(vendor_venue_schema.id, businessId));
    console.log(
      "this is the rowz in the data that is in the mnodel for the finfing the thing in the backend in thei",
      rows,
    );
    return rows;
  }
  static async listBusinessVendorService(businessId: number) {
    const rows = await db
      .select(repository.vendorServiceselectQuery)
      .from(vendor_services_schema)
      .leftJoin(schema, eq(vendor_services_schema.businessId, schema.id))
      .where(eq(vendor_services_schema.businessId, businessId));
    return rows;
  }

  static async findEventVendorLink(eventId: number, businessId: number) {
    const rows = await db
      .select(repository.eventVendorSelectQuery)
      .from(event_vendorTable)
      .where(
        and(
          eq(event_vendorTable.eventId, eventId),
          eq(event_vendorTable.vendorBusinessid, businessId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  static async createEventVendorLink(params: {
    event_id: number;
    vendor_buisness_id: number;
    acquired_by?: number;
    status?: string;
    notes?: string;
    estimated_guest?: number;
  }) {
    const result = await db
      .insert(event_vendorTable)
      .values({
        eventId: params.event_id,
        vendorBusinessid: params.vendor_buisness_id,
        acquiredBy: params.acquired_by,
        status: params.status,
        notes: params.notes,
        estimatedGuest: params.estimated_guest,
      })
      .returning();

    return result[0] ?? null;
  }
  static async updateEventVendor(
    params: any,
    eventId: number,
    businessId: number,
  ) {
    const result = await db
      .update(event_vendorTable)
      .set(params)
      .where(
        and(
          eq(event_vendorTable.vendorBusinessid, businessId),
          eq(event_vendorTable.eventId, eventId),
        ),
      )
      .returning();
    return result;
  }
  static async findEventVendorDetails(eventId: number, businessId?: number) {
    let conditions = [];
    conditions.push(eq(event_vendorTable.eventId, eventId));
    if (!!businessId) {
      conditions.push(eq(event_vendorTable.vendorBusinessid, businessId));
    }
    const result = await db
      .select(repository.businessSelectQuery)
      .from(event_vendorTable)
      .innerJoin(
        businessSchema,
        eq(event_vendorTable.vendorBusinessid, businessSchema.id),
      )
      .where(and(...conditions));
    if (result.length == 0) return null;
    return result;
  }
  static async findVendorEvent(vendorId: number) {
    const result = await db
      .select(EventRepository.baseSelectQuery)
      .from(event_vendorTable)
      .innerJoin(eventSchema, eq(event_vendorTable.eventId, eventSchema.id))
      .where(eq(event_vendorTable.vendorBusinessid, vendorId));
    if (!result || result.length == 0) {
      return null;
    }
    return result;
  }

  static async getEventOfMyBusiness(businessIds: number[], status: string) {
    const whereCondition = [];
    whereCondition.push(inArray(event_vendorTable.vendorBusinessid, businessIds));
    if (status) {
      whereCondition.push(eq(event_vendorTable.status, status));
    }
    const result = await db
      .select(repository.eventVendorWithBusiness)
      .from(event_vendorTable)
      .leftJoin(schema, eq(event_vendorTable.vendorBusinessid, schema.id))
      .leftJoin(event, eq(event_vendorTable.eventId, event.id))
      .where(and(...whereCondition))
      .orderBy(event.startDateTime);

    return result;
  }

  static async getMyBusinesses(userId: number) {
    const result = await db
      .select(repository.businessSelectQuery)
      .from(schema)
      .where(eq(schema.ownerId, userId));

    return result;
  }
}

export default BusinessModel;
