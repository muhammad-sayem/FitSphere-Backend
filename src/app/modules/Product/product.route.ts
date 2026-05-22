import { Router } from "express";
import { ProductController } from "./product.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.post('/create-product', ProductController.createProduct);

router.get('/', ProductController.getAllProducts);

router.get('/:productId', ProductController.getProductById);

router.patch('/update-product/:productId', checkAuth(UserRoles.ADMIN), ProductController.updateProduct);

export const ProductRouters = router;