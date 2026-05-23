import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { ICreateReviewPayload } from "./review.interface";
import { TrainerReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

//* Create a new review for a trainer (By user only) *//
const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await TrainerReviewService.createReview(user, payload as ICreateReviewPayload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
);

//* Update review by user (own) *//
const updateReview = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.reviewId;
    const payload = req.body;
    
    const result = await TrainerReviewService.updateReview(user, reviewId as string, payload);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Review updated successfully",
      data: result
    });
  }
);

//* Delete review by user (own) *//
const deleteReview = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const reviewId = req.params.reviewId;

    const result = await TrainerReviewService.deleteReview(user, reviewId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Review deleted successfully",
      data: result
    });
  }
);


export const TrainerReviewController = {
  createReview,
  deleteReview,
  updateReview
}