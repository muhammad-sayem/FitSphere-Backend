/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserRoles, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import status from "http-status";
import AppError from "../errorHelpers/AppError";
import { jwtUtils } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";

export const checkAuth = (...authRoles: (keyof typeof UserRoles)[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    //* Better-Auth Session Token Verification *//
    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");

    if (!sessionToken) {
      throw new Error("Unauthorized access! No session token provided");
    }

    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      });

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;

        const now = new Date();
        const createdAt = new Date(sessionExists.createdAt);
        const expiresAt = new Date(sessionExists.expiresAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader('X-session-Refresh', 'true');
          res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
          res.setHeader('X-Time-Remaining', timeRemaining.toString());

          console.log("Session Expiring Soon!!");
        }

        if (user.status === UserStatus.BANNED) {
          throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is banned.');
        }

        if (user.isDeleted) {
          throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is deleted');
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission to access this resource.')
        }

        req.user = {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }

    //* Access Token Verification *//
    const access_token = cookieUtils.getCookie(req, 'access_token');

    if (!access_token) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
    }

    const verifiedToken = jwtUtils.verifyToken(access_token, envVars.ACCESS_TOKEN_SECRET);

    if (!verifiedToken.success) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid access token.');
    }

    const decoded = verifiedToken.data as JwtPayload;

    if (authRoles.length > 0 && !authRoles.includes(decoded.role as UserRoles)) {
      throw new AppError(status.FORBIDDEN, 'Forbidden access!');
    }
    next();
  }
  catch (error: any) {
    next(error)
  }
} 