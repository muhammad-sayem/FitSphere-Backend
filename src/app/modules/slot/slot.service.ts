import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateSlotPayload, IUpdateSlotPayload } from "./slot.interface";

//* Create a new slot for a trainer (by trainer only) *//
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

    if (startTime > endTime) {
      throw new AppError(status.BAD_REQUEST, "Start time must be before end time");
    }

    const isSlotUnavailable = await prisma.slot.findFirst({
      where: {
        date: new Date(payload.date),
        startTime: payload.startTime,
        endTime: payload.endTime,
      }
    });

    if (isSlotUnavailable) {
      throw new AppError(status.CONFLICT, "Slot with the same date and time already exists");
    }

    const result = await prisma.slot.create({
      data: {
        trainerId: isTrainer.id,
        date: new Date(date),
        startTime,
        endTime
      }
    });
    return result;
  }

  catch (error) {
    console.log("Error creating slot: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create slot");
  }
}

//* Update slot by trainer (own) *//
const updateSlot = async (user: IRequestUser, slotId: string, payload: IUpdateSlotPayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isTrainer = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });

  if (!isTrainer) {
    throw new AppError(status.FORBIDDEN, "Only trainers can update slots");
  }

  const isTrainerValid = user.userId === isTrainer.userId;

  if (!isTrainerValid) {
    throw new AppError(status.FORBIDDEN, "You can only update your own slots");
  }

  const isSlotExists = await prisma.slot.findUnique({
    where: {
      id: slotId,
      isBooked: false
    }
  });

  if (!isSlotExists) {
    throw new AppError(status.NOT_FOUND, "Slot not found");
  }

  const isSlotUnavailable = await prisma.slot.findFirst({
    where: {
      date: new Date(payload.date),
      startTime: payload.startTime,
      endTime: payload.endTime,
    }
  });

  if (isSlotUnavailable) {
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



export const SlotService = {
  createSlot,
  updateSlot
}