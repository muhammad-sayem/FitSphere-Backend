import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";

const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Users retrieved successfully",
      data: users
    });
  }
);

export const UserControllers = {
  getAllUsers
};