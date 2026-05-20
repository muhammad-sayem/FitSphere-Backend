import { Router } from "express";
import { ProductRouters } from "../modules/Product/product.route";

const router = Router();

router.use('/products', ProductRouters);


export const IndexRouters = router;