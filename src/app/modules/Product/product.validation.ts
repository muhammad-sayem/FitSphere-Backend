import z from 'zod';

export const createProductZodSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Product category is required"),
  remainingStock: z.number().int().nonnegative("Remaining stock must be a non-negative integer"),
  image: z.string().optional(),
});

export const updateProductZodSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Product category is required"),
  remainingStock: z.number().int().nonnegative("Remaining stock must be a non-negative integer"),
  image: z.string().optional(),
});