import { Router } from "express";
import { TrainerProfileController } from "./trainerProfile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-trainer-profile", checkAuth(UserRoles.TRAINER), TrainerProfileController.createTrainerProfile);

router.get("/", TrainerProfileController.getAllTrainerProfiles);

router.get("/:trainerProfileId", TrainerProfileController.getTrainerByTrainerProfileId);

router.patch("/approval-control/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.approvalControlForTrainerProfile);

router.patch("/update-trainer-profile/:trainerProfileId", checkAuth(UserRoles.TRAINER), TrainerProfileController.updateTrainerProfile);

router.delete("/delete-trainer-profile/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.deleteTrainerProfile);



export const TrainerProfileRoute = router;