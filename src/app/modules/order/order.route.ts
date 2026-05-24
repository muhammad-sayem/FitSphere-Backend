import { Router } from "express";
import { OrderController } from "./order.controller";
import { createOrderZodSchema } from "./order.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-order", validateRequest(createOrderZodSchema), checkAuth(UserRoles.USER, UserRoles.TRAINER), OrderController.createOrder);

export const OrderRoute = router;