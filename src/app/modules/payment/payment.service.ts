import Stripe from "stripe";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { PaymentPurpose, PaymentProvider, PaymentStatus, OrderStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";

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
  const bookingSlotId = data.metadata?.bookingSlotId;

  if (!bookingSlotId) {
    throw new AppError(status.BAD_REQUEST, "bookingSlotId is required for trainer booking payment");
  }

  const bookingSlot = await prisma.bookingSlot.findUnique({
    where: {
      id: bookingSlotId
    }
  });

  if (!bookingSlot) {
    throw new AppError(status.NOT_FOUND, "Booking slot not found");
  }

  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: {
        bookingSlotId
      },
      update: {
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? new Date() : null,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        ...(isSuccessful ? { userId: bookingSlot.userId, purpose: PaymentPurpose.TRAINER_BOOKING } : {})
      },
      create: {
        userId: bookingSlot.userId,
        bookingSlotId,
        purpose: PaymentPurpose.TRAINER_BOOKING,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        provider: PaymentProvider.STRIPE,
        stripeEventId: event.id,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        paidAt: isSuccessful ? new Date() : null
      }
    });

    await tx.bookingSlot.update({
      where: {
        id: bookingSlotId
      },
      data: {
        paymentStatus: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        transactionId: isSuccessful ? transactionId : null
      }
    });

    return payment;
  });

  return {
    message: isSuccessful
      ? "Trainer booking payment processed successfully"
      : "Trainer booking payment marked as failed",
    data: result
  };
};

const processProductOrderPayment = async (event: Stripe.Event, data: TStripeDataObject, isSuccessful: boolean) => {
  const orderId = data.metadata?.orderId;

  if (!orderId) {
    throw new AppError(status.BAD_REQUEST, "orderId is required for product order payment");
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    }
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  const transactionId = getTransactionId(data.payment_intent, data.id);
  const amount = getAmount(data);

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: {
        orderId
      },
      update: {
        stripeEventId: event.id,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        paidAt: isSuccessful ? new Date() : null,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        ...(isSuccessful ? { userId: order.userId, purpose: PaymentPurpose.PRODUCT_ORDER } : {})
      },
      create: {
        userId: order.userId,
        orderId,
        purpose: PaymentPurpose.PRODUCT_ORDER,
        status: isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amount,
        provider: PaymentProvider.STRIPE,
        stripeEventId: event.id,
        paymentGatewayData: event.data.object as unknown as Prisma.InputJsonValue,
        paidAt: isSuccessful ? new Date() : null
      }
    });

    await tx.order.update({
      where: {
        id: orderId
      },
      data: {
        status: isSuccessful ? OrderStatus.PAID : OrderStatus.CANCELLED,
        transactionId: isSuccessful ? transactionId : null
      }
    });

    return payment;
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
    if (data.metadata?.bookingSlotId) {
      return processTrainerBookingPayment(event, data, isSuccessfulEvent);
    }

    if (data.metadata?.orderId) {
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