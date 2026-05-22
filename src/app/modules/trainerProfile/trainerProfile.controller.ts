import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TrainerProfileService } from "./trainerProfile.service";
import status from "http-status";
import { QueryParams } from "../../utils/QueryBuilder";

//* Create a trainer profile (By Trainer role) *//
const createTrainerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await TrainerProfileService.createTrainerProfile(user, payload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Trainer profile created successfully",
      data: result
    })
  }
);

//* Get All trainer profiles *//
const getAllTrainerProfiles = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await TrainerProfileService.getAllTrainerProfiles(query as QueryParams);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainer profiles retrieved successfully",
      data: result.data,
      meta: result.meta
    }) 
  }
)


export const TrainerProfileController = {
  createTrainerProfile,
  getAllTrainerProfiles
}