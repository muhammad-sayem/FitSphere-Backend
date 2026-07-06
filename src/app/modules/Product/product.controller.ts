import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { catchAsync } from "../../shared/catchAsync";
import { QueryParams } from "../../utils/QueryBuilder";
import { sendResponse } from "../../shared/sendResponse";

//* Create a new product *//
const createProduct = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await ProductService.createProduct(payload);

    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Product created successfully",
      data: result
    });
  }
);

//* Get all products *//
const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await ProductService.getAllProducts(query as QueryParams);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);

//* Get a product by product ID *//
const getProductById = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const result = await ProductService.getProductById(productId as string);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product retrieved successfully",
      data: result
    });
  }
);

//* Update a product by product ID (Admin Only)*//
const updateProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const payload = req.body;

    const result = await ProductService.updateProduct(productId as string, payload);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  }
);

//* Delete a product by product ID (Admin Only)*//
const deleteProduct = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const user = req.user;

    const result = await ProductService.deleteProduct(user, productId as string);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Product deleted successfully",
      data: result
    });
  }
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
}
