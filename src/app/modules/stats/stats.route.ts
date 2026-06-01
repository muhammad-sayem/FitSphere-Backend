import { Router } from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), StatsController.getDashboardData);

export const StatsRoute = router;