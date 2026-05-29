import { Router } from "express";
import { UserControllers } from "./user.controller";

const router = Router();

router.get("/", UserControllers.getAllUsers);

export const UserRoute = router;