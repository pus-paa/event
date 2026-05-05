import logger from "@/config/logger";
import Model from "./model";
import Resource from "./resource";
import {
  throwErrorOnValidation,
  throwForbiddenError,
  throwNotFoundError,
} from "@/utils/error";
import BusinessModel from "@/modules/businesses/model";
import {
  CreatereviewType,
  UpdatereviewType,
} from "./validators";

const isAuthorized = async (
  reviewId: number | null,
  userId: number,
): Promise<boolean> => {
  try {
    if (reviewId) {
      const review = await Model.findReviewById(reviewId);
      if (review) {
        if (review.userId === userId) {
          return true;
        }
        const business = await BusinessModel.findById(review.businessId);
        if (business && business.businessInformation?.ownerId === userId) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

const listReviews = async (params: any) => {
  try {
    const { page, limit, businessId, userId } = params;

    if (businessId) {
      await BusinessModel.findById(Number(businessId));
    }

    const reviews = await Model.listReviews({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      businessId: businessId ? Number(businessId) : undefined,
      userId: userId ? Number(userId) : undefined,
    });

    return {
      ...reviews,
      items: reviews.items.map((item) => Resource.toJson(item)),
    };
  } catch (error: any) {
    logger.error(`Error fetching reviews: ${error.message}`);
    throw error;
  }
};

const createReview = async (
  input: CreatereviewType["body"],
  businessId: number,
  userId: number,
) => {
  try {
    const authorized = await isAuthorized(null, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to add review",
      );
    }

    if (input.rating < 1 || input.rating > 5) {
      return throwErrorOnValidation("Rating must be between 1 and 5");
    }

    const business = await BusinessModel.findById(Number(businessId));
    if (!business) {
      return throwNotFoundError("Business not found");
    }

    const review = await Model.createReview({
      ...input,
      businessId: Number(businessId),
      userId,
    });

    if (!review) {
      return throwErrorOnValidation("Failed to create review");
    }

    logger.info(`Review created successfully: ${review.id}`);
    return Resource.toJson(review);
  } catch (error: any) {
    logger.error(`Error creating review: ${error.message}`);
    throw error;
  }
};

const findReviewById = async (reviewId: number) => {
  try {
    const review = await Model.findReviewById(reviewId);
    if (!review) {
      return throwNotFoundError("Review not found");
    }
    return Resource.toJson(review);
  } catch (error: any) {
    logger.error(`Error finding review: ${error.message}`);
    throw error;
  }
};

const updateReview = async (
  reviewId: number,
  input: UpdatereviewType["body"],
  userId: number,
) => {
  try {
    const review = await Model.findReviewById(reviewId);
    if (!review) {
      return throwNotFoundError("Review not found");
    }

    const authorized = await isAuthorized(reviewId, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to update this review",
      );
    }

    if (input.rating && (input.rating < 1 || input.rating > 5)) {
      return throwErrorOnValidation("Rating must be between 1 and 5");
    }

    const updatedReview = await Model.updateReview(reviewId, input);

    if (!updatedReview) {
      return throwErrorOnValidation("Failed to update review");
    }
    logger.info(`Review updated successfully: ${reviewId}`);
    return Resource.toJson(updatedReview);
  } catch (error: any) {
    logger.error(`Error updating review: ${error.message}`);
    throw error;
  }
};

const deleteReview = async (reviewId: number, userId: number) => {
  try {
    const review = await Model.findReviewById(reviewId);
    if (!review) {
      return throwNotFoundError("Review not found");
    }

    const authorized = await isAuthorized(reviewId, userId);
    if (!authorized) {
      return throwForbiddenError(
        "You do not have permission to delete this review",
      );
    }

    await Model.deleteReview(reviewId);
    logger.info(`Review deleted successfully: ${reviewId}`);
    return { id: reviewId, message: "Review deleted successfully" };
  } catch (error: any) {
    logger.error(`Error deleting review: ${error.message}`);
    throw error;
  }
};

export {
  listReviews,
  createReview,
  findReviewById,
  updateReview,
  deleteReview,
};
