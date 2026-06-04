import type { IAuthRequest } from "@/routes/index";
import Service from "./service";
import { throwErrorOnValidation } from "@/utils/error";

const create = async (req: IAuthRequest) => {
  try {
    const { body, user } = req;
    const data = await Service.create(body, user.id);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const get = async (req: IAuthRequest) => {
  try {
    const { params } = req;
    if (!params.id || isNaN(Number(params.id))) {
      throwErrorOnValidation("Invalid Package ID");
    }
    const data = await Service.get(Number(params.id));
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getByBusinessId = async (req: IAuthRequest) => {
  try {
    console.log('This is the businessId');
    const { params } = req;
    const businessId = Number(params.businessId);
    if (!businessId || isNaN(businessId)) {
      throwErrorOnValidation("Business ID is required");
    }
    const data = await Service.getByBusinessId(businessId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const update = async (req: IAuthRequest) => {
  try {
    const { params, body } = req;
    if (!params.id || isNaN(Number(params.id))) {
      throwErrorOnValidation("Invalid Package ID");
    }
    const data = await Service.update(Number(params.id), body, req.user.id);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deletePackage = async (req: IAuthRequest) => {
  try {
    const { params } = req;
    if (!params.id || isNaN(Number(params.id))) {
      throwErrorOnValidation("Invalid Package ID");
    }
    const data = await Service.remove(Number(params.id), req.user.id);
    return data;
  } catch (err: any) {
    throw err;
  }
};

// Package Item controllers
const addItem = async (req: IAuthRequest) => {
  try {
    const { params, body } = req;
    const packageId = Number(params.id);
    if (!packageId || isNaN(packageId)) {
      throwErrorOnValidation("Invalid Package ID");
    }
    const data = await Service.addItem(packageId, body);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getItem = async (req: IAuthRequest) => {
  try {
    const { params } = req;
    const packageId = Number(params.id);
    const itemId = Number(params.itemId);
    if (!packageId || isNaN(packageId)) {
      throwErrorOnValidation("Invalid Package ID");
    }
    if (!itemId || isNaN(itemId)) {
      throwErrorOnValidation("Invalid Item ID");
    }
    const data = await Service.getItem(packageId, itemId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getItems = async (req: IAuthRequest) => {
  try {
    const { params } = req;
    const packageId = Number(params.id);
    if (!packageId || isNaN(packageId)) {
      throwErrorOnValidation("Invalid Package ID");
    }
    const data = await Service.getItems(packageId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const updateItem = async (req: IAuthRequest) => {
  try {
    const { params, body } = req;
    const packageId = Number(params.id);
    const itemId = Number(params.itemId);
    if (!packageId || isNaN(packageId)) {
      throwErrorOnValidation("Invalid Package ID");
    }
    if (!itemId || isNaN(itemId)) {
      throwErrorOnValidation("Invalid Item ID");
    }
    const data = await Service.updateItem(packageId, itemId, body);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deleteItem = async (req: IAuthRequest) => {
  try {
    const { params } = req;
    const packageId = Number(params.id);
    const itemId = Number(params.itemId);
    if (!packageId || isNaN(packageId)) {
      throwErrorOnValidation("Invalid Package ID");
    }
    if (!itemId || isNaN(itemId)) {
      throwErrorOnValidation("Invalid Item ID");
    }
    const data = await Service.removeItem(packageId, itemId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

export default {
  create,
  get,
  getByBusinessId,
  update,
  deletePackage,
  addItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
};
