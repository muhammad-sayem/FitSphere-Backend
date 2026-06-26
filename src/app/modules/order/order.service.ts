import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IChangeOrderStatusPayload, ICreateOrderPayload } from "./order.interface";
import { OrderStatus, PaymentPurpose, PaymentProvider, PaymentStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const paymentRedirectBaseUrl = process.env.FRONTEND_URL ?? envVars.BETTER_AUTH_URL;

//* Create order (By user and trainer) *//
// Follows the same pattern as trainer booking:
// 1. Validate product + stock availability
// 2. Create a PENDING Payment (no Order row yet)
// 3. Create Stripe checkout session with metadata that the webhook will use
// 4. The Order row is created later, in the payment webhook, once payment succeeds
const createOrder = async (user: IRequestUser, payload: ICreateOrderPayload) => {
  const isProductExists = await prisma.product.findFirst({
    where: {
      id: payload.productId,
    }
  });

  if (!isProductExists) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  const isStockAvailable = await prisma.product.findFirst({
    where: {
      id: payload.productId,
      remainingStock: {
        gte: payload.quantity
      }
    }
  });

  if (!isStockAvailable) {
    throw new AppError(status.BAD_REQUEST, "Insufficient stock available");
  }

  const price = isProductExists.price;
  const totalAmount = price * payload.quantity;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const paymentData = await tx.payment.create({
        data: {
          userId: user.userId,
          purpose: PaymentPurpose.PRODUCT_ORDER,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
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
                name: `Order for ${isProductExists.name}`,
              },
              unit_amount: Math.round(totalAmount * 100),
            },
            quantity: 1,
          }
        ],
        payment_intent_data: {
          metadata: {
            paymentId: paymentData.id,
            userId: user.userId,
            productId: payload.productId,
            quantity: String(payload.quantity),
            address: payload.address,
            phone: payload.phone,
            totalAmount: String(totalAmount),
            purpose: PaymentPurpose.PRODUCT_ORDER,
          }
        },
        metadata: {
          paymentId: paymentData.id,
          userId: user.userId,
          productId: payload.productId,
          quantity: String(payload.quantity),
          address: payload.address,
          phone: payload.phone,
          totalAmount: String(totalAmount),
          purpose: PaymentPurpose.PRODUCT_ORDER,
        },
        success_url: `${paymentRedirectBaseUrl}/payment/payment-success`,
        cancel_url: `${paymentRedirectBaseUrl}/dashboard/orders`,
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
    console.log("Error creating order: ", error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new AppError(status.INTERNAL_SERVER_ERROR, error.message);
    }

    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create order");
  }
}

//* Get own orders (By user only) *//
const getOwnOrders = async (user: IRequestUser, query: QueryParams) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  try {
    const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

    const orderQuery = {
      ...query,
      sortBy: query.sortBy ?? "createdAt",
    };
    const { orderBy } = QueryBuilder.getSortOptions(orderQuery);

    // Added "address" to searchableFields for partial and case-insensitive matching
    const searchableFields = ["product.name", "product.description", "address"];
    const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.OrderWhereInput>(query, searchableFields);

    const filterableFields = ["status", "price", "totalAmount", "quantity"];
    const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

    const whereConditions = [
      { userId: user.userId },
      ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
      { ...filterConditions }
    ];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { AND: whereConditions },
        include: {
          product: {
            select: {
              name: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.order.count({
        where: { AND: whereConditions },
      })
    ]);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to fetch orders", (error as Error).stack);
  }
};


//* Get all orders (By admin only) *//
const getAllOrders = async (query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);

  const orderQuery = {
    ...query,
    sortBy: query.sortBy ?? "createdAt",
  };
  const { orderBy } = QueryBuilder.getSortOptions(orderQuery);

  const searchableFields = ["user.name", "product.name", "product.description"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.OrderWhereInput>(query, searchableFields);

  const filterableFields = ["status", "price", "totalAmount", "quantity"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const whereConditions = [
    ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
    { ...filterConditions }
  ];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
      include: {
        product: {
          select: {
            name: true,
            price: true,
            description: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      skip,
      take: limit,
      orderBy
    }),
    prisma.order.count({
      where: whereConditions.length > 0 ? { AND: whereConditions } : undefined,
    })
  ]);

  return {
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

//* Change order status (By admin only) *//
const changeOrderStatus = async (user: IRequestUser, orderId: string, payload: IChangeOrderStatusPayload) => {
  const isOrderExists = await prisma.order.findUnique({
    where: {
      id: orderId
    }
  });

  if (!isOrderExists) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  try {
    const result = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status: payload.status as OrderStatus
      }
    });

    return result;
  }

  catch (error) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update order status", (error as Error).stack);
  }
};


export const OrderService = {
  createOrder,
  getOwnOrders,
  getAllOrders,
  changeOrderStatus,
}