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

//* Get all slots *//
const getAllSlots = catchAsync(
  async (req: Request, res: Response) => { 
    const result = await SlotService.getAllSlots(req.query);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Slots retrieved successfully",
      data: result
    });
  }
);

//* Get slot by slot ID *//
const getSlotById = catchAsync(
  async (req: Request, res: Response) => {
    const { slotId } = req.params;

    const result = await SlotService.getSlotById(slotId as string);
    
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Slot retrieved successfully",
      data: result
    });
  }
);

//* Get slots by trainer ID *//
const getSlotsByTrainerId = catchAsync(
  async (req: Request, res: Response) => { 
    const { trainerId } = req.params;
    const query = req.query;

    const result = await SlotService.getSlotsByTrainerId(trainerId as string, query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Slots retrieved successfully",
      data: result.data,
      meta: result.meta
    }); 
  }
);

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

//* Update SLot (booking) status to completed *//
const updateSlotStatusToCompleted = catchAsync(
  async(req: Request, res: Response) => {
    const user = req.user;
    const { slotId } = req.params;

    const result = await SlotService.updateSlotStatusToCompleted(user, slotId as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Slot status updated to completed successfully",
      data: result
    })
  }
)

//* Delete slot by trainer (own) *//
const deleteSlot = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { slotId } = req.params;

  const result = await SlotService.deleteSlot(user, slotId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Slot deleted successfully",
    data: result
  })
});


export const SlotController = {
  createSlot,
  getAllSlots,
  getSlotById,
  getSlotsByTrainerId,
  updateSlot,
  updateSlotStatusToCompleted,
  deleteSlot
}