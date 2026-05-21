import { Router } from "express";
import { ProductRouters } from "../modules/Product/product.route";
import { AuthRoutes } from "../modules/auth/auth.route";


const router = Router();

router.use('/products', ProductRouters);
router.use('/auth', AuthRoutes);

export const IndexRouters = router;