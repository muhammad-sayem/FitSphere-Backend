import status from "http-status";
import { UserRoles } from "../../../generated/prisma/browser";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateProductPayload, IUpdateProductPayload } from "./product.interface";

//* Create a new product *//
const createProduct = async (payload: ICreateProductPayload) =>  {
  const result = await prisma.product.create({
    data: payload
  });
  return result;
}

//* Get all products *//
const getAllProducts = async () => {
  const result = await prisma.product.findMany({});
  return result;
}

//* Get a product by prpoduct ID *// 
const getProductById = async (productId: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id: productId
    }
  })
  return result;
}

//* Update a product by product ID (Admin Only)*//
const updateProduct = async (user: IRequestUser, productId: string, payload: IUpdateProductPayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if(!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isAdmin = isUserExists.role === UserRoles.ADMIN;

  if(!isAdmin) {
    throw new AppError(status.FORBIDDEN, "Only admins can update products");
  }

  try {
    const result = await prisma.product.update({
      where: {
        id: productId
      },
      data: payload
    });
    return result;
  }

  catch (error) {
    console.log("Error updating product: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to update product", (error as Error).stack);
  }
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct
}