/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
import { UserStatus } from "../../../generated/prisma/browser";
import { tokenUtils } from "../../utils/token";

//* Register a new user *//
const registerUser = async (payload: IRegisterUserPayload) => {
  const { name, email, password, role } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
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
    refresh_token
  }
}

export const AuthService = {
  registerUser,
  loginUser
};
