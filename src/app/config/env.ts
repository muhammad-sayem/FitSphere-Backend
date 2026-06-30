import dotenv from 'dotenv';
import status from 'http-status';
import AppError from '../errorHelpers/AppError';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
  FRONTEND_URL: string;
  STRIPE: {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  },
  // CLOUDINARY: {
  //   CLOUDINARY_CLOUD_NAME: string;
  //   CLOUDINARY_API_KEY: string;
  //   CLOUDINARY_API_SECRET: string;
  // }
}

const loadEnvVariables = (): EnvConfig => {

  const requireEnvVariable = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'ACCESS_TOKEN_EXPIRES_IN',
    'REFRESH_TOKEN_EXPIRES_IN',
    'BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN',
    'BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE',
    'FRONTEND_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    // 'CLOUDINARY_CLOUD_NAME',
    // 'CLOUDINARY_API_KEY',
    // 'CLOUDINARY_API_SECRET'
  ]

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
      throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
    }
  })

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string
    },
    // CLOUDINARY: {
    //   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    //   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    //   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string
    // }
  }
}

export const envVars = loadEnvVariables();