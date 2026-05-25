import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IChangeOrderStatusPayload, ICreateOrderPayload } from "./order.interface";
import { OrderStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";

//* Create order (By user and trainer) *//
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

  try{
    const result = await prisma.$transaction(async(tx) => {

      const order = await tx.order.create({
        data :{
          userId: user.userId,
          price,
          totalAmount,
          ...payload,
        }
      });

      await tx.product.update({
        where: {
          id: payload.productId
        },
        data: {
          remainingStock: {
            decrement: payload.quantity
          }
        }
      });

      return order;
    });

    return result;
  }

  catch(error){
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create order", (error as Error).stack);
  }

}

//* Get own orders (By user only) *//
const getOwnOrders = async (user: IRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const result = await prisma.order.findMany({
    where: {
      userId: user.userId
    }
  });

  return result;
};

//* Get all orders (Admin only) *//
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