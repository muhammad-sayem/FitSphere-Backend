import z from 'zod';

export const createSlotZodSchema = z.object({
  date: z.string().refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }),
  startTime: z.string().refine((timeStr) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeStr);
  }),
  endTime: z.string().refine((timeStr) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeStr);
  }),
});

export const updateSlotZodSchema = z.object({
  date: z.string().refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }),
  startTime: z.string().refine((timeStr) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeStr);
  }),
  endTime: z.string().refine((timeStr) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(timeStr);
  }),
})