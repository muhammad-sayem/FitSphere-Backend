import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (zodSchema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return next(error);
      }
    }

    const parsedResult = zodSchema.safeParse({
      body: req.body,
      query: req.query,
      cookies: req.cookies
    });

    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    req.body = parsedResult.data.body;

    return next();
  };
};