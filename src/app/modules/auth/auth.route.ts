import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post("/register", multerUpload.single("file"), AuthControllers.registerUser);

router.post("/login", AuthControllers.loginUser);

router.get("/me", checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), AuthControllers.getMe);

export const AuthRoutes = router;