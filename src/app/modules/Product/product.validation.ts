import z from 'zod';

export const createProductZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Product description is required"),
    price: z.coerce.number({
    }).positive("Price must be a positive number"),
    category: z.string().min(1, "Product category is required"),
    remainingStock: z.coerce.number({
    }).int("Remaining stock must be an integer").nonnegative("Remaining stock must be a non-negative integer"),
    image: z.string().optional(),
  })
});

export const updateProductZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required").optional(),
    description: z.string().min(1, "Product description is required").optional(),
    price: z.coerce.number().positive("Price must be a positive number").optional(),
    category: z.string().min(1, "Product category is required").optional(),
    remainingStock: z.coerce.number().int().nonnegative("Remaining stock must be a non-negative integer").optional(),
    image: z.string().url("Invalid image URL format").optional(),
  })
});