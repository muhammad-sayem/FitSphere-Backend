import { ProductCategories } from "../../../generated/prisma/browser";

export interface ICreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  remainingStock: number;
  image?: string;
}

export interface IUpdateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategories;
  remainingStock: number;
  image?: string;
}