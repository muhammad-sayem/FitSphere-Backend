import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateReviewPayload } from "./review.interface"

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


export const TrainerReviewService = {
  createReview
}