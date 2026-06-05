import { Router } from "express";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.get("/", checkAuth(UserRoles.ADMIN), UserControllers.getAllUsers);

export const UserRoute = router;