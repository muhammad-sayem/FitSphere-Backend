/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { PaymentPurpose, PaymentProvider, PaymentStatus, OrderStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";

type TStripeDataObject = {
  id: string;
  amount?: number;
  amount_total?: number;
  payment_intent?: string | { id: string };
  metadata?: Record<string, string | undefined>;
};

const getPurpose = (metadata?: Record<string, string | undefined>) => {
  if (metadata?.purpose === PaymentPurpose.TRAINER_BOOKING || metadata?.paymentPurpose === PaymentPurpose.TRAINER_BOOKING) {
    return PaymentPurpose.TRAINER_BOOKING;
  }

  if (metadata?.purpose === PaymentPurpose.PRODUCT_ORDER || metadata?.paymentPurpose === PaymentPurpose.PRODUCT_ORDER) {
    return PaymentPurpose.PRODUCT_ORDER;
  }

  return undefined;
};

const getTransactionId = (paymentIntent?: string | { id: string }, fallbackId?: string) => {
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  if (paymentIntent?.id) {
    return paymentIntent.id;
  }

  return fallbackId;
};

const getAmount = (data: TStripeDataObject) => {
  const rawAmount = data.amount_total ?? data.amount ?? 0;
  return rawAmount / 100;
};

const processTrainerBookingPayment = async (event: Stripe.Event, data: TStripeDataObject, isSuccessful: boolean) => {
  const paymentId = data.metadata?.paymentId;
  const trainerId = data.metadata?.trainerId;
  const slotId = data.metadata?.slotId;
  const userId = data.metadata?.userId;

  if (!paymentId) {
    throw new AppError(status.BAD_REQUEST, "paymentId is required for trainer booking payment");
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);

  const result = await prisma.$transaction(async (tx) => {
    let bookingSlotId = payment.bookingSlotId;
    let slotIdToBook = slotId;

    if (isSuccessful && !bookingSlotId) {
      if (!trainerId || !slotId || !userId) {
        throw new AppError(status.BAD_REQUEST, "trainerId, slotId and userId are required for trainer booking payment");
      }

      const createdBooking = await tx.bookingSlot.create({
        data: {
          userId,
          trainerId,
          slotId,
          feeAmount: payment.amount,
          paymentStatus: PaymentStatus.SUCCEEDED,
          transactionId,
        }
      });

      bookingSlotId = createdBooking.id;
      slotIdToBook = createdBooking.slotId;
    }

    if (isSuccessful && bookingSlotId && !slotIdToBook) {
      const existingBooking = await tx.bookingSlot.findUnique({
        where: {
          id: bookingSlotId,
        },
        select: {
          slotId: true,
        },
      });

      if (!existingBooking) {
        throw new AppError(status.NOT_FOUND, "Booking slot not found");
      }

      slotIdToBook = existingBooking.slotId;
    }

    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        bookingSlotId: bookingSlotId ?? undefined,
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? new Date() : null,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        ...(isSuccessful ? { userId: payment.userId, purpose: PaymentPurpose.TRAINER_BOOKING } : {})
      }
    });

    if (isSuccessful && bookingSlotId) {
      await tx.bookingSlot.update({
        where: {
          id: bookingSlotId
        },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          transactionId,
        }
      });

      await tx.slot.update({
        where: {
          id: slotIdToBook ?? ""
        },
        data: {
          isBooked: true
        }
      });
    }

    return updatedPayment;
  });

  return {
    message: isSuccessful
      ? "Trainer booking payment processed successfully"
      : "Trainer booking payment marked as failed",
    data: result
  };
};

