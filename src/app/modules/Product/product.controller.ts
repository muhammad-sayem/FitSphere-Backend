import { Request, Response } from "express";
import { ProductService } from "./product.service";

//* Create a new product *//
const createProduct = async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req.body);
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: result
  });
}

//* Get all products *//
const getAllProducts = async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts();
  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: result
  });
}



export const ProductController = {
  createProduct,
  getAllProducts
}