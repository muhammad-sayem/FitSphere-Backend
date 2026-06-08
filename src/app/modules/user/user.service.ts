/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { UserRoles, UserStatus } from "../../../generated/prisma/client";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";

const getAllUsers = async (user: IRequestUser, query: QueryParams) => {
  const isAdmin = user.role === UserRoles.ADMIN;

  if (!isAdmin) {
    throw new AppError(status.FORBIDDEN, "Unauthorized");
  }

  try {
    const searchableFields = ["name", "email"];

    const filterableFields = ["status"];

    const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
    const { orderBy } = QueryBuilder.getSortOptions(query);
    const { searchConditions } = QueryBuilder.getSearchConditions(query, searchableFields);
    const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

    const baseConditions = {
      isDeleted: false,
      role: UserRoles.USER,
    };

    const andConditions: any[] = [baseConditions];

    if (query.name && typeof query.name === "string") {
      andConditions.push({
        name: {
          contains: query.name.trim(),
          mode: "insensitive",
        },
      });
    }

    if (searchConditions.length > 0) {
      andConditions.push({ OR: searchConditions });
    }

    if (Object.keys(filterConditions).length > 0) {
      andConditions.push(filterConditions);
    }

    const whereConditions = { AND: andConditions };

    const users = await prisma.user.findMany({
      where: whereConditions,
      orderBy,
      skip,
      take: limit,
    });

    const total = await prisma.user.count({
      where: whereConditions,
    });

    return {
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: users,
    };
  } catch (error) {
    console.log("Error fetching users: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch users");
  }
};

//* Change user status (active, banned  by admin only) *//
const changeUserStatus = async (userId: string, newStatus: UserStatus) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId
    }
  }
  );

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  try {
    const result = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: newStatus
      }
    });

    return result;
  }

  catch (error: any) {
    console.log("Error changing user status: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to change user status");
  }
}

export const UserService = {
  getAllUsers,
  changeUserStatus,
};