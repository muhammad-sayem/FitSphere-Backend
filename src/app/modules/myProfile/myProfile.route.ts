import { Router } from "express";
import { myProfileController } from "./myProfile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/browser";
import { EditMyProfileZodSchema } from "./myProfile.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.patch("/edit-my-profile", validateRequest(EditMyProfileZodSchema), checkAuth(UserRoles.USER, UserRoles.TRAINER, UserRoles.ADMIN), myProfileController.editMyProfile);

export const MyProfileRoute = router;