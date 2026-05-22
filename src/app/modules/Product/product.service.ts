import { prisma } from "../../lib/prisma";
import { IProductCreatePayload } from "./product.interface";

//* Create a new product *//
const createProduct = async (payload: IProductCreatePayload) =>  {
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

export const ProductService = {
  createProduct,
  getAllProducts
}

