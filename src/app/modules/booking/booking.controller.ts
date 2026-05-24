import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ICreateBookingPayload } from "./booking.interface";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

//* Create a new booking (By user only) *//
const createBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await BookingService.createBooking(user, payload as ICreateBookingPayload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Booking created successfully",
      data: result
    });
  }
);

//* Get all bookings (Admin only) *//
const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;

    const result = await BookingService.getAllBookings(query);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    });
  }
);

//* Get bookings by user ID (By user only) *//
const getBookingsByUserId = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await BookingService.getBookingsByUserId(user);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    });
  }
);

//* Get bookings by trainer ID (Public) *//
const getBookingsByTrainerId = catchAsync(
  async (req: Request, res: Response) => {
    const trainerId = req.params.trainerId;

    const result = await BookingService.getBookingsByTrainerId(trainerId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Bookings retrieved successfully",
      data: result
    });
  }
);

//* Update booking status to confirm (By trainer only) *//
const updateBookingStatusToConfirm = catchAsync(
  async (req: Request, res: Response) => {
    const trainer = req.user;
    const bookingId = req.params.bookingId;

    const result = await BookingService.updateBookingStatusToConfirm(trainer, bookingId as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Booking status updated to CONFIRM successfully",
      data: result
    });
  }
)

//* Delete booking by user (own) *//
const deleteBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const bookingId = req.params.bookingId;

    const result = await BookingService.deleteBooking(user, bookingId as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Booking deleted successfully",
      data: result
    });
  }
);

export const BookingController = {
  createBooking,
  getAllBookings,
  getBookingsByUserId,
  getBookingsByTrainerId,
  updateBookingStatusToConfirm,
  deleteBooking
};
