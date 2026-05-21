import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";

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
    throw new Error("Failed to register user");
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: data.user.id,
        name,
        email,
        role
      }
    });

    return user;
  }

  catch (error) {
    console.error("Error creating user in database:", error);
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

  return data;
}

export const AuthService = {
  registerUser,
  loginUser
};
