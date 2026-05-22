import { Router } from "express";
import { TrainerProfileController } from "./trainerProfile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-trainer-profile", checkAuth(UserRoles.TRAINER), TrainerProfileController.createTrainerProfile);

router.get("/", TrainerProfileController.getAllTrainerProfiles);

export const TrainerProfileRoute = router;