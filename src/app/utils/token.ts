import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import { envVars } from "../config/env";

//* Creating and getting access_token *//
const getAccessToken = (payload: JwtPayload) => {
  const access_token = jwtUtils.createToken(payload, envVars.ACCESS_TOKEN_SECRET, { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions);

  return access_token;
}

//* Creating and getting refresh_token *//
const getRefreshToken = (payload: JwtPayload) => {
  const refresh_token = jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);

  return refresh_token;
}

//* Setting the access token in the cookie *//
const setAccessTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 1000,     // 1 day 
  });
}

//* Setting the refresh token in the cookie *//
const setRefreshTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refresh_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 7* 1000,     // 7 days 
  })
}

//* Setting the better-auth session token in the cookie *//
const setBetterAuthSessionTokenCookie = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 24 * 1000,     // 1 day
  })
}


export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionTokenCookie
}