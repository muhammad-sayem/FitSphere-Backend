import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { myProfileService } from "./myProfile.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const editMyProfile = catchAsync(
  async(req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await myProfileService.editMyProfile(user, payload);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Profile updated successfully",
      data: result
    });
  }
);

export const myProfileController = {
  editMyProfile
}