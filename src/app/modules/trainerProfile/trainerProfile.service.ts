import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { ICreateTrainerProfile } from "./trainerProfile.interface"
import AppError from "../../errorHelpers/AppError";
import { Prisma, UserRoles } from "../../../generated/prisma/browser";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";

//* Create a trainer profile (By Trainer role) *//
const createTrainerProfile = async (user: IRequestUser, payload: ICreateTrainerProfile) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isTrainer = isUserExists.role === UserRoles.TRAINER;

  if (!isTrainer) {
    throw new AppError(status.FORBIDDEN, "Only trainers can create trainer profiles");
  }

  const isTutorProfileExists = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });

  if (isTutorProfileExists) {
    throw new AppError(status.CONFLICT, "Trainer profile already exists");
  }

  try {
    const result = await prisma.trainerProfile.create({
      data: {
        userId: user.userId,
        ...payload,
      }
    });

    return result;
  }

  catch (error) {
    console.log("Error creating trainer profile: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create trainer profile", (error as Error).stack);
  }

}

//* Get All trainer profiles *//
const getAllTrainerProfiles = async (query: QueryParams) => {
  // For pagination //
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  // For sorting //
  const trainerQuery = {
    ...query,
    sortBy: query.sortBy ?? "avgRating",
  };
  const { orderBy } = QueryBuilder.getSortOptions(trainerQuery);

  // For searching //
  const searchableFields = ["user.name", "user.email"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.TrainerProfileWhereInput>(query, searchableFields);

  // For filtering //
  const filterableFields = ["feePerHour", "experience", "avgRating", "user.status"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const whereConditions = [
    { isApproved: true },
    ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
    { ...filterConditions }
  ];

  const [trainerProfiles, total] = await Promise.all([
    prisma.trainerProfile.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            status: true,
            isDeleted: true
          }
        }
      }
    }),
    prisma.trainerProfile.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
    })
  ]);

  return {
    data: trainerProfiles,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

//* Get a trainer profile by trainer profile ID *// 
const getTrainerByTrainerProfileId = async (trainerProfileId: string) => {
  const result = await prisma.trainerProfile.findFirst({
    where: {
      id: trainerProfileId,
      isApproved: true
    },
    include: {
      user: true
    }
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Trainer profile not found");
  }

  return result;
}

//* Approval contorl for a trainer profile (Admin Only)*//
const approvalControlForTrainerProfile = async (user: IRequestUser, trainerProfileId: string, isApproved: boolean) => {
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
      id: trainerProfileId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer profile not found");
  }

  const isAdmin = user.role === UserRoles.ADMIN;

  if (!isAdmin) {
    throw new AppError(status.FORBIDDEN, "Only admins can approve or reject trainer profiles");
  }

  try {
    const result = await prisma.trainerProfile.update({
      where: {
        id: trainerProfileId
      },
      data: {
        isApproved
      }
    });

    return result;
  }
  catch (error) {
    console.log("Error updating trainer profile: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update trainer profile", (error as Error).stack);
  }
}

//* Delete a trainer profile by trainer profile ID (Admin Only) *//
const deleteTrainerProfile = async (user: IRequestUser, trainerProfileId: string) => {
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
      id: trainerProfileId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer profile not found");
  }

  const isAdmin = user.role === UserRoles.ADMIN;

  if (!isAdmin) {
    throw new AppError(status.FORBIDDEN, "Only admins can delete trainer profiles");
  }

  try {
    const result = await prisma.trainerProfile.delete({
      where: {
        id: trainerProfileId
      }
    });

    return result;
  }
  
  catch (error) {
    console.log("Error deleting trainer profile: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete trainer profile", (error as Error).stack);
  }
}


export const TrainerProfileService = {
  createTrainerProfile,
  getAllTrainerProfiles,
  getTrainerByTrainerProfileId,
  approvalControlForTrainerProfile,
  deleteTrainerProfile
}