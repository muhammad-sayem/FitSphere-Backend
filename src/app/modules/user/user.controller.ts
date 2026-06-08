import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/client";
//* Get all users with pagination, filtering and sorting *//
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

//* Change user status (active, banned  by admin only) *//
const changeUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const newStatus = req.body.status as UserStatus;

    const result = await UserService.changeUserStatus(userId as string, newStatus);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User status changed successfully",
      data: result
    })
  }
)



export const UserControllers = {
  getAllUsers,
  changeUserStatus
};