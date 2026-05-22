import z from "zod";

export const createTrainerProfileZodSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    specialties: z.string().min(5, "Specialties must be at least 5 characters long"),
    experience: z.number().int().positive("Experience must be a positive integer"),
    feePerHour: z.number().positive("Fee per hour must be a positive number")
  })
});