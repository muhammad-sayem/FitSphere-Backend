import { Router } from "express";
import { OrderController } from "./order.controller";
import { changeOrderStatusZodSchema, createOrderZodSchema } from "./order.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-order", validateRequest(createOrderZodSchema), checkAuth(UserRoles.USER, UserRoles.TRAINER), OrderController.createOrder);

router.get("/user/my-orders", checkAuth(UserRoles.USER, UserRoles.TRAINER), OrderController.getOwnOrders);

router.get("/", checkAuth(UserRoles.ADMIN), OrderController.getAllOrders);

router.patch(
	"/update-order-status/:orderId",
	validateRequest(changeOrderStatusZodSchema),
	checkAuth(UserRoles.ADMIN),
	OrderController.changeOrderStatus
);

export const OrderRoute = router;