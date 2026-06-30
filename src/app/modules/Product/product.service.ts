import status from "http-status";
import { Prisma, UserRoles } from "../../../generated/prisma/browser";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateProductPayload, IUpdateProductPayload } from "./product.interface";
import { QueryBuilder, QueryParams } from "../../utils/QueryBuilder";

//* Create a new product *//
const createProduct = async (payload: ICreateProductPayload) => {
  try {
    const result = await prisma.product.create({
      data: payload
    });

    return result;
  }
  
  catch (error) {
    console.log("Error creating product: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create product", (error as Error).stack);
  }
}

//* Get all products *//
const getAllProducts = async (query: QueryParams) => {
  const { page, limit, skip } = QueryBuilder.getPaginationOptions(query);
  const { orderBy } = QueryBuilder.getSortOptions(query);

  const searchableFields = ["name", "description"];
  const { searchConditions } = QueryBuilder.getSearchConditions<Prisma.ProductWhereInput>(query, searchableFields);

  const filterableFields = ["category", "remainingStock", "price"];
  const { filterConditions } = QueryBuilder.getFilterConditions(query, filterableFields);

  const whereConditions = [
    ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),
    { ...filterConditions }
  ];

  const finalWhere = whereConditions.length > 0 ? { AND: whereConditions } : undefined;

  const products = await prisma.product.findMany({
    where: finalWhere,
    skip,
    take: limit,
    orderBy
  });

  const total = await prisma.product.count({
    where: finalWhere
  });

  return {
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
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
const updateProduct = async (productId: string, payload: IUpdateProductPayload) => {
  try {
    const result = await prisma.product.update({
      where: {
        id: productId,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    console.log("Error updating product: ", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to update product",
      (error as Error).stack
    );
  }
};

//* Delete a product by product ID (Admin Only)*//
const deleteProduct = async (user: IRequestUser, productId: string) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (isUserExists.role !== UserRoles.ADMIN) {
    throw new AppError(status.FORBIDDEN, "Only admins can delete products");
  }

  try {
    const result = await prisma.product.delete({
      where: {
        id: productId
      }
    });

    return result;
  }

  catch (error) {
    console.log("Error deleting product: ", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete product", (error as Error).stack);
  }
}

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
}