import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { ICreateReviewPayload } from "./review.interface";
import { TrainerReviewService } from "./review.service";

//* Create a new review for a trainer (By user only) *//
const createReview = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await TrainerReviewService.createReview(user, payload as ICreateReviewPayload);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
)


export const TrainerReviewController = {
  createReview
}