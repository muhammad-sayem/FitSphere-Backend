import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createProductZodSchema, updateProductZodSchema } from "./product.validation";
import { ProductController } from "./product.controller";

const router = Router();

router.post('/create-product', checkAuth(UserRoles.ADMIN), validateRequest(createProductZodSchema), ProductController.createProduct);

router.get('/', ProductController.getAllProducts);

router.get('/:productId', ProductController.getProductById);

router.patch('/update-product/:productId', validateRequest(updateProductZodSchema), checkAuth(UserRoles.ADMIN), ProductController.updateProduct);

router.delete('/delete-product/:productId', checkAuth(UserRoles.ADMIN), ProductController.deleteProduct);

export const ProductRouters = router;
