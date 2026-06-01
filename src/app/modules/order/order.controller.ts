import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { IChangeOrderStatusPayload } from "./order.interface";
import { QueryParams } from "../../utils/QueryBuilder";
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

//* Get own orders (By user only) *//
const getOwnOrders = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;

    const result = await OrderService.getOwnOrders(user, query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result
    });
  }
);

//* Get all orders (Admin only) *//
const getAllOrders = catchAsync(
  async (req: Request, res: Response) => {
    // Normalize incoming query keys/values to handle cases like
    // `?searchTerm =User 4` (extra spaces or leading '=' in value)
    const rawQuery = req.query as Record<string, unknown>;
    const query: Record<string, unknown> = {};

    Object.entries(rawQuery).forEach(([rawKey, rawValue]) => {
      const key = rawKey.trim().replace(/\s+/g, "");

      const normalize = (v: unknown) => {
        if (typeof v === "string") return v.replace(/^=+/, "").trim();
        return v;
      };

      const values: unknown[] = Array.isArray(rawValue)
        ? rawValue.map((v) => normalize(v))
        : [normalize(rawValue)];

      const existing = query[key];

      if (existing === undefined) {
        query[key] = values.length === 1 ? values[0] : values;
        return;
      }

      // merge when duplicate keys (e.g., 'searchTerm' and 'searchTerm ')
      if (Array.isArray(existing)) {
        query[key] = [...existing, ...values];
      } else {
        query[key] = [existing, ...values];
      }
    });

    const result = await OrderService.getAllOrders(query as QueryParams);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result
    });
  }
);

//* Change order status (By admin only) *//
const changeOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const orderId = req.params.orderId;
    const payload = req.body;

    const result = await OrderService.changeOrderStatus(
      user,
      orderId as string,
      payload as IChangeOrderStatusPayload
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Order status updated successfully",
      data: result
    });
  }
);


export const OrderController = {
  createOrder,
  getOwnOrders,
  getAllOrders,
  changeOrderStatus
};