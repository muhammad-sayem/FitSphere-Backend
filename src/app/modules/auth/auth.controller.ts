import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

//* Register a new user *//
// const registerUser = catchAsync(
//   async (req: Request, res: Response) => {
//     const payload = req.body;
//     const result = await AuthService.registerUser(payload);

//     //* Setting tokens in the cookie *//
//     const { access_token, refresh_token, token, ...rest } = result;
//     tokenUtils.setAccessTokenCookie(res, access_token);
//     tokenUtils.setRefreshTokenCookie(res, refresh_token);
//     tokenUtils.setBetterAuthSessionTokenCookie(res, token as string);

//     sendResponse(res, {
//       httpStatusCode: status.CREATED,
//       success: true,
//       message: "User registered successfully",
//       data: {
//         access_token,
//         refresh_token,
//         token,
//         ...rest
//       },
//     });
//   }
// );
const registerUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerUser(payload);

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

//* Logout user *//
const logoutUser = catchAsync(
  async (req: Request, res: Response) => {
    const session_token = req.cookies['better-auth.session_token'];
    const result = await AuthService.logoutUser(session_token);

    cookieUtils.clearCookie(res, 'access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    cookieUtils.clearCookie(res, 'refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    cookieUtils.clearCookie(res, 'better-auth.session_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Logged out successfully!!",
      data: result
    });

  }
);

//* Change Password *//
const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const session_token = req.cookies['better-auth.session_token'];
    console.log("Session Token for change password: ", session_token)

    const result = await AuthService.changePassword(currentPassword, newPassword, session_token);
    console.log("Result After change password: ", result)

    // const { access_token, refresh_token, token } = result;

    // tokenUtils.setAccessTokenCookie(res, access_token);
    // tokenUtils.setRefreshTokenCookie(res, refresh_token);
    // tokenUtils.setBetterAuthSessionTokenCookie(res, token as string);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Password changed successfully",
      data: result
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
  logoutUser,
  changePassword,
  getMe
};
