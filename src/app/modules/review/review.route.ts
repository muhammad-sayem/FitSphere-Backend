import { Router } from "express";
import { ReviewController } from "./review.controller";
import { CreateReviewZodSchema } from "./review.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-review", validateRequest(CreateReviewZodSchema), checkAuth(UserRoles.USER), ReviewController.createReview);

router.get("/", ReviewController.getAllReviews);

router.get("/user/my-reviews", checkAuth(UserRoles.USER),ReviewController.getReviewsByUserId);

router.get("/trainer/:trainerId/reviews", ReviewController.getReviewsByTrainerId);

router.patch("/update-review/:reviewId", validateRequest(CreateReviewZodSchema.partial()), checkAuth(UserRoles.USER), ReviewController.updateReview);

router.delete("/delete-review/:reviewId", checkAuth(UserRoles.USER), ReviewController.deleteReview);

export const TrainerReviewRoute = router;