import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatsService } from "./stats.service";

const getDashboardData = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await StatsService.getDashboardData(user);

    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result
    })
  }
);

export const StatsController = {
  getDashboardData
};