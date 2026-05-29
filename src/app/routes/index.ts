import { Router } from "express";
import { ProductRouters } from "../modules/product/product.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TrainerProfileRoute } from "../modules/trainerProfile/trainerProfile.route";
import { SlotRoute } from "../modules/slot/slot.route";
import { TrainerReviewRoute } from "../modules/review/review.route";
import { BookingRoute } from "../modules/booking/booking.route";
import { OrderRoute } from "../modules/order/order.route";
import { UserRoute } from "../modules/user/user.route";


const router = Router();

router.use('/products', ProductRouters);
router.use('/auth', AuthRoutes);
router.use('/trainer-profiles', TrainerProfileRoute);
router.use('/slots', SlotRoute);
router.use('/reviews', TrainerReviewRoute);
router.use('/bookings', BookingRoute);
router.use('/orders', OrderRoute);
router.use('/users', UserRoute);

export const IndexRouters = router;