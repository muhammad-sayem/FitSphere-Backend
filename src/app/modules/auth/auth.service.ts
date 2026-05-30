/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
import { UserRoles, UserStatus } from "../../../generated/prisma/browser";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";

//* Register a new user *//
const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, image, email, password, role } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      image,
      email,
      password,
      role
    }
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: data.user.id
      }
    });

    const access_token = tokenUtils.getAccessToken({
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted
    });

    const refresh_token = tokenUtils.getRefreshToken({
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted
    });

    return {
      ...data,
      access_token,
      refresh_token,
      user
    }
  }

  catch (error: any) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Error creating user in database:", error.message);
  }

}

//* Login user *//
const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });

  if (data.user.status === UserStatus.BANNED) {
    throw new AppError(status.FORBIDDEN, "User is banned");
  }

  if (data.user.isDeleted) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const access_token = tokenUtils.getAccessToken({
    userId: data.user.id,
    name: data.user.name,
    image: data.user.image,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted
  });

  const refresh_token = tokenUtils.getRefreshToken({
    userId: data.user.id,
    name: data.user.name,
    image: data.user.image,
    email: data.user.email,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted
  });

  return {
    ...data,
    access_token,
    refresh_token
  }
}

//* Logout user *//
const logoutUser = async (session_token: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${session_token}`
    })
  });

  return result;
}

//* Get me *//
const getMe = async (user: IRequestUser) => {
  if (!user?.userId) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }

  const profile = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      isDeleted: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!profile) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (profile.role === UserRoles.USER) {
    const [bookings, orders, reviews, payments] = await Promise.all([
      prisma.bookingSlot.findMany({
        where: {
          userId: user.userId
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          trainerId: true,
          slotId: true,
          status: true,
          paymentStatus: true,
          feeAmount: true,
          transactionId: true,
          createdAt: true
        }
      }),
      prisma.order.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          productId: true,
          price: true,
          quantity: true,
          totalAmount: true,
          status: true,
          address: true,
          phone: true,
          transactionId: true,
          createdAt: true
        }
      }),
      prisma.review.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.payment.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          purpose: true,
          status: true,
          amount: true,
          provider: true,
          paidAt: true,
          createdAt: true
        }
      })
    ]);

    return {
      profile,
      roleData: {
        bookings,
        orders,
        reviews,
        payments
      }
    };
  }

  if (profile.role === UserRoles.TRAINER) {
    const trainerProfile = await prisma.trainerProfile.findFirst({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        bio: true,
        specialties: true,
        experience: true,
        feePerHour: true,
        avgRating: true,
        isApproved: true,
        slots: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        },
        bookings: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        },
        reviews: {
          orderBy: {
            createdAt: "desc"
          },
          take: 5
        }
      }
    });

    return {
      profile,
      roleData: trainerProfile
    };
  }

  const [userCount, trainerCount, bookingCount, orderCount, paymentCount, reviewCount] = await Promise.all([
    prisma.user.count(),
    prisma.trainerProfile.count(),
    prisma.bookingSlot.count(),
    prisma.order.count(),
    prisma.payment.count(),
    prisma.review.count()
  ]);

  // For admin: provide recent items for quick overview
  const [recentUsers, recentTrainers, recentBookings, recentPayments] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    }),
    prisma.trainerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        bio: true,
        specialties: true,
        isApproved: true,
        avgRating: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.bookingSlot.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, userId: true, trainerId: true, slotId: true, status: true, paymentStatus: true, feeAmount: true, createdAt: true }
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, userId: true, amount: true, status: true, purpose: true, provider: true, paidAt: true, createdAt: true }
    })
  ]);

  return {
    profile,
    roleData: {
      summary: {
        userCount,
        trainerCount,
        bookingCount,
        orderCount,
        paymentCount,
        reviewCount
      },
      recent: {
        users: recentUsers,
        trainers: recentTrainers,
        bookings: recentBookings,
        payments: recentPayments
      }
    }
  };
}

export const AuthService = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
};
