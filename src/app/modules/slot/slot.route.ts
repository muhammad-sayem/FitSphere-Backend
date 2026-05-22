import { Router } from "express";
import { SlotController } from "./slot.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";
import { validateRequest } from "../../middleware/validateRequest";
import { createSlotZodSchema, updateSlotZodSchema } from "./slot.validation";

const router = Router();

router.post("/create-slot", validateRequest(createSlotZodSchema), checkAuth(UserRoles.TRAINER), SlotController.createSlot);

router.get("/", SlotController.getAllSlots);

router.get("/:slotId", SlotController.getSlotById);

router.get("/trainer/:trainerId", SlotController.getSlotsByTrainerId);

router.patch('/update-slot/:slotId', validateRequest(updateSlotZodSchema), checkAuth(UserRoles.TRAINER), SlotController.updateSlot);

export const SlotRoute = router;