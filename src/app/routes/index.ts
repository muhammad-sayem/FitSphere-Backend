import { Router } from "express";
import { ProductRouters } from "../modules/product/product.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { TrainerProfileRoute } from "../modules/trainerProfile/trainerProfile.route";
import { SlotRoute } from "../modules/slot/slot.route";
import { TrainerReviewRoute } from "../modules/review/review.route";
import { BookingRoute } from "../modules/booking/booking.route";
import { OrderRoute } from "../modules/order/order.route";
import { UserRoute } from "../modules/user/user.route";
import { PaymentRoute } from "../modules/payment/payment.route";
import { StatsRoute } from "../modules/stats/stats.route";
import { MyProfileRoute } from "../modules/myProfile/myProfile.route";


const router = Router();

router.use('/products', ProductRouters);
router.use('/auth', AuthRoutes);
router.use('/trainer-profiles', TrainerProfileRoute);
router.use('/slots', SlotRoute);
router.use('/reviews', TrainerReviewRoute);
router.use('/bookings', BookingRoute);
router.use('/orders', OrderRoute);
router.use('/users', UserRoute);
router.use('/payments', PaymentRoute);
router.use('/stats', StatsRoute);
router.use('/my-profile', MyProfileRoute);

export const IndexRouters = router;