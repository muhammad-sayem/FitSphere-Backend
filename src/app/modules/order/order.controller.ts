import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { OrderService } from "./order.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

//* Create Order by user and trainer *//
const createOrder = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await OrderService.createOrder(user, payload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Order created successfully",
      data: result
    });
  }
);


export const OrderController = {
  createOrder
};