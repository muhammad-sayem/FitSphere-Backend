import status from "http-status";
import { PaymentStatus, UserRoles } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma";

const getDashboardData = async (user: IRequestUser) => {
  let statsData;

  switch (user.role) {
    case UserRoles.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case UserRoles.TRAINER:
      statsData = await getTrainerStatsData(user);
      break;

    case UserRoles.USER:
      statsData = await getUserStatsData(user);
      break;

    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }

  return statsData;
}

// -------------------------------------------------------- //

const getAdminStatsData = async () => {
  const userCount = await prisma.user.count();
  const trainerCount = await prisma.trainerProfile.count();
  const productCount = await prisma.product.count();
  const bookingSlotCount = await prisma.bookingSlot.count();
  const orderCount = await prisma.order.count();
  const reviewCount = await prisma.review.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      status: PaymentStatus.SUCCEEDED
    }
  });

  const pieChartData = await getPieChartData();
  const barChartData = await getBarChartData();

  return {
    userCount,
    trainerCount,
    productCount,
    bookingSlotCount,
    orderCount,
    reviewCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    pieChartData,
    barChartData
  }
}


const getTrainerStatsData = async (user: IRequestUser) => {
  const trainerProfile = await prisma.trainerProfile.findUnique({
    where: {
      userId: user.userId
    },
  });

  if (!trainerProfile) {
    throw new AppError(status.NOT_FOUND, "Trainer profile not found");
  }

  const availableSlotCount = await prisma.slot.count({
    where: {
      trainerId: trainerProfile.id,
      isBooked: false
    }
  })

  const bookingCount = await prisma.bookingSlot.count({
    where: {
      trainerId: trainerProfile.id
    }
  });

  const myReceivedReviewCount = await prisma.review.count({
    where: {
      trainerId: trainerProfile.id
    }
  });

  return {
    availableSlotCount,
    bookingCount,
    myReceivedReviewCount
  }
};


const getUserStatsData = async (user: IRequestUser) => {
  const userProfile = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
  }
  );

  if (!userProfile) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const myBookingCount = await prisma.bookingSlot.count({
    where: {
      userId: user.userId
    }
  });

  const myOrderCount = await prisma.order.count({
    where: {
      userId: user.userId
    }
  });

  const myGivenReviewCount = await prisma.review.count({
    where: {
      userId: user.userId
    }
  });

  const myTotalSpentAmount = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      userId: user.userId,
      status: PaymentStatus.SUCCEEDED
    }
  });

  return {
    myBookingCount,
    myOrderCount,
    myGivenReviewCount,
    myTotalSpentAmount: myTotalSpentAmount._sum.amount || 0
  }
}

const getPieChartData = async () => {
  const bookingStatusDistribution = await prisma.bookingSlot.groupBy({
    by: ["status"],
    _count: {
      id: true
    }
  });

  return bookingStatusDistribution.map(({ _count, status }) => ({
    status,
    count: _count.id
  }));
};

const getBarChartData = async () => {
  const bookingByMonth = await prisma.$queryRaw<
    { month: Date; count: number }[]
  >`
    SELECT DATE_TRUNC('month', "createdAt") AS "month",
           CAST(COUNT(*) AS INTEGER) AS "count"
    FROM "booking_slots"
    GROUP BY "month"
    ORDER BY "month" ASC
  `;

  return bookingByMonth;
};


export const StatsService = {
  getDashboardData,
  getPieChartData,
  getBarChartData
}