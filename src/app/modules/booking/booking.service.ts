import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateBookingPayload } from "./booking.interface";
import { BookingStatus, PaymentPurpose, PaymentProvider, PaymentStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import {v7 as uuidv7} from "uuid";

const paymentRedirectBaseUrl = process.env.FRONTEND_URL ?? envVars.BETTER_AUTH_URL;

//* Create a new booking (By user only) *//
const createBooking = async (user: IRequestUser, payload: ICreateBookingPayload) => {
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
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer not found");
  }

  const isSlotExists = await prisma.slot.findFirst({
    where: {
      id: payload.slotId,
      trainerId: payload.trainerId
    }
  });

  if (!isSlotExists) {
    throw new AppError(status.NOT_FOUND, "Slot not found");
  }

  if (isSlotExists.isBooked) {
    throw new AppError(status.BAD_REQUEST, "This slot is already booked");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const transactionId = String(uuidv7());

      const paymentData = await tx.payment.create({
        data: {
          userId: user.userId,
          purpose: PaymentPurpose.TRAINER_BOOKING,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          amount: isTrainerExists.feePerHour,
        }
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Booking with ${isTrainerExists.user?.name ?? "trainer"}`,
              },
              unit_amount: Math.round(isTrainerExists.feePerHour * 100),
            },
            quantity: 1,
          }
        ],
        payment_intent_data: {
          metadata: {
            paymentId: paymentData.id,
            trainerId: payload.trainerId,
            slotId: payload.slotId,
            userId: user.userId,
            feeAmount: String(isTrainerExists.feePerHour),
            purpose: PaymentPurpose.TRAINER_BOOKING,
          }
        },
        metadata: {
          paymentId: paymentData.id,
          trainerId: payload.trainerId,
          slotId: payload.slotId,
          userId: user.userId,
          feeAmount: String(isTrainerExists.feePerHour),
          purpose: PaymentPurpose.TRAINER_BOOKING,
        },
        success_url: `${paymentRedirectBaseUrl}/payment/payment-success`,
        cancel_url: `${paymentRedirectBaseUrl}/dashboard/appointments`,
      });

      if (!session.url) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create payment session");
      }

      return {
        paymentData,
        paymentUrl: session.url,
      };
    });

    return result;
  }

  catch (error) {
    console.log("Error creating booking: ", error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, error.message);
    }

    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create booking");
  }
};

//* Get all bookings (Admin only) *//
const getAllBookings = async (query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const bookingQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt",
  };
  const { orderBy } = QueryBuilder.getSortOptions(bookingQuery);

  const searchableFields = ["user.name", "trainer.user.name"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.BookingSlotWhereInput>(query, searchableFields);

  const filterableFields = ["feeAmount"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const whereConditions = [
    ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
    { ...filterConditions }
  ];

  try {
    const [bookings, total] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          trainer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.bookingSlot.count({
        where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
      })
    ]);

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  catch (error) {
    console.log("Error fetching all bookings: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};

//* Get bookings by user ID (Own only) *//
const getBookingsByUserId = async (user: IRequestUser, query: QueryParams) => {

  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const bookingQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt",
  };
  const { orderBy } = QueryBuilder.getSortOptions(bookingQuery);

  const searchableFields = ["trainer.user.name", "trainer.user.email"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.BookingSlotWhereInput>(
    query,
    searchableFields
  );

  const filterableFields = [
    "paymentStatus",
    "feeAmount",
    "slot.date",
    "slot.startTime",
    "slot.endTime",
  ];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const whereConditions: Prisma.BookingSlotWhereInput[] = [
    { userId: user.userId }, 
    ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
    { ...filterConditions },
  ];

  try {
    const [bookings, total] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: { AND: whereConditions },
        include: {
          trainer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          slot: {
            select: {
              date: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.bookingSlot.count({
        where: { AND: whereConditions },
      }),
    ]);

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.log("Error fetching user bookings: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};

//* Get bookings by trainer ID (Public) *//
const getBookingsByTrainerId = async (trainerId: string) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      id: trainerId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer not found");
  }

  try {
    const result = await prisma.bookingSlot.findMany({
      where: {
        trainerId
      }
    });

    return result;
  }

  catch (error) {
    console.log("Error fetching bookings by trainer ID: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch bookings");
  }
};

//* Update booking status to "CONFIRM" (By trainer only) *//
const updateBookingStatusToCompleted = async (user: IRequestUser, bookingId: string) => {
  const isTrainerExists = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    }
  });

  if (!isTrainerExists) {
    throw new AppError(status.NOT_FOUND, "Trainer not found");
  }

  const isValidBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId,
      trainerId: isTrainerExists.id
    }
  });

  if (!isValidBookingExists) {
    throw new AppError(status.NOT_FOUND, "Invalid booking or your'e trying to update booking that doesn't belong to you");
  }

  try {
    const result = await prisma.bookingSlot.update({
      where: {
        id: bookingId
      },
      data: {
        status: BookingStatus.COMPLETED
      }
    });
    return result;
  }

  catch (error) {
    console.log("Error updating booking status: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update booking status");
  }
}

//* Delete booking by user (own, only if paymentStatus is false) *//
const deleteBooking = async (user: IRequestUser, bookingId: string) => {
  const isBookingExists = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId
    }
  });

  if (!isBookingExists) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const isOwnBooking = await prisma.bookingSlot.findFirst({
    where: {
      id: bookingId,
      userId: user.userId
    }
  });

  if (!isOwnBooking) {
    throw new AppError(status.FORBIDDEN, "You can't delete others' bookings. You can only delete your own bookings");
  }

  if (isOwnBooking.paymentStatus === PaymentStatus.SUCCEEDED) {
    throw new AppError(status.BAD_REQUEST, "Paid booking cannot be deleted");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const deletedBooking = await tx.bookingSlot.delete({
        where: {
          id: bookingId
        }
      });

      await tx.slot.update({
        where: {
          id: deletedBooking.slotId
        },
        data: {
          isBooked: false
        }
      });

      return deletedBooking;
    });

    return result;
  }

  catch (error) {
    console.log("Error deleting booking: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete booking");
  }
};

export const BookingService = {
  createBooking,
  getAllBookings,
  getBookingsByUserId,
  getBookingsByTrainerId,
  updateBookingStatusToCompleted,
  deleteBooking
};
