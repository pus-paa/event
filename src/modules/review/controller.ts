import { type IAuthRequest } from "@/routes/index";
import * as Service from "./service";
import ReviewModel from "./model";
import { throwErrorOnValidation } from "@/utils/error";

const get = async (req: IAuthRequest) => {
  try {
    const { businessId, userId } = req.query;
    const data = await Service.listReviews({
      businessId: businessId ? Number(businessId) : undefined,
      userId: userId ? Number(userId) : undefined,
      ...req?.query,
    });
    return data;
  } catch (err: any) {
    throw err;
  }
};

const findOne = async (req: IAuthRequest) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return throwErrorOnValidation("Invalid review ID");
    }
    const data = await Service.findReviewById(Number(id));
    return data;
  } catch (err: any) {
    throw err;
  }
};

const create = async (req: IAuthRequest) => {
  try {
    const userId = req.user?.id;
    const { businessId } = req.params;

    if (!userId) {
      return throwErrorOnValidation("User not authenticated");
    }

    if (!businessId || isNaN(Number(businessId))) {
      return throwErrorOnValidation("Invalid business ID");
    }

    const data = await Service.createReview(
      req.body,
      Number(businessId),
      userId,
    );
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
      return throwErrorOnValidation("Invalid review ID");
    }

    const review = await ReviewModel.findReviewById(Number(id));
    if (!review) {
      return throwErrorOnValidation("Review not found");
    }

    const data = await Service.updateReview(Number(id), req.body, userId);
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
      return throwErrorOnValidation("Invalid review ID");
    }

    const review = await ReviewModel.findReviewById(Number(id));
    if (!review) {
      return throwErrorOnValidation("Review not found");
    }

    const data = await Service.deleteReview(Number(id), userId);
    return data;
  } catch (err: any) {
    throw err;
  }
};

export default {
  get,
  findOne,
  create,
  update,
  deleteModule,
};
