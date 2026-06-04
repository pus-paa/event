import vendorPackage, { packageItem, eventPackageTable } from "./schema"

export const vendorPackageSelectQuery = {
  id: vendorPackage.id,
  vendorId: vendorPackage.vendorId,
  totalAmount: vendorPackage.totalAmount,
  title: vendorPackage.title,
  currency: vendorPackage.currency,
  createdAt: vendorPackage.createdAt,
  updatedAt: vendorPackage.updatedAt,
}

export const packageItemSelectQuery = {
  id: packageItem.id,
  packageId: packageItem.packageId,
  group: packageItem.group,
  title: packageItem.title,
  quantity: packageItem.quantity,
  rate: packageItem.rate,
  amount: packageItem.amount,
  remark: packageItem.remark,
  createdAt: packageItem.createdAt,
  updatedAt: packageItem.updatedAt,
}

export const eventPackageSelectQuery = {
  id: eventPackageTable.id,
  eventId: eventPackageTable.eventId,
  packageVendor: eventPackageTable.packageVendor,
  packageGroup: eventPackageTable.packageGroup,
  price: eventPackageTable.price,
  quantity: eventPackageTable.quantity,
  amount: eventPackageTable.amount,
  createdAt: eventPackageTable.createdAt,
  updatedAt: eventPackageTable.updatedAt
}

export default {
  vendorPackageSelectQuery,
  packageItemSelectQuery,
  eventPackageSelectQuery
}
