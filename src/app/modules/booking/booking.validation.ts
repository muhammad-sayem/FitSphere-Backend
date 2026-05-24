import z from "zod";

export const CreateBookingZodSchema = z.object({
  trainerId: z.string().uuid({ message: "Invalid trainer ID format" }),
  slotId: z.string().uuid({ message: "Invalid slot ID format" })
});
