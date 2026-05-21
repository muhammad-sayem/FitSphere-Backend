import { Request, Response } from "express";
import { AuthService } from "./auth.service";

//* Register a new user *//
const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.registerUser(payload);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

//* Login user *//
const loginUser = async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: result,
  });
};

export const AuthControllers = {
  registerUser,
  loginUser
};