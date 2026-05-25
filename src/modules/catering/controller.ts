import { type IAuthRequest } from "@/routes/index";
import * as Service from "./service";
import CateringModel from "./model";
import { throwErrorOnValidation } from "@/utils/error";

const get = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }
    const data = await Service.listCaterings({ ...req?.query });
    return data;
  } catch (err: any) {
    throw err;
  }
};

const findOne = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid catering ID");
    }
    const data = await Service.findCateringById(Number(id));
    return data;
  } catch (err: any) {
    throw err;
  }
};

const create = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!eventId || isNaN(Number(eventId))) {
      return throwErrorOnValidation("Invalid event ID");
    }

    const data = await Service.createCatering(
      req.body,
      Number(eventId),
      userId,
    );


    //Create the expense for the category  in the already exist or newly created category 

    return data;
  } catch (err: any) {
    throw err;
  }
};

const update = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid catering ID");
    }

    const catering = await CateringModel.findCateringById(Number(id));
    if (!catering) {
      return throwErrorOnValidation("Catering not found");
    }

    const data = await Service.updateCatering(Number(id), req.body, userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deleteModule = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid catering ID");
    }

    const catering = await CateringModel.findCateringById(Number(id));
    if (!catering) {
      return throwErrorOnValidation("Catering not found");
    }

    const data = await Service.deleteCatering(Number(id), userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const createMenuItem = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const { cateringId } = req.params;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!cateringId || isNaN(Number(cateringId))) {
      return throwErrorOnValidation("Invalid catering ID");
    }

    const catering = await CateringModel.findCateringById(Number(cateringId));
    if (!catering) {
      return throwErrorOnValidation("Catering not found");
    }

    const data = await Service.createMenuItem(
      req.body,
      Number(cateringId),
      userId,
    );
    return data;
  } catch (err: any) {
    throw err;
  }
};

const getMenuItems = async (req: IAuthRequest) => {
  try {
    const { cateringId } = req.params;

    if (!cateringId || isNaN(Number(cateringId))) {
      return throwErrorOnValidation("Invalid catering ID");
    }

    const data = await Service.listMenuItems(Number(cateringId));
    return data;
  } catch (err: any) {
    throw err;
  }
};

const updateMenuItem = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid menu item ID");
    }

    const menuItem = await CateringModel.findMenuItemById(Number(id));
    if (!menuItem) {
      return throwErrorOnValidation("Menu item not found");
    }

    const catering = await CateringModel.findCateringById(menuItem.cateringId);
    if (!catering) {
      return throwErrorOnValidation("Catering not found");
    }

    const data = await Service.updateMenuItem(Number(id), req.body, userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const deleteMenuItem = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid menu item ID");
    }

    const menuItem = await CateringModel.findMenuItemById(Number(id));
    if (!menuItem) {
      return throwErrorOnValidation("Menu item not found");
    }

    const catering = await CateringModel.findCateringById(menuItem.cateringId);
    if (!catering) {
      return throwErrorOnValidation("Catering not found");
    }

    const data = await Service.deleteMenuItem(Number(id), userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

const createCateringExpense = async (req: IAuthRequest) => {
  try {
    const cateringId = Number(req.params.cateringId);
    const userId = req.user.id;
    const addCateringExpense = await Service.createCateringexpense(req.body, userId, cateringId)
    return addCateringExpense;
  }
  catch (err) {
    throw err;
  }
}
export default {
  get,
  createCateringExpense,
  findOne,
  create,
  update,
  deleteModule,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
