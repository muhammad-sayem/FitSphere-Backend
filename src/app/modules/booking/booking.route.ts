import { Router } from "express";
import { BookingController } from "./booking.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { CreateBookingZodSchema } from "./booking.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { UserRoles } from "../../../generated/prisma/client";

const router = Router();

router.post("/create-booking", validateRequest(CreateBookingZodSchema), checkAuth(UserRoles.USER), BookingController.createBooking);

router.get("/", BookingController.getAllBookings);

router.get("/user/my-bookings", checkAuth(UserRoles.USER), BookingController.getBookingsByUserId);

router.get("/trainer/:trainerId/bookings", BookingController.getBookingsByTrainerId);

router.patch("/update-booking/:bookingId", checkAuth(UserRoles.TRAINER), BookingController.updateBookingStatusToConfirm);

router.delete("/delete-booking/:bookingId", checkAuth(UserRoles.USER), BookingController.deleteBooking);

export const BookingRoute = router;
