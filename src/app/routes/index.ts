import { Router } from "express";
import { ProductRouters } from "../modules/Product/product.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TrainerProfileRoute } from "../modules/trainerProfile/trainerProfile.route";
import { SlotRoute } from "../modules/slot/slot.route";
import { TrainerReviewRoute } from "../modules/review/review.route";


const router = Router();

router.use('/products', ProductRouters);
router.use('/auth', AuthRoutes);
router.use('/trainer-profiles', TrainerProfileRoute);
router.use('/slots', SlotRoute);
router.use('/reviews', TrainerReviewRoute);

export const IndexRouters = router;