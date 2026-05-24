import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateOrderPayload } from "./order.interface";

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


export const OrderService = {
  createOrder,
}