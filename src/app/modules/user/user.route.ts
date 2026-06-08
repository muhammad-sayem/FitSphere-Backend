import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.get("/", checkAuth(UserRoles.ADMIN), UserControllers.getAllUsers);

router.patch("/change-user-status/:userId", checkAuth(UserRoles.ADMIN), UserControllers.changeUserStatus);

export const UserRoute = router;