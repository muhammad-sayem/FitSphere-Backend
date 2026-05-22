import { Router } from "express";
import { SlotController } from "./slot.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-slot", checkAuth(UserRoles.TRAINER), SlotController.createSlot);

router.patch('/update-slot/:slotId', checkAuth(UserRoles.TRAINER), SlotController.updateSlot);

export const SlotRoute = router;