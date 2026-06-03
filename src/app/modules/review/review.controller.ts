import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { ICreateReviewPayload } from "./review.interface";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

//* Create a new review for a trainer (By user only) *//
const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await ReviewService.createReview(user, payload as ICreateReviewPayload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
);

//* Get all reviews *//
const getAllReviews = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    
    const result = await ReviewService.getAllReviews(query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result
    });
  }
);

//* Get reviews by user ID (By user only) *//
const getReviewsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;

    const result = await ReviewService.getReviewsByUserId(user, query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);

//* Get reviews by trainer ID (Public) *//
const getReviewsByTrainerId = catchAsync(
  async (req: Request, res: Response) => {
    const trainerId = req.params.trainerId;

    const result = await ReviewService.getReviewsByTrainerId(trainerId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reviews retrieved successfully",
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

    const result = await ReviewService.updateReview(user, reviewId as string, payload);

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

    const result = await ReviewService.deleteReview(user, reviewId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Review deleted successfully",
      data: result
    });
  }
);


export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewsByUserId,
  getReviewsByTrainerId,
  deleteReview,
  updateReview
}