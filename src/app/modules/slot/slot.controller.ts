import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { SlotService } from "./slot.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

//* Create a new slot for a trainer (by trainer only) *//
const createSlot = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;

  const result = await SlotService.createSlot(user, payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Slot created successfully",
    data: result
  })
});

//* Update slot by trainer (own) *//
const updateSlot = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const { slotId } = req.params;

  const result = await SlotService.updateSlot(user, slotId as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Slot updated successfully",
    data: result
  })
});


export const SlotController = {
  createSlot,
  updateSlot
}