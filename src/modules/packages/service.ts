import logger from "@/config/logger";
import Model from "./model";
import Resource from "./resource";
import { throwNotFoundError } from "@/utils/error";
import type {
  CreatePackageValidation,
  UpdatePackageValidation,
  AddPackageItemValidation,
  UpdatePackageItemValidation,
} from "./validators";
import type { PackageWithItems, PackageItemColumn } from "./resource";

const create = async (input: CreatePackageValidation["body"], _userId: number) => {
  try {
    const { businessId, title, totalAmount, currency, items } = input;

    // Prepare package data
    const pkgData = {
      vendorId: businessId,
      title: title || null,
      totalAmount: totalAmount || null,
      currency: currency || null,
    };

    const itemsData = items?.map((item) => ({
      group: item.group,
      title: item.title,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      remark: item.remark ?? null,
    })) || [];

    const result = await Model.createPackageWithItems(pkgData, itemsData);

    return Resource.toJsonWithItems(result as PackageWithItems);
  } catch (err: any) {
    logger.error("Error in Package creation:", err);
    throw err;
  }
};

const get = async (id: number) => {
  try {
    const result = await Model.findWithItems(id);
    if (!result) {
      return throwNotFoundError("Package");
    }

    return Resource.toJsonWithItems(result as PackageWithItems);
  } catch (err: any) {
    logger.error("Error in Package fetch:", err);
    throw err;
  }
};

const getByBusinessId = async (businessId: number) => {
  try {
    const result = await Model.findByBusinessId(businessId);
    return Resource.collection(result);
  } catch (err: any) {
    logger.error("Error in fetching packages by business:", err);
    throw err;
  }
};

const update = async (
  packageId: number,
  input: UpdatePackageValidation["body"],
  _userId: number
) => {
  try {
    // Check if package exists
    const existing = await Model.find(packageId);
    if (!existing) {
      return throwNotFoundError("Package");
    }

    const { title, totalAmount, currency, items } = input;

    // Prepare package update data
    const pkgUpdate: any = {};
    if (title !== undefined) pkgUpdate.title = title;
    if (totalAmount !== undefined) pkgUpdate.totalAmount = totalAmount;
    if (currency !== undefined) pkgUpdate.currency = currency;

    // Handle items update if provided
    let result;
    if (items && items.length > 0) {
      result = await Model.updatePackageWithItems(packageId, pkgUpdate, items);
    } else {
      // Just update package without items
      const updatedPkg = await Model.update(pkgUpdate, packageId);
      const pkgItems = await Model.getItemsByPackageId(packageId);
      result = { ...updatedPkg!, items: pkgItems };
    }

    return Resource.toJsonWithItems(result as PackageWithItems);
  } catch (err: any) {
    logger.error("Error in Package update:", err);
    throw err;
  }
};

const remove = async (packageId: number, _userId: number) => {
  try {
    const existing = await Model.find(packageId);
    if (!existing) {
      return throwNotFoundError("Package");
    }

    await Model.delete(packageId);
    return { message: "Package deleted successfully" };
  } catch (err: any) {
    logger.error("Error in Package deletion:", err);
    throw err;
  }
};

const addItem = async (
  packageId: number,
  input: AddPackageItemValidation["body"]
) => {
  try {
    // Check if package exists
    const existing = await Model.find(packageId);
    if (!existing) {
      return throwNotFoundError("Package");
    }

    const itemData = {
      packageId,
      group: input.group,
      title: input.title,
      quantity: input.quantity,
      rate: input.rate,
      amount: input.amount,
      remark: input.remark ?? null,
    };

    const result = await Model.createItem(itemData);
    return result ? Resource.toJsonItem(result) : null;
  } catch (err: any) {
    logger.error("Error in Package item creation:", err);
    throw err;
  }
};

const getItem = async (packageId: number, itemId: number) => {
  try {
    const item = await Model.getItemById(itemId);
    if (!item || item.packageId !== packageId) {
      return throwNotFoundError("Package item");
    }

    return Resource.toJsonItem(item);
  } catch (err: any) {
    logger.error("Error in Package item fetch:", err);
    throw err;
  }
};

const getItems = async (packageId: number) => {
  try {
    // Check if package exists
    const existing = await Model.find(packageId);
    if (!existing) {
      return throwNotFoundError("Package");
    }

    const items = await Model.getItemsByPackageId(packageId);
    return Resource.collectionItems(items as PackageItemColumn[]);
  } catch (err: any) {
    logger.error("Error in fetching package items:", err);
    throw err;
  }
};

const updateItem = async (
  packageId: number,
  itemId: number,
  input: UpdatePackageItemValidation["body"]
) => {
  try {
    // Check if item exists and belongs to the package
    const existing = await Model.getItemById(itemId);
    if (!existing || existing.packageId !== packageId) {
      return throwNotFoundError("Package item");
    }

    const updateData: any = {};
    if (input.group !== undefined) updateData.group = input.group;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.rate !== undefined) updateData.rate = input.rate;
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.remark !== undefined) updateData.remark = input.remark;

    const result = await Model.updateItem(itemId, updateData);
    return result ? Resource.toJsonItem(result) : null;
  } catch (err: any) {
    logger.error("Error in Package item update:", err);
    throw err;
  }
};

const removeItem = async (packageId: number, itemId: number) => {
  try {
    // Check if item exists and belongs to the package
    const existing = await Model.getItemById(itemId);
    if (!existing || existing.packageId !== packageId) {
      return throwNotFoundError("Package item");
    }

    await Model.deleteItem(itemId);
    return { message: "Package item deleted successfully" };
  } catch (err: any) {
    logger.error("Error in Package item deletion:", err);
    throw err;
  }
};

export default {
  create,
  get,
  getByBusinessId,
  update,
  remove,
  addItem,
  getItem,
  getItems,
  updateItem,
  removeItem,
};
