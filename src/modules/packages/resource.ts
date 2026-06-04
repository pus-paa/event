export interface PackageColumn {
  id: number;
  vendorId: number;
  totalAmount: string | null;
  title: string | null;
  currency: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageItemColumn {
  id: number;
  packageId: number | null;
  group: string | null;
  title: string | null;
  quantity: string | null;
  rate: string | null;
  amount: string | null;
  remark: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageWithItems extends PackageColumn {
  items: PackageItemColumn[];
}

export type PackageInsert = Omit<PackageColumn, "id" | "createdAt" | "updatedAt">;
export type PackageItemInsert = Omit<PackageItemColumn, "id" | "createdAt" | "updatedAt">;

export interface CreatePackageInput {
  businessId: number;
  title: string;
  totalAmount?: string;
  currency?: string;
  items?: Array<{
    group: string;
    title: string;
    quantity: string;
    rate: string;
    amount: string;
    remark?: number;
  }>;
}

export interface UpdatePackageInput {
  title?: string;
  totalAmount?: string;
  currency?: string;
  items?: Array<{
    id?: number;
    group?: string;
    title?: string;
    quantity?: string;
    rate?: string;
    amount?: string;
    remark?: number;
  }>;
}

class Resource {
  static toJson(pkg: PackageColumn): Partial<PackageColumn> | null {
    if (!pkg) return null;
    const data: Partial<PackageColumn> = {
      id: pkg.id,
      vendorId: pkg.vendorId,
      title: pkg.title,
      totalAmount: pkg.totalAmount,
      currency: pkg.currency,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
    return data;
  }

  static collection(packages: PackageColumn[]) {
    return packages.map(this.toJson);
  }

  static toJsonItem(item: PackageItemColumn): Partial<PackageItemColumn> | null {
    if (!item) return null;
    const data: Partial<PackageItemColumn> = {
      id: item.id,
      packageId: item.packageId,
      group: item.group,
      title: item.title,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      remark: item.remark,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    return data;
  }

  static collectionItems(items: PackageItemColumn[]) {
    return items.map(this.toJsonItem);
  }

  static toJsonWithItems(pkg: PackageWithItems): Partial<PackageWithItems> | null {
    if (!pkg) return null;
    const data: Partial<PackageWithItems> = {
      id: pkg.id,
      vendorId: pkg.vendorId,
      title: pkg.title,
      totalAmount: pkg.totalAmount,
      currency: pkg.currency,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      items: this.collectionItems(pkg.items) as PackageItemColumn[],
    };
    return data;
  }
}

export default Resource;
