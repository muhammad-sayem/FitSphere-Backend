import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.get("/my-payment", checkAuth(UserRoles.USER, UserRoles.TRAINER), PaymentController.getPaymentByUserId);

export const PaymentRoute = router;