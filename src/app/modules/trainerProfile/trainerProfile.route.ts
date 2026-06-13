import { Router } from "express";
import { TrainerProfileController } from "./trainerProfile.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { createTrainerProfileZodSchema } from "./trainerProfile.validation";

const router = Router();

router.post("/create-trainer-profile", validateRequest(createTrainerProfileZodSchema), checkAuth(UserRoles.TRAINER), TrainerProfileController.createTrainerProfile);

router.get("/", TrainerProfileController.getAllTrainerProfiles);

router.get("/from-users", checkAuth(UserRoles.ADMIN), TrainerProfileController.getAllTrainersFromUsers);

router.get("/:trainerProfileId", TrainerProfileController.getTrainerByTrainerProfileId);

router.get("/userId/:userId", checkAuth(UserRoles.USER, UserRoles.TRAINER), TrainerProfileController.getTrainerProfileByUserId);

router.get("/trainers/not-approved", checkAuth(UserRoles.ADMIN), TrainerProfileController.getNotApprovedTrainerProfiles);

router.patch("/approval-control/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.approvalControlForTrainerProfile);

router.patch("/update-trainer-profile/:trainerProfileId", checkAuth(UserRoles.TRAINER), TrainerProfileController.updateTrainerProfile);

router.delete("/delete-trainer-profile/:trainerProfileId", checkAuth(UserRoles.ADMIN), TrainerProfileController.deleteTrainerProfile);

export const TrainerProfileRoute = router;