const processProductOrderPayment = async (event: Stripe.Event, data: TStripeDataObject, isSuccessful: boolean) => {
  const paymentId = data.metadata?.paymentId;
  const userId = data.metadata?.userId;
  const productId = data.metadata?.productId;
  const quantity = data.metadata?.quantity ? Number(data.metadata.quantity) : undefined;
  const address = data.metadata?.address;
  const phone = data.metadata?.phone;
  const totalAmountMeta = data.metadata?.totalAmount ? Number(data.metadata.totalAmount) : undefined;

  if (!paymentId) {
    throw new AppError(status.BAD_REQUEST, "paymentId is required for product order payment");
  }

  if (isSuccessful && (!userId || !productId || !quantity || !address || !phone || !totalAmountMeta)) {
    throw new AppError(
      status.BAD_REQUEST,
      "userId, productId, quantity, address, phone and totalAmount are required for product order payment"
    );
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    }
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);

  const result = await prisma.$transaction(async (tx) => {
    let orderId = payment.orderId;
    let orderUserId = payment.userId;

    if (isSuccessful && !orderId) {
      const product = await tx.product.findUnique({
        where: {
          id: productId as string
        },
        select: {
          price: true,
          remainingStock: true,
        }
      });

      if (!product) {
        throw new AppError(status.NOT_FOUND, "Product not found");
      }

      if (product.remainingStock < (quantity as number)) {
        throw new AppError(status.BAD_REQUEST, "Insufficient stock available");
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: userId as string,
          productId: productId as string,
          price: product.price,
          quantity: quantity as number,
          totalAmount: totalAmountMeta as number,
          address: address as string,
          phone: phone as string,
          status: OrderStatus.PAID,
          transactionId,
        }
      });

      orderId = createdOrder.id;
      orderUserId = createdOrder.userId;

      await tx.product.update({
        where: {
          id: productId as string
        },
        data: {
          remainingStock: {
            decrement: quantity as number
          }
        }
      });
    }

    const updatedPayment = await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        orderId: orderId ?? null,
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? new Date() : null,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        ...(isSuccessful ? { userId: orderUserId, purpose: PaymentPurpose.PRODUCT_ORDER } : {})
      }
    });

    return updatedPayment;
  });

  return {
    message: isSuccessful
      ? "Product order payment processed successfully"
      : "Product order payment marked as failed",
    data: result
  };
};

export const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  const data = event.data.object as TStripeDataObject;
  const purpose = getPurpose(data.metadata);
  const isSuccessfulEvent = event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded";
  const isFailedEvent = event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed";

  if (!isSuccessfulEvent && !isFailedEvent) {
    console.log(`Unhandled event type ${event.type}`);
    return { message: `Unhandled event type ${event.type}` };
  }

  if (!purpose) {
    if (data.metadata?.bookingSlotId || data.metadata?.trainerId || data.metadata?.slotId) {
      return processTrainerBookingPayment(event, data, isSuccessfulEvent);
    }

    if (data.metadata?.paymentId || data.metadata?.productId) {
      return processProductOrderPayment(event, data, isSuccessfulEvent);
    }

    console.log(`Payment metadata missing for event ${event.id}`);
    return { message: `Payment metadata missing for event ${event.id}` };
  }

  if (purpose === PaymentPurpose.TRAINER_BOOKING) {
    return processTrainerBookingPayment(event, data, isSuccessfulEvent);
  }

  return processProductOrderPayment(event, data, isSuccessfulEvent);
};

//* Get Payment by user ID (Logged in user) *//
const getPaymentByUserId = async ( user: IRequestUser, query: QueryParams)=> {
  if (!user || !user.userId) {
    return {
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      data: [],
    };
  }

  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const searchableFields = [
    "order.product.name",
    "bookingSlot.trainer.user.name"
  ];
  const filterableFields = [
    "purpose",
    "status",
    "bookingSlot.status",
    "order.status"
  ];

  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.PaymentWhereInput>(query, searchableFields);
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const baseConditions: Prisma.PaymentWhereInput = {
    userId: user.userId,
    status: PaymentStatus.SUCCEEDED,
  };

  const andConditions: Prisma.PaymentWhereInput[] = [baseConditions];

  if (searchConditions.length > 0) {
    andConditions.push({ OR: searchConditions });
  }

  if (Object.keys(filterConditions).length > 0) {
    andConditions.push(filterConditions as Prisma.PaymentWhereInput);
  }

  const whereConditions: Prisma.PaymentWhereInput = { AND: andConditions };

  try {
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          bookingSlot: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              trainer: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({
        where: whereConditions,
      }),
    ]);

    return {
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Error fetching payments", error.message);
  }
};

export const PaymentService = {
  getPaymentByUserId
}