import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface"
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";
import { Prisma } from "../../../generated/prisma/client";

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

//* Get all reviews *//
const getAllReviews = async (query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const { orderBy } = QueryBuilder.getSortOptions(query);

  const searchableFields = ["user.name", "trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.ReviewWhereInput>(query, searchableFields);

  const filterableFields = ["rating", "trainer.avgRating", "trainer.experience"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const result = await prisma.review.findMany({
    where: {
      AND: [
        { OR: searchConditions.length > 0 ? searchConditions : undefined },
        { ...filterConditions }
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      trainer: {
        include: {
          user: true
        }
      }
    },
    skip,
    take: limit,
    orderBy
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit)
    }
  };
};

//* Get reviews by userID *//
// const getReviewsByUserId = async (user: IRequestUser) => {
//   const isUserExists = await prisma.user.findUnique({
//     where: {
//       id: user.userId
//     }
//   });

//   if (!isUserExists) {
//     throw new AppError(status.NOT_FOUND, "User not found");
//   }

//   try {
//     const result = await prisma.review.findMany({
//       where: {
//         userId: user.userId
//       },
//       include: {
//         trainer: {
//           include: {
//             user: {
//               select: {
//                 name: true,
//                 email: true,
//                 image: true
//               }
//             }
//           }
//         }
//       }
//     });

//     return result;
//   }

//   catch (error) {
//     console.log("Error fetching reviews by user ID: ", error);
//     throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch reviews");
//   }
// }

const getReviewsByUserId = async (user: IRequestUser, query: QueryParams) => {
  const filterableFields = ["rating", "trainer.avgRating"];
  const searchableFields = ["trainer.user.name", "trainer.user.email"];

  const paginationOptions = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.ReviewWhereInput>(query, searchableFields);
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const { page, limit, skip } = paginationOptions;

  const whereConditions: Prisma.ReviewWhereInput = {
    userId: user.userId,
    ...filterConditions,
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
  };

  const [result, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: orderBy as Prisma.ReviewOrderByWithRelationInput,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({
      where: whereConditions,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

//* Get reviews by trainer ID *//
const getReviewsByTrainerId = async (trainerId: string) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer not found");
  }

  try {
    const result = await prisma.review.findMany({
      where: {
        trainerId: trainerId
      }
    });
    return result;
  }

  catch (error) {
    console.log("Error fetching reviews by trainer ID: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch reviews");
  }
}

//* Update review by user (own) *//
const updateReview = async (user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
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

  try {
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



export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewsByTrainerId,
  updateReview,
  deleteReview
}