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
);

//* Get All trainer profiles (From Users Schema) *//
const getAllTrainersFromUsers = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await TrainerProfileService.getAllTrainersFromUsers(query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainers retrieved successfully",
      data: result.data,
      meta: result.meta
    })
  }
);

//* Get trainer profile by user ID *//
const getTrainerProfileByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await TrainerProfileService.getTrainerProfileByUserId(userId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainer profile retrieved successfully",
      data: result
    })
  }
);

//* Get a trainer profile by trainer profile ID *//
const getTrainerByTrainerProfileId = catchAsync(
  async (req: Request, res: Response) => {
    const { trainerProfileId } = req.params;
    
    const result = await TrainerProfileService.getTrainerByTrainerProfileId(trainerProfileId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainer profile retrieved successfully",
      data: result
    })
  }
);

//* Get not approved trainer profiles *//
const getNotApprovedTrainerProfiles = catchAsync(
    async (req: Request, res: Response) => {
      const result = await TrainerProfileService.getNotApprovedTrainerProfiles();

      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Not approved trainer profiles retrieved successfully",
        data: result
      });
    }
);

//* Approval contorl for a trainer profile (Admin Only)*//
const approvalControlForTrainerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { trainerProfileId } = req.params;
    const { isApproved } = req.body;
    const user = req.user;

    const result = await TrainerProfileService.approvalControlForTrainerProfile(user, trainerProfileId as string, isApproved as boolean);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: `Trainer profile ${isApproved ? "approved" : "rejected"} successfully`,
      data: result
    })
  }
);

//* Update a trainer profile by trainer profile ID (Own) *//
const updateTrainerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { trainerProfileId } = req.params;
    const payload = req.body;
    const user = req.user;

    const result = await TrainerProfileService.updateTrainerProfile(user, trainerProfileId as string, payload);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainer profile updated successfully",
      data: result
    })
  }
);

//* Delete a trainer profile by trainer profile ID (Admin Only) *//
const deleteTrainerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { trainerProfileId } = req.params;
    const user = req.user;

    const result = await TrainerProfileService.deleteTrainerProfile(user, trainerProfileId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Trainer profile deleted successfully",
      data: result
    })
  }
);


export const TrainerProfileController = {
  createTrainerProfile,
  getAllTrainerProfiles,
  getAllTrainersFromUsers,
  getTrainerByTrainerProfileId,
  getTrainerProfileByUserId,
  getNotApprovedTrainerProfiles,
  approvalControlForTrainerProfile,
  updateTrainerProfile,
  deleteTrainerProfile
}