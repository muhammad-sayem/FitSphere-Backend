import { Router } from "express";
import { ProductController } from "./product.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.post('/create-product', ProductController.createProduct);

router.get('/', checkAuth(UserRoles.TRAINER), ProductController.getAllProducts);

export const ProductRouters = router;