/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";
import { Prisma } from "../../../generated/prisma/browser";
import { BookingStatus } from "../../../generated/prisma/enums";
import { ICreateSlotPayload, IUpdateSlotPayload } from "./slot.interface";

//* Create a new slot for a trainer (by trainer only) *//
// const createSlot = async (user: IRequestUser, payload: ICreateSlotPayload) => {
//   const isTrainer = await prisma.trainerProfile.findUnique({
//     where: {
//       userId: user.userId
//     }
//   });

//   if (!isTrainer) {
//     throw new Error("Only trainers can create slots");
//   }

//   try {
//     const { date, startTime, endTime } = payload;

//     const formattedStartTime = startTime.trim();
//     const formattedEndTime = endTime.trim();

//     if (formattedStartTime > formattedEndTime) {
//       throw new AppError(status.BAD_REQUEST, "Start time must be before end time");
//     }

//     const startOfDay = new Date(date);
//     startOfDay.setUTCHours(0, 0, 0, 0);

//     const endOfDay = new Date(date);
//     endOfDay.setUTCHours(23, 59, 59, 999);

//     const isSlotAlreadyCreated = await prisma.slot.findFirst({
//       where: {
//         date: {
//           gte: startOfDay,
//           lte: endOfDay
//         },
//         startTime: formattedStartTime,
//         endTime: formattedEndTime,
//         trainer: {
//           userId: user.userId
//         }
//       }
//     });

//     if (isSlotAlreadyCreated) {
//       throw new AppError(status.CONFLICT, "Slot with the same date and time already exists");
//     }

//     const result = await prisma.slot.create({
//       data: {
//         trainerId: isTrainer.id,
//         date: new Date(date),
//         startTime: formattedStartTime,
//         endTime: formattedEndTime
//       }
//     });
//     return result;
//   }

//   catch (error: any) {
//     if (error instanceof AppError) {
//       throw error;
//     }
//     console.log("Error creating slot: ", error);
//     throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create slot");
//   }
// }

const createSlot = async (user: IRequestUser, payload: ICreateSlotPayload) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });

  if (!isTrainer) {
    throw new Error("Only trainers can create slots");
  }

  try {
    const { date, startTime, endTime } = payload;

    const formattedStartTime = startTime.trim();
    const formattedEndTime = endTime.trim();

    if (formattedStartTime > formattedEndTime) {
      throw new AppError(status.BAD_REQUEST, "Start time must be before end time");
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(`${date}T00:00:00.000Z`);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const isSlotAlreadyCreated = await prisma.slot.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        trainer: {
          userId: user.userId
        }
      }
    });

    if (isSlotAlreadyCreated) {
      throw new AppError(status.CONFLICT, "Slot with the same date and time already exists");
    }

    const result = await prisma.slot.create({
      data: {
        trainerId: isTrainer.id,
        date: new Date(`${date}T12:00:00.000Z`),
        startTime: formattedStartTime,
        endTime: formattedEndTime
      }
    });
    return result;
  }

  catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.log("Error creating slot: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create slot");
  }
}

//* Get all slots *//
const getAllSlots = async (query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const normalizedQuery: QueryParams = {
    ...query,
    sortBy: query.sortBy ?? "date",
    "trainer.avgRating": query["trainer.rating"],
    "trainer.feePerHour": query["trainer.freePerHour"],
  };

  // Map operator-style keys from public aliases to internal fields
  const operatorKeyPattern = /^([^\[]+)\[([^\]]+)\]$/;
  Object.keys(query).forEach((key) => {
    const m = key.match(operatorKeyPattern);
    if (!m) return;
    const base = m[1];
    const op = m[2];

    if (base === "trainer.freePerHour") {
      normalizedQuery[`trainer.feePerHour[${op}]`] = (query as any)[key];
    }
    if (base === "trainer.rating" || base === "rating") {
      normalizedQuery[`trainer.avgRating[${op}]`] = (query as any)[key];
    }

    if (base === "experience") {
      normalizedQuery[`trainer.experience[${op}]`] = (query as any)[key];
    }

    if (base === "freePerHour") {
      normalizedQuery[`trainer.feePerHour[${op}]`] = (query as any)[key];
    }
  });

  // Map simple alias keys (e.g., ?experience=3) to nested trainer fields
  Object.keys(query).forEach((key) => {
    if (key === "experience") {
      // plain equality or array handled by QueryBuilder
      if ((query as any)[key] !== undefined && normalizedQuery["trainer.experience"] === undefined) {
        normalizedQuery["trainer.experience"] = (query as any)[key] as any;
      }
    }
    if (key === "trainer.experience") {
      // already correct
    }
    if (key === "freePerHour") {
      if ((query as any)[key] !== undefined && normalizedQuery["trainer.feePerHour"] === undefined) {
        normalizedQuery["trainer.feePerHour"] = (query as any)[key] as any;
      }
    }
  });

  const { orderBy } = QueryBuilder.getSortOptions(normalizedQuery);

  const searchableFields = ["trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.SlotWhereInput>(query, searchableFields);

  const filterableFields = ["trainer.user.name", "trainer.avgRating", "trainer.feePerHour", "trainer.experience", "date"];
  const { filterConditions } = QueryBuilder.getFilterConditions(normalizedQuery, filterableFields);

  const filterConditionsTyped = filterConditions as unknown as Prisma.SlotWhereInput;

  const dateFilters = filterConditionsTyped.date as unknown as Record<string, unknown> | undefined;

  if (dateFilters) {
    const normalizeDateValue = (value: unknown): unknown => {
      if (value === undefined || value === null) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map((item) => normalizeDateValue(item));
      }

      if (typeof value === "string" || value instanceof Date) {
        return new Date(value);
      }

      return value;
    };

    Object.keys(dateFilters).forEach((key) => {
      (dateFilters as any)[key] = normalizeDateValue((dateFilters as any)[key]);
    });

    filterConditionsTyped.date = dateFilters as any;
  }

  const whereConditions: Prisma.SlotWhereInput[] = [
    { isBooked: false },
    ...(searchConditions.length > 0 ? [{ OR: searchConditions } as Prisma.SlotWhereInput] : []),
    filterConditionsTyped
  ];

  const [slots, total] = await Promise.all([
    prisma.slot.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
      skip,
      take: limit,
      orderBy,
      include: {
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    }),
    prisma.slot.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
    })
  ]);

  return {
    data: slots,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

//* Get slot by slot ID *//
const getSlotById = async (slotId: string) => {
  const slot = await prisma.slot.findUnique({
    where: {
      id: slotId
    },
  })
  return slot;
};

//* Get Slots by trainer ID ** //
const getSlotsByTrainerId = async (trainerId: string, query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const sortBy = (query.sortBy as string) || "date";
  const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

  const orderBy = {
    [sortBy]: sortOrder,
  };

  const { filterConditions } = QueryBuilder.getFilterConditions(query, ["date", "isBooked"]);

  if (filterConditions && filterConditions.date && typeof filterConditions.date === "object") {
    const dateFilter = filterConditions.date as Record<string, unknown>;
    if (dateFilter.gte && typeof dateFilter.gte === "string") {
      dateFilter.gte = new Date(dateFilter.gte);
    }
    if (dateFilter.lte && typeof dateFilter.lte === "string") {
      dateFilter.lte = new Date(dateFilter.lte);
    }
  }

  // const trainerProfile = await prisma.trainerProfile.findUnique({
  //   where: {
  //     userId: user?.userId,
  //   },
  // });

  // if (!trainerProfile) {
  //   throw new AppError(status.NOT_FOUND, "Trainer profile not found for the user");
  // }

  // const isTrainerValid = trainerProfile.id === trainerId;

  // if (!isTrainerValid) {
  //   throw new AppError(status.FORBIDDEN, "You can only access your own slots");
  // }

  const whereConditions: Prisma.SlotWhereInput = {
    trainerId,
    ...filterConditions,
  };

  const [slots, total] = await prisma.$transaction([
    prisma.slot.findMany({
      where: whereConditions,
      include: {
        trainer: {
          select: {
            id: true,
            feePerHour: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.slot.count({
      where: whereConditions,
    }),
  ]);

  return {
    data: slots,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//* Update slot by trainer (own) *//
const updateSlot = async (user: IRequestUser, slotId: string, payload: IUpdateSlotPayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user?.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });

  if (!isTrainer) {
    throw new AppError(status.FORBIDDEN, "Only trainers can update slots");
  }

  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id,
      isBooked: false
    }
  });

  if (!isSlotExists) {
    throw new AppError(status.NOT_FOUND, "Slot not found or you are trying to update other trainer's slot");
  }

  const isSlotAvailable = await prisma.slot.findFirst({
    where: {
      date: new Date(payload.date),
      startTime: payload.startTime,
      endTime: payload.endTime,
      trainer: {
        userId: user?.userId
      }
    }
  });

  if (isSlotAvailable) {
    throw new AppError(status.CONFLICT, "Slot with the same date and time already exists");
  }

  try {
    const { date, startTime, endTime } = payload;

    if (startTime > endTime) {
      throw new AppError(status.BAD_REQUEST, "Start time must be before end time");
    }
    const result = await prisma.slot.update({
      where: {
        id: slotId
      },
      data: {
        date: new Date(date),
        startTime,
        endTime
      }
    });

    return result;
  }

  catch (error) {
    console.log("Error updating slot: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update slot");
  }
}

//* Update booking (slot) status to complete *//
// Given a slotId, find the booking whose slotId matches and mark that booking as COMPLETED.
// Only the trainer who owns the slot can mark the booking as completed.
const updateSlotStatusToCompleted = async (user: IRequestUser, slotId: string) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });

  if (!isTrainer) {
    throw new AppError(status.FORBIDDEN, "Only trainers can update slot status");
  }

  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id
    }
  });

  if (!isSlotExists) {
    throw new AppError(status.NOT_FOUND, "Slot not found or you are trying to update other trainer's slot");
  }

  const isBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      slotId
    }
  });

  if (!isBookingExists) {
    throw new AppError(status.NOT_FOUND, "No booking found for this slot");
  }

  if (isBookingExists.trainerId !== isTrainer.id) {
    throw new AppError(status.FORBIDDEN, "You can only update bookings for your own slots");
  }

  try {
    const result = await prisma.bookingSlot.update({
      where: {
        id: isBookingExists.id
      },
      data: {
        status: BookingStatus.COMPLETED
      }
    });

    return result;
  }

  catch (error) {
    console.log("Error updating slot status: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update slot status");
  }
}


//* Delete slot by trainer (own) *//
const deleteSlot = async (user: IRequestUser, slotId: string) => {
  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user?.userId
    }
  });

  if (!isTrainer) {
    throw new AppError(status.FORBIDDEN, "Only trainers can delete slots");
  }

  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: slotId,
      trainerId: isTrainer.id,
      isBooked: false
    }
  });

  if (!isSlotExists) {
    throw new AppError(status.NOT_FOUND, "Slot not found or you are trying to delete other trainer's slot");
  }

  try {
    await prisma.slot.delete({
      where: {
        id: slotId
      }
    });
  }

  catch (error) {
    console.log("Error deleting slot: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete slot");
  }
}


export const SlotService = {
  createSlot,
  getAllSlots,
  getSlotById,
  getSlotsByTrainerId,
  updateSlot,
  updateSlotStatusToCompleted,
  deleteSlot
}