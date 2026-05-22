import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { catchAsync } from "../../shared/catchAsync";

//* Create a new product *//
const createProduct = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result
    });
  }
);

//* Get all products *//
const getAllProducts = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getAllProducts();
    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result
    });
  }
);

//* Get a product by product ID *//
const getProductById = catchAsync(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const result = await ProductService.getProductById(productId as string);

    res.status(200).json({
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
    const user = req.user;
    const payload = req.body;

    const result = await ProductService.updateProduct(user, productId as string, payload);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result
    });
  }
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct
}