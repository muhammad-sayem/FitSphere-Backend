import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface"

//* Create a new review for a trainer (By user only) *//
const createReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: payload.trainerId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer not found");
  }

  const alreadyReviewed = await prisma.review.findFirst({
    where: {
      userId: user.userId,
      trainerId: payload.trainerId
    }
  });

  if (alreadyReviewed) {
    throw new AppError(status.BAD_REQUEST, "You have already reviewed this trainer");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: user.userId,
          ...payload
        }
      });

      const ratingSummary = await tx.review.aggregate({
        where: {
          trainerId: payload.trainerId
        },
        _avg: {
          rating: true
        }
      });

      await tx.trainerProfile.update({
        where: {
          id: payload.trainerId
        },
        data: {
          avgRating: ratingSummary._avg.rating ?? 0
        }
      });

      return review;
    });

    return result;
  }

  catch (error) {
    console.log("Error creating review: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create review");
  }

}

//* Update review by user (own) *//
const updateReview = async(user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: reviewId,
    }
  });

  if (!isReviewExists) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  const isOwnReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: user.userId
    }
  });

  if (!isOwnReview) {
    throw new AppError(status.FORBIDDEN, "You can't update others' reviews. You can only update your own reviews");
  }

  try {
    const result = await prisma.review.update({
      where: {
        id: reviewId
      },
      data: payload
    });
    return result;
  }
  catch (error) {
    console.log("Error updating review: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update review");
  }
}

//* Delete review by user (own) *//
const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const isReviewExists = await prisma.review.findFirst({
    where: {
      id: reviewId,
    }
  });

  if (!isReviewExists) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  };

  const isOwnReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId: user.userId
    }
  });

  if (!isOwnReview) {
    throw new AppError(status.FORBIDDEN, "You can't delete others' reviews. You can only delete your own reviews");
  }

  try{
    const result = await prisma.$transaction(async (tx) => {
      const deletedReview = await tx.review.delete({
        where: {
          id: reviewId
        }
      });

      const ratingSummary = await tx.review.aggregate({
        where: {
          trainerId: deletedReview.trainerId
        },
        _avg: {
          rating: true
        }
      });

      await tx.trainerProfile.update({
        where: {
          id: deletedReview.trainerId
        },
        data: {
          avgRating: ratingSummary._avg.rating ?? 0
        }
      });

      return deletedReview;
    });

    return result;
  }

  catch (error) {
    console.log("Error deleting review: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete review");
  }
}



export const TrainerReviewService = {
  createReview,
  updateReview,
  deleteReview
}