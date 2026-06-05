import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";

const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    const result = await UserService.getAllUsers(user, query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);

export const UserControllers = {
  getAllUsers
};