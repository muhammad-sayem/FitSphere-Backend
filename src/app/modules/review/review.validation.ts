import z from "zod";

export const CreateReviewZodSchema = z.object({
  body: z.object({
    trainerId: z.string().uuid({ message: "Invalid trainer ID format" }),
    rating: z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
    comment: z.string().optional()
  })
});

export const UpdateReviewZodSchema = z.object({
  body: z.object({
    rating: z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }).optional(),
    comment: z.string().optional()
  })
});