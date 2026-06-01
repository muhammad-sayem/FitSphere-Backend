import z from "zod";

export const createOrderZodSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    address: z.string().min(1, "Address is required"),
    phone: z.string().min(1, "Phone number is required")
  })
});

export const changeOrderStatusZodSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED", "CANCELLED"], {
    message: "Invalid order status"
  })
});