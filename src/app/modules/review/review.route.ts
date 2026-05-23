import { Router } from "express";
import { TrainerReviewController } from "./review.controller";
import { CreateReviewZodSchema } from "./review.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-review", validateRequest(CreateReviewZodSchema), checkAuth(UserRoles.USER), TrainerReviewController.createReview);

router.patch("/update-review/:reviewId", validateRequest(CreateReviewZodSchema.partial()), checkAuth(UserRoles.USER), TrainerReviewController.updateReview);

router.delete("/delete-review/:reviewId", checkAuth(UserRoles.USER), TrainerReviewController.deleteReview);

export const TrainerReviewRoute = router;