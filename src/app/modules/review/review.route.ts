import { Router } from "express";
import { TrainerReviewController } from "./review.controller";
import { CreateReviewZodSchema } from "./review.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-review", validateRequest(CreateReviewZodSchema), checkAuth(UserRoles.USER), TrainerReviewController.createReview);

export const TrainerReviewRoute = router;