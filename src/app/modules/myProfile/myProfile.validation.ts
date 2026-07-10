import z from "zod";

export const EditMyProfileZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    roleData: z.object({
      bio: z.string().optional()
    }).optional()
  })
});