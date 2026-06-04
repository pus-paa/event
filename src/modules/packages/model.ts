import db from "@/config/db/index";
import { eq, and } from "drizzle-orm";
import schema, { packageItem } from "./schema";
import type { PackageInsert, PackageItemInsert } from "./resource";
import Repository from "./repository";

class PackageModel {
  static async create(params: PackageInsert) {
    const result = await db.insert(schema).values(params).returning();
    return result[0];
  }

  static async find(id: number) {
    const result = await db
      .select(Repository.vendorPackageSelectQuery)
      .from(schema)
      .where(eq(schema.id, id));
    return result[0] || null;
  }

  static async findWithItems(id: number) {
    const pkg = await this.find(id);
    if (!pkg) return null;

    const items = await this.getItemsByPackageId(id);
    console.log('This is the item ', items, pkg);
    return { ...pkg, items };
  }

  static async findByBusinessId(businessId: number) {
    const result =await  db
      .select()
      .from(schema)
      .leftJoin(packageItem, eq(packageItem.packageId, schema.id))
      .where(eq(schema.vendorId, businessId));
    const packagesMap: Record<number, any> = {};
    for( const row of result) {
      if(row.package_item?.id) {
        if(!packagesMap[row.vendor_package.id]) {
          packagesMap[row.vendor_package.id] = { ...row.vendor_package, items: [] };
        }
        packagesMap[row.vendor_package.id].items.push(row.package_item);
      } else {
        if(!packagesMap[row.vendor_package.id]) {
          packagesMap[row.vendor_package.id] = { ...row.vendor_package, items: [] };
        }
      }
    }

   
    const groupedValue =  Object.values(packagesMap);
    console.log('this is the grouped value ', groupedValue);
    return groupedValue; 

  }

  static async update(params: Partial<PackageInsert>, id: number) {
    const result = await db
      .update(schema)
      .set({ ...params, updatedAt: new Date() })
      .where(eq(schema.id, id))
      .returning();
    return result[0] || null;
  }

  static async delete(id: number) {
    return db.transaction(async (tx) => {
      // Delete all items first
      await tx.delete(packageItem).where(eq(packageItem.packageId, id));
      // Delete the package
      const result = await tx.delete(schema).where(eq(schema.id, id)).returning();
      return result[0] || null;
    });
  }

  static async createItem(params: PackageItemInsert) {
    const result = await db.insert(packageItem).values(params).returning();
    return result[0];
  }

  static async createItems(items: PackageItemInsert[]) {
    if (items.length === 0) return [];
    return db.insert(packageItem).values(items).returning();
  }

  static async getItemById(id: number) {
    const result = await db
      .select(Repository.packageItemSelectQuery)
      .from(packageItem)
      .where(eq(packageItem.id, id));
    return result[0] || null;
  }

  static async getItemsByPackageId(packageId: number) {
    return db
      .select(Repository.packageItemSelectQuery)
      .from(packageItem)
      .where(eq(packageItem.packageId, packageId));
  }

  static async updateItem(id: number, params: Partial<PackageItemInsert>) {
    const result = await db
      .update(packageItem)
      .set({ ...params, updatedAt: new Date() })
      .where(eq(packageItem.id, id))
      .returning();
    return result[0] || null;
  }

  static async deleteItem(id: number) {
    const result = await db
      .delete(packageItem)
      .where(eq(packageItem.id, id))
      .returning();
    return result[0] || null;
  }

  static async deleteItemsByPackageId(packageId: number) {
    return db
      .delete(packageItem)
      .where(eq(packageItem.packageId, packageId))
      .returning();
  }

  // Transactional operations
  static async createPackageWithItems(
    pkg: PackageInsert,
    items: Omit<PackageItemInsert, "packageId">[]
  ) {
    return db.transaction(async (tx) => {
      // Create the package
      const [createdPkg] = await tx.insert(schema).values(pkg).returning();

      if (!createdPkg) {
        throw new Error("Failed to create package");
      }

      // Create items if provided
      let createdItems: any[] = [];
      if (items && items.length > 0) {
        const itemsWithPackageId = items.map((item) => ({
          ...item,
          packageId: createdPkg.id,
        }));
        createdItems = await tx.insert(packageItem).values(itemsWithPackageId).returning();
      }

      return {
        ...createdPkg,
        items: createdItems,
      };
    });
  }

  static async updatePackageWithItems(
    packageId: number,
    pkgUpdate: Partial<PackageInsert>,
    items: Array<{ id?: number } & Partial<Omit<PackageItemInsert, "packageId">>>
  ) {
    return db.transaction(async (tx) => {
      // Update the package
      const [updatedPkg] = await tx
        .update(schema)
        .set({ ...pkgUpdate, updatedAt: new Date() })
        .where(eq(schema.id, packageId))
        .returning();

      if (!updatedPkg) {
        throw new Error("Failed to update package");
      }

      // Handle items
      const updatedItems: any[] = [];
      const newItems: PackageItemInsert[] = [];
      // db call under the loooop ? --- IGNORE ---
      for (const item of items) {
        if (item.id) {
          // Update existing item
          const { id, ...updateData } = item;
          const [updated] = await tx
            .update(packageItem)
            .set({ ...updateData, updatedAt: new Date() })
            .where(and(eq(packageItem.id, id!), eq(packageItem.packageId, packageId)))
            .returning();
          if (updated) updatedItems.push(updated);
        } else {
          // Create new item
          newItems.push({ ...item, packageId } as PackageItemInsert);
        }
      }

      // Batch insert new items
      let createdNewItems: any[] = [];
      if (newItems.length > 0) {
        createdNewItems = await tx.insert(packageItem).values(newItems).returning();
      }

      return {
        ...updatedPkg,
        items: [...updatedItems, ...createdNewItems],
      };
    });
  }


}

export default PackageModel;
