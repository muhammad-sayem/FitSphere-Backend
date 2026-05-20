import { prisma } from "../../lib/prisma";
import { ICreateProductPayload } from "./product.interface";

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

export const ProductService = {
  createProduct,
  getAllProducts
}

