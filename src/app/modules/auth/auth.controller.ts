import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { tokenUtils } from "../../utils/token";

//* Register a new user *//
const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const rawData = req.body.data;
    const parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    const payload = {
      ...parsedData,
      image: req.file?.path
    };
    const result = await AuthService.registerUser(payload);

    //* Setting tokens in the cookie *//
    const { access_token, refresh_token, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, access_token);
    tokenUtils.setRefreshTokenCookie(res, refresh_token);
    tokenUtils.setBetterAuthSessionTokenCookie(res, token as string);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "User registered successfully",
      data: {
        access_token,
        refresh_token,        
        token,
        ...rest
      },
    });
  }
);

//* Login user *//
const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);

    const { access_token, refresh_token, token, ...rest } = result;

    //* Setting the access token, refresh token and better auth session token in the cookie *//
    tokenUtils.setAccessTokenCookie(res, access_token);
    tokenUtils.setRefreshTokenCookie(res, refresh_token);
    tokenUtils.setBetterAuthSessionTokenCookie(res, token);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        access_token,
        refresh_token,
        token,
        ...rest
      },
    });
  }
);

//* Get Me *//
const getMe = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User data (My data) retrieved successfully",
      data: result
    });
  }
)

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe
};
