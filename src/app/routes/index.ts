import { Router } from "express";
import { ProductRouters } from "../modules/Product/product.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TrainerProfileRoute } from "../modules/trainerProfile/trainerProfile.route";


const router = Router();

router.use('/products', ProductRouters);
router.use('/auth', AuthRoutes);
router.use('/trainer-profiles', TrainerProfileRoute);

export const IndexRouters = router;