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

  try{
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

export const TrainerProfileService = {
  createTrainerProfile,
  getAllTrainerProfiles
}