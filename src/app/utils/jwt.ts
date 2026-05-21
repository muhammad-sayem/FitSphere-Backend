/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

//* Create Token *//
const createToken = (payload: JwtPayload, secret: string, {expiresIn}: SignOptions) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

//* Verify Token *//
const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    }
  } 

  catch (error: any) {
    return {
      success: false,
      message: error.message,
      error
    }
  }
}

//* Decode Token *//
const decodeToken = (token: string) => {
  const decoded = jwt.decode(token) as JwtPayload;
  return decoded;
}

export const jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
